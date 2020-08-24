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

const db = require('./lib/db')
const escape = require('sql-template-strings');

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
                if (!err && resp.statusCode === 200) {
                    let options = {
                        url: 'https://api.spotify.com/v1/me',
                        headers: {'Authorization': 'Bearer ' + body.access_token },
                        json: true
                    };

                    request.get(options, async (error, response, body2) => {
                        id = body2.id;
                        let check = await db.query(escape`SELECT * FROM users WHERE id=${id}`);
                        if(check.length == 0) {
                            db.query(escape`INSERT INTO users (id, refresh_token, last_updated) 
                                        VALUES (${id}, ${body.refresh_token}, ${null})`);
                            updateHistory();
                            res.redirect(`/user/${id}` + querystring.stringify({access_token: body.access_token}));
                        } 
                        res.redirect(`/user/${id}` + querystring.stringify({access_token: body.access_token}));
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

function getAccessToken(refresh_token) {
    let authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64')) },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    }

    request.post(authOptions, (err, resp, body) => {
        if(!err && resp.statusCode === 200) {
            console.log(body);
            return body.access_token;
        } else {
            console.log(err);
            return null;
        }
    })
}

async function updateHistory() {
    console.log('Getting users');
    let users = await db.query(escape`SELECT * FROM users`);
    console.log(users)
    if(users !== undefined && users.length > 0) {
        users.forEach(async (user) => {
            console.log(`Getting access token from ${user.refresh_token}`)
            let authOptions = {
                url: 'https://accounts.spotify.com/api/token',
                headers: { 'Authorization': 'Basic ' + (new Buffer(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64')) },
                form: {
                    grant_type: 'refresh_token',
                    refresh_token: user.refresh_token
                },
                json: true
            }

            let last_updated = user.last_updated == null ? null : new Date(user.last_updated);
            console.log(last_updated);
        
            request.post(authOptions, (err, resp, body) => {
                if(!err && resp.statusCode === 200) {
                    let options = {
                        url: 'https://api.spotify.com/v1/me/player/recently-played?limit=50',
                        headers: { 'Authorization': 'Bearer ' + body.access_token },
                        json: true
                    }
        
                    request.get(options, (err0, resp0, body0) => {
                        let updated_timestamp = false;
                        let new_timestamp;
                        body0.items.forEach((item) => {
                            // Only add if haven't added yet (null) or current timestamp > last updated timestamp 
                            // (since we don't know if user listened to 50 songs in last 30 minutes (probably not), 
                            // we would get invalid duplicates)
                            let playedAt = new Date(item.played_at);
                            if(last_updated == null || last_updated < playedAt) {
                                // take the latest timestamp in this pull and save it; since items are sorted by
                                // recency it'll be the first
                                if(!updated_timestamp) { 
                                    new_timestamp = playedAt.toISOString().substring(0, 19).replace('T', ' ');
                                    console.log(new_timestamp);
                                    updated_timestamp = true;
                                }
                                let date = item.played_at.substring(0, 10);
                                let time = item.played_at.substring(11, 19);
                                console.log(`Adding ${user.id}, ${item.track.id}, ${date}`);
                                console.log(item.track);
                                db.query(escape`INSERT INTO history (user_id, date, time, track) 
                                                VALUES (${user.id}, ${date}, ${time}, ${JSON.stringify(item.track)})`)
                            }
                        })
                        if(updated_timestamp) {
                            console.log('New timestamp: ' + new_timestamp);
                            db.query(escape`UPDATE users
                                        SET last_updated=${new_timestamp}
                                        WHERE id=${user.id}`)
                        }
                    })
                } else {
                    console.log(err);
                }
            })
        })
    }
}

updateHistory();
setInterval(updateHistory, 1000 * 60 * 25); 
