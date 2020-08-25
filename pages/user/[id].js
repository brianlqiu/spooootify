import React, { useEffect } from 'react'
import Sidebar from '../../components/sidebar'
import { Bar } from 'react-chartjs-2';

function changeArtistPicture(e) {
    console.log(e.target.getAttribute('img'));
    document.getElementById('artistPic').style.backgroundImage = 'url(' + e.target.getAttribute('img') + ')';
}

function User({ profile, topArtistData, artistImages }) {

    return (
        <div>
            <Sidebar profile={profile}/>
            <div class='pl-64 h-full grid grid-rows-5 gap-3'>
                <div className='topArtists h-screen grid grid-cols-2 gap-3'>
                    <div>
                        <div className='pl-16 pt-20 text-3xl font-semibold'>Your top five artists of the last week:</div>
                        {topArtistData.labels.slice(0,5).map((artist, idx) => { 
                                let classes = 'pl-40 pt-16 font-semibold text-' + (5 - idx); 
                                return <div className='pt-8'><a onClick={changeArtistPicture} className={classes} img={artistImages[artist]}>{artist}</a></div>
                            }
                        )}
                    </div>
                    <div id='artistPic'></div> 
                </div>
                <div className='topArtistGraph h-screen graph'>
                    <Bar 
                        width={10}
                        height={50}
                        data={topArtistData}
                        options={{ maintainAspectRatio: false }}
                    />
                </div>
            </div>
        </div>
    )
}

export async function getServerSideProps(context) {
    const id = context.params.id.substring(0, context.params.id.indexOf('access_token'));
    const access_token = context.params.id.substring(context.params.id.indexOf('access_token') + 'access_token='.length)

    let now = new Date();
    let start = now.toISOString().substring(0, 10)
    now.setTime(now.getDate() - 7);
    let end = now.toISOString().substring(0, 10);
    const res = await fetch(`http://localhost:3000/api/date/${id}/${start}/${end}`);
    const data = await res.json();

    data.forEach((entry) => { entry.track = JSON.parse(entry.track); })

    const fetch_profile = await fetch('https://api.spotify.com/v1/me', {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + access_token
        }
    })
    const profile = await fetch_profile.json();

    let artistIds = {};
    let topArtistCount = {};
    data.forEach((entry) => {
        let artist = entry.track.artists[0].name;
        if(artist in topArtistCount) {
            topArtistCount[artist] += 1;
        } else {
            topArtistCount[artist] = 1;
        }
        artistIds[artist] = entry.track.artists[0].id;
    })

    let artists = Object.keys(topArtistCount).sort((a, b) => { return topArtistCount[b] - topArtistCount[a]; })
    let values = Object.values(topArtistCount).sort((a, b) => { return b - a; });

    let topArtistData = {
        labels: artists,
        datasets: [ 
            { 
                label: 'Play Count',
                data: values
            } 
        ]
    }

    let top5Ids = [];
    for(let i = 0; i < 5; i++) {
        top5Ids.push(artistIds[artists[i]]);
    }

    const artistsData = await fetch('https://api.spotify.com/v1/artists?ids=' + top5Ids.join(','), {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + access_token
        }
    })
    const artistsJson = await artistsData.json();

    let artistImages = {};
    for(let i = 0; i < 5; i++) {
        let artist = artistsJson.artists[i];
        artistImages[artist.name] = artist.images[0].url;
    }

    console.log(artistImages);
    
    return { props: { profile, topArtistData, artistImages} };
}

export default User;