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
                    'Authorization': 'Basic ' + Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64') 
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

            updateHistory(); // Update history on server start
            setInterval(updateHistory,  1000 * 60 * 25);  // update every 25 minutes
            setInterval(updateUsers,    1000 * 60 * 60 * 24); // update daily
            setInterval(updateArtists,  1000 * 60 * 60 * 24);
        })
    })
    .catch((ex) => {
        console.error(ex.stack)
        process.exit(1)
    })

async function updateHistory() {
    const artists = await db.query(escape`SELECT artist_id FROM artists`);
    let artistSet = new Set(artists);


    console.log('Getting users');
    let users = await db.query(escape`SELECT * FROM users`);
    console.log(users)
    if(users !== undefined && users.length > 0) {
        users.forEach(async (user) => {
            console.log(`Getting access token from ${user.refresh_token}`)
            let authOptions = {
                url: 'https://accounts.spotify.com/api/token',
                headers: { 
                    'Authorization': 'Basic ' + Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64') 
                },
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
                            let trackIds = body0.items.map((item) => item.track.id )
                            if(trackIds.length > 0) {
                                // Get full track object, history only gets partial
                                let queryIds = trackIds.join(',');
                                const fetchTracks = await fetch('https://api.spotify.com/v1/tracks?ids=' + queryIds, {
                                    method: 'GET',
                                    headers: {
                                        Authorization: 'Bearer ' + body.access_token
                                    }
                                })
                                const tracks = await fetchTracks.json();
                                // Get audio features
                                const fetchFeatures = await fetch('https://api.spotify.com/v1/audio-features?ids=' + queryIds, {
                                    method: 'GET',
                                    headers: {
                                        Authorization: 'Bearer ' + body.access_token
                                    }
                                })
                                const features = await fetchFeatures.json();

                                let artistsTBA = [];

                                // Since tracks should return in same order as requested, we can use body loop
                                let res = new Promise((resolve, reject) => {
                                    body0.items.forEach(async (item, idx) => {
                                        let currTrack = tracks.tracks[idx];
                                        let currFeature = features.audio_features[idx];

                                        let date = item.played_at.substring(0, 10);
                                        let time = item.played_at.substring(11, 19);
                                        let artist_id = currTrack.artists[0].id;
                                        let artist_name = currTrack.artists[0].name;
                                        let image = currTrack.album.images[0].url;

                                        if(!artistSet.has(artist_id)) {
                                            artistSet.add(artist_id);
                                            artistsTBA.push(artist_id);
                                            console.log(artist_id);
                                        }

                                        db.query(escape`INSERT INTO history 
                                                                (user_id, date, time, album_type, artist_id, image,
                                                                duration, track_id, track_name, 
                                                                popularity, preview_url, artist_name,
                                                                energy, valence, album_id, album_name, release_date) 
                                                            VALUES (${user.id}, ${date}, ${time}, 
                                                                    ${currTrack.album.album_type}, ${artist_id}, ${image}, 
                                                                    ${currTrack.duration_ms}, 
                                                                    ${currTrack.id}, 
                                                                    ${currTrack.name}, ${currTrack.popularity}, 
                                                                    ${currTrack.preview_url}, 
                                                                    ${artist_name},
                                                                    ${currFeature.energy}, ${currFeature.valence},
                                                                    ${currTrack.album.id}, ${currTrack.album.name},
                                                                    ${currTrack.album.release_date})`)
                                        if(idx === body0.items.length - 1) {
                                            resolve();
                                        }
                                    })
                                }).then(async () => {
                                    let fetchBatchArtists = await fetch('https://api.spotify.com/v1/artists?ids=' + artistsTBA.join(','), {
                                        method: 'GET',
                                        headers: {
                                            Authorization: 'Bearer ' + body.access_token,
                                        }
                                    })
                                    let batchArtists = await fetchBatchArtists.json();
                                
                                    batchArtists.artists.forEach((a) => {
                                        db.query(escape`INSERT INTO artists (artist_id, artist_name, image, genres)
                                                        VALUES (${a.id}, ${a.name}, ${a.images[0].url}, ${JSON.stringify(a.genres)})`)

                                    })
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

async function updateUsers() {
    let fetchUsers = await db.query(escape`SELECT id, refresh_token FROM users`);
    let users = await fetchUsers.json();
    users.forEach(async (user) => {
        let fetchToken = await fetch('https://accounts.spotify.com/api/token', {
            headers: { 
                'Authorization': 'Basic ' + Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64') 
            },
            body: {
                grant_type: 'refresh_token',
                refresh_token: user.refresh_token
            }
        })
        let token = await fetchToken.json();

        let fetchProfile = await fetch('https://api.spotify.com/v1/me', {
            headers: {'Authorization': 'Bearer ' + token.access_token }
        })
        let profile = await fetchProfile.json();

        let image = profile.images.length > 0 ? profile.images[0].url : null;
        db.query(escape`UPDATE users SET image=${image}, name=${profile.display_name} WHERE id=${user.id}`);
    })
}

async function updateArtists() {
    let fetchArtists = await db.query(escape`SELECT artist_id FROM artists`);
    let artists = await fetchArtists.json();

    // Doesn't matter whose refresh token we get, we just need one to pull from API
    let fetchToken = await db.query(escape`SELECT refresh_token FROM users WHERE id='wrkk45w6rc45m90a6rs9sl9yy'`); 
    let token = await fetchToken.json();
    let fetchAccess = await fetch('https://accounts.spotify.com/api/token', {
        headers: { 
            'Authorization': 'Basic ' + Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64') 
        },
        body: {
            grant_type: 'refresh_token',
            refresh_token: token[0].refresh_token
        }
    });
    let access = await fetchAccess.json();
    
    let artistBatches = [];
    let batchStr = '';
    artists.forEach((artist, idx) => {
        batchStr += artist.artist_id;
        if((idx + 1) % 50 == 0 || idx + 1 == artists.length) { // get batches of 50
            artistBatches.push(batchStr);
            batchStr = '';
        } else {
            batchStr += ',';
        }
    })

    artistBatches.forEach(async (batch) => {
        let fetchBatchArtists = await fetch('https://api.spotify.com/v1/artists?ids=' + batch, {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + access_token,
            }
        })

        let batchArtists = await fetchBatchArtists.json();
    
        batchArtists.artists.forEach((a) => {
            db.query(escape`UPDATE artists SET artist_name=${a.name}, image=${a.images[0].url} WHERE artist_id=${a.id}`)
        })
    })
}
