const express = require('express')
const next = require('next')
const cors = require('cors')
const PORT = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const cookieParser = require('cookie-parser')
const querystring = require('querystring')
const request = require('request');

const SpotifyWebApi = require('spotify-web-api-node');
const { query, response } = require('express');

const db = require('./lib/db')
const escape = require('sql-template-strings')

function generateRandomString(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

let stateKey = 'spotify_auth_state'

app.prepare()
    .then(() => {
        const server = express()
            .use(cors())
            .use(cookieParser())

        server.get('/login', (req, res) => {
            let state = generateRandomString(16);
            res.cookie(stateKey, state);


            res.redirect('https://accounts.spotify.com/authorize?' +
                querystring.stringify({
                    response_type: 'code',
                    client_id: process.env.CLIENT_ID,
                    scope: 'user-read-recently-played',
                    redirect_uri: 'http://localhost:3000/callback'
                }))
        })

        server.get('/callback', (req, res) => {
            let code = req.query.code || null;
            let state = req.query.state || null;
            let storedState = req.qookies ? req.cookies[stateKey] : null;

            let authOptions = {
                url: 'https://accounts.spotify.com/api/token',
                form: {
                    code: code,
                    redirect_uri: 'http://localhost:3000/callback',
                    grant_type: 'authorization_code'
                },
                headers: {
                    'Authorization': 'Basic ' + (new Buffer(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'))
                },
                json: true
            }

            request.post(authOptions, (err, resp, body) => {
                if (!err && response.statusCode === 200) {
                    let spotify = new SpotifyWebApi({
                        clientId: process.env.CLIENT_ID,
                        clientSecret: process.env.CLIENT_SECRET,
                        redirectUri: 'http://localhost:3000/callback'
                    })

                    spotify.setAccessToken(body.access_token);

                    spotify.getMe()
                        .then((data) => {
                            id = data.body.id;
                            refresh_token = body.refresh_token;
                            db.query(escape`
                                    INSERT INTO users (id, refresh_token, history)
                                    VALUES (${id}, ${refresh_token}, ${null});
                                `)
                            res.redirect(`/user/${id}` + querystring.stringify({
                                access_token: body.access_token,
                                refresh_token: body.refresh_token
                            }))
                        })
                }
            })



        })

        server.get('*', (req, res) => {
            return handle(req, res)
        })

        server.listen(PORT, (err) => {
            if (err) throw err
            console.log('> Ready on http://localhost:3000')
        })
    })
    .catch((ex) => {
        console.error(ex.stack)
        process.exit(1)
    })