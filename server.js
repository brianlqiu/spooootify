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
                        let id = body2.id;
                        let image = body2.images.length > 0 ? body2.images[0].url : null;
                        let check = await db.query(escape`SELECT id FROM users WHERE id=${id}`);
                        if(check.length == 0) {
                            db.query(escape`INSERT INTO users (id, refresh_token, last_updated, image, name) 
                                            VALUES (${id}, ${body.refresh_token}, ${null}, ${image}, 
                                                    ${body2.display_name})`);
                            updateHistory();
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
        
            request.post(authOptions, (err, resp, body) => {
                if(!err && resp.statusCode === 200) {
                    let lastUpdated = user.last_updated == null ? null : new Date(user.last_updated)
                    let options = {
                        url: `https://api.spotify.com/v1/me/player/recently-played?limit=50${lastUpdated == null ? '' : '&after=' + lastUpdated.getTime()}`,
                        headers: { 'Authorization': 'Bearer ' + body.access_token },
                        json: true
                    }
                    let newLastUpdated = new Date();
                    newLastUpdated.setHours(newLastUpdated.getHours() - 7);
                    let newTimestamp = newLastUpdated.toISOString().substring(0, 19).replace('T', ' ');
                    request.get(options, async (err0, resp0, body0) => {
                        if(!err0 && resp0.statusCode === 200) {
                            // We need to get full track info, make additional API call
                            let trackIds = body0.items.map((item) => item.track.id )
                            if(trackIds.length > 0) {
                                const fetchTracks = await fetch('https://api.spotify.com/v1/tracks?ids=' + trackIds.join(','), {
                                    method: 'GET',
                                    headers: {
                                        Authorization: 'Bearer ' + body.access_token
                                    }
                                })
                                const tracks = await fetchTracks.json();
                                // Since tracks should return in same order as requested, we can use body loop
                                body0.items.forEach((item, idx) => {
                                    let currTrack = tracks.tracks[idx];

                                    let date = item.played_at.substring(0, 10);
                                    let time = item.played_at.substring(11, 19);
                                    let artist_id = currTrack.artists[0].id;
                                    let artist_name = currTrack.artists[0].name;
                                    let image = currTrack.album.images[0].url;

                                    db.query(escape`INSERT INTO history 
                                                            (user_id, date, time, album_type, artist_id, image,
                                                            album_name, duration, explicit, track_id, track_name, 
                                                            popularity, preview_url, release_date, artist_name) 
                                                        VALUES (${user.id}, ${date}, ${time}, 
                                                                ${currTrack.album.album_type}, ${artist_id}, ${image}, 
                                                                ${currTrack.album.name}, ${currTrack.duration_ms}, 
                                                                ${currTrack.explicit}, ${currTrack.id}, 
                                                                ${currTrack.name}, ${currTrack.popularity}, 
                                                                ${currTrack.preview_url}, 
                                                                ${currTrack.album.release_date}, ${artist_name})`)
                                })
                                console.log('New timestamp: ' + newTimestamp);
                                db.query(escape`UPDATE users
                                                SET last_updated=${newTimestamp}
                                                WHERE id=${user.id}`)

    
                            }
                        } else {
                            console.log(err);
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
