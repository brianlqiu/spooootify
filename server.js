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

app.prepare()
    .then(() => {
        const server = express()
            .use(cors())
            .use(cookieParser())

        server.get('/login', (req, res) => {
            res.redirect('https://accounts.spotify.com/authorize?' +
                querystring.stringify({
                    response_type: 'code',
                    client_id: process.env.CLIENT_ID,
                    scope: 'user-read-recently-played',
                    redirect_uri: `${process.env.BASE_URL}/callback`, 
                }));
        });

        server.get('/callback', async (req, res) => {
            let code = req.query.code || null;
            const authRequest = await fetch(`https://accounts.spotify.com/api/token?grant_type=authorization_code&&code=${code}&&redirect_uri=${process.env.BASE_URL}/callback`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded', 
                },
            });

            const auth = await authRequest.json();
            
            const profileRequest = await fetch('https://api.spotify.com/v1/me', {
                headers: { 
                    'Authorization': 'Bearer ' + auth.access_token,
                    'Content-Type': 'application/x-www-form-urlencoded', 
                }
            });

            const profile = await profileRequest.json();

            let id = profile.id;
            let image = profile.images.length > 0 ? profile.images[0].url : null;
            let check = await db.query(escape`SELECT id FROM users WHERE id=${id}`);
            if(check.length == 0) {
                let userQuery = await db.query(escape`INSERT INTO users (id, refresh_token, last_updated, image, name)
                                                                 VALUES (${id}, ${auth.refresh_token}, ${null}, ${image}, ${profile.display_name})`);
                let updateResp = await updateHistory();
                console.log(userQuery);
                console.log(updateResp);
            }
            res.redirect(`/user/${id}` + querystring.stringify({access_token: auth.access_token}));

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
            
            const requestAuth = await fetch(`https://accounts.spotify.com/api/token?grant_type=refresh_token&&refresh_token=${user.refresh_token}`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded', 
                },
            });

            const auth = await requestAuth.json();
            
            let lastUpdated = user.last_updated == null ? null : new Date(user.last_updated);
            let afterQuery = user.last_updated == null ? '' : '&after=' + new Date(user.last_updated).getTime();
            const requestUserHistory = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=50${afterQuery}`, {
                headers: { 
                    'Authorization': 'Bearer ' + auth.access_token,
                    'Content-Type': 'application/x-www-form-urlencoded', 
                },
            });

            console.log(requestUserHistory);

            const userHistory = await requestUserHistory.json();

            let newLastUpdated = new Date();
            newLastUpdated.setHours(newLastUpdated.getHours() - 7);
            let newTimestamp = newLastUpdated.toISOString().substring(0, 19).replace('T', ' ');
            
            let trackIds = userHistory.items.map((item) => item.track.id);
            if(trackIds.length > 0) {
                let queryIds = trackIds.join(',');
                const tracksRequest = await fetch(`https://api.spotify.com/v1/tracks?ids=${queryIds}` , {
                    headers: { 
                        'Authorization': 'Bearer ' + auth.access_token,
                        'Content-Type': 'application/x-www-form-urlencoded', 
                    }
                });
                const tracks = await tracksRequest.json();
                
                const featuresRequest = await fetch(`https://api.spotify.com/v1/audio-features?ids=${queryIds}`, {
                    headers: { 
                        'Authorization': 'Bearer ' + auth.access_token, 
                        'Content-Type': 'application/x-www-form-urlencoded', 
                    } 
                });
                const features = await featuresRequest.json();

                let artistsTBA = [];

                let res = new Promise((resolve, reject) => {
                    userHistory.items.forEach(async (item, idx) => {
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
                        }

                        let resp = await db.query(escape`INSERT INTO history 
                                                                        (user_id, date, time,
                                                                        album_type, artist_id, image,
                                                                        duration, track_id, track_name,
                                                                        popularity, preview_url, artist_name,
                                                                        energy, valence, album_id, 
                                                                        album_name, release_date)
                                                               VALUES  (${user.id}, ${date}, ${time},
                                                                        ${currTrack.album.album_type}, ${artist_id}, ${image},
                                                                        ${currTrack.duration_ms}, ${currTrack.id}, ${currTrack.name},
                                                                        ${currTrack.popularity}, ${currTrack.preview_url}, ${artist_name},
                                                                        ${currFeature.energy}, ${currFeature.valence}, ${currTrack.album.id},
                                                                        ${currTrack.album.name}, ${currTrack.album.release_date})`);
                        console.log(resp); 
                        if(idx === userHistory.items.length - 1) { resolve(); }
                    });
                }).then(async () => {
                    const batchArtistsRequest = await fetch(`https://api.spotify.com/v1/artists?ids=${artistsTBA.join(',')}`, {
                        headers: { 
                            'Authorization': 'Bearer ' + auth.access_token,
                            'Content-Type': 'application/x-www-form-urlencoded', 
                        }
                    });
                    const batchArtists = await batchArtistsRequest.json();
                    batchArtists.artists.forEach((artist) => {
                        db.query(escape`INSERT INTO artists (artist_id, artist_name, image, genres)
                                                    VALUES  (${artist.id}, ${artist.name}, ${artist.images[0].url}, ${JSON.stringify(artist.genres)})`)
                    });
                });
                
                db.query(escape`UPDATE users SET last_updated=${newTimestamp} WHERE id=${user.id}`);
            }
        })
    }
}

async function updateUsers() {
    let fetchUsers = await db.query(escape`SELECT id, refresh_token FROM users`);
    let users = await fetchUsers.json();
    users.forEach(async (user) => {
        let requestToken = await fetch(`https://accounts.spotify.com/api/token?grant_type=refresh_token&&refresh_token=${user.refresh_token}`, {
            headers: { 
                'Authorization': 'Basic ' + Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded', 
            },
        })
        let token = await requestToken.json();

        let requestProfile = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': 'Bearer ' + token.access_token,
                'Content-Type': 'application/x-www-form-urlencoded', 
            }
        })
        let profile = await requestProfil.json();

        let image = profile.images.length > 0 ? profile.images[0].url : null;
        db.query(escape`UPDATE users SET image=${image}, name=${profile.display_name} WHERE id=${user.id}`);
    });
}

async function updateArtists() {
    let fetchArtists = await db.query(escape`SELECT artist_id FROM artists`);
    let artists = await fetchArtists.json();

    // Doesn't matter whose refresh token we get, we just need one to pull from API
    let fetchToken = await db.query(escape`SELECT refresh_token FROM users WHERE id='wrkk45w6rc45m90a6rs9sl9yy'`); 
    let token = await fetchToken.json();
    let fetchAccess = await fetch(`https://accounts.spotify.com/api/token?grant_type=refresh_token&&refresh_token=${token[0].refresh_token}`, {
        headers: { 
            'Authorization': 'Basic ' + Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'), 
            'Content-Type': 'application/x-www-form-urlencoded', 
        },
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
                'Authorization': 'Bearer ' + access_token,
                'Content-Type': 'application/x-www-form-urlencoded', 
            }
        })

        let batchArtists = await fetchBatchArtists.json();
    
        batchArtists.artists.forEach((a) => {
            db.query(escape`UPDATE artists SET artist_name=${a.name}, image=${a.images[0].url} WHERE artist_id=${a.id}`)
        })
    })
}
