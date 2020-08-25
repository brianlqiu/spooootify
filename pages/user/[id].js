import React, { useEffect } from 'react'
import { Bar } from 'react-chartjs-2';
import db from '../../lib/db'

const escape = require('sql-template-strings')

function changeArtistPicture(e) {
    console.log(e.target.getAttribute('img'));
    document.getElementById('artistPic').style.backgroundImage = 'url(' + e.target.getAttribute('img') + ')';
}

function scrollIntoViewWrapper(e) {
    document.querySelector('.' + e.target.getAttribute('dest')).scrollIntoView({behavior: 'smooth'});
}

function User({ profile, artistPlaycountDataset, top5Artists }) {
    console.log(profile);
    let img = profile[0].image == null ? '/profile.png' : profile[0].image;
    return (
        <div>
            <div id="main" >
                <div id='sidebar' className="pt-6 bg-gray-900 fixed h-full min-h-screen">
                    <div className="xl:py-2">
                        <img id='profile' className='object-center' src={img}></img>
                        <div className='pt-4 text-white text-xl object-center text-center'>{profile[0].name}</div>
                    </div>
                    <div className="xl:py-2">
                        <div className="object-center text-center xl:block uppercase font-bold text-white text-xs px-4 py-2">
                            Charts
                        </div>
                        <div dest='topArtists' className="group object-center relative sidebar-item with-children">
                            <a onClick={scrollIntoViewWrapper} dest='topArtists' className="block xl:flex xl:items-center object-center text-center xl:text-left shadow-light xl:shadow-none pl-4 py-6 xl:py-2 xl:px-4 border-l-4 border-transparent hover:bg-black">
                                <svg xmlns="http://www.w3.org/2000/svg" className="graph-icon icon icon-tabler icon-tabler-brush" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#FFFFFF" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z"/>
                                <path d="M3 21v-4a4 4 0 1 1 4 4h-4" />
                                <path d="M21 3a16 16 0 0 0 -12.8 10.2" />
                                <path d="M21 3a16 16 0 0 1 -10.2 12.8" />
                                <path d="M10.6 9a9 9 0 0 1 4.4 4.4" />
                                </svg>
                                <div dest='topArtists' className="text-white text-xs pl-2">Artists</div>
                            </a>
                        </div>
                        <div className="group relative sidebar-item with-children">
                            <a onClick={scrollIntoViewWrapper} dest='topArtists' className="block xl:flex xl:items-center text-center xl:text-left shadow-light xl:shadow-none py-6 xl:py-2 xl:px-4 border-l-4 border-transparent hover:bg-black">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="h-6 w-6 text-grey-darker fill-current xl:mr-2"><path d="M20 11.46V20a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-4h-2v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8.54A4 4 0 0 1 2 8V7a1 1 0 0 1 .1-.45l2-4A1 1 0 0 1 5 2h14a1 1 0 0 1 .9.55l2 4c.06.14.1.3.1.45v1a4 4 0 0 1-2 3.46zM18 12c-1.2 0-2.27-.52-3-1.35a3.99 3.99 0 0 1-6 0A3.99 3.99 0 0 1 6 12v8h3v-4c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v4h3v-8zm2-4h-4a2 2 0 1 0 4 0zm-6 0h-4a2 2 0 1 0 4 0zM8 8H4a2 2 0 1 0 4 0zm11.38-2l-1-2H5.62l-1 2h14.76z" className="heroicon-ui"></path></svg>
                                <div className="text-white text-xs">Store</div>
                            </a>
                        </div>
                        <div className="group relative sidebar-item with-children">
                            <a href="#" className="block xl:flex xl:items-center text-center xl:text-left shadow-light xl:shadow-none py-6 xl:py-2 xl:px-4 border-l-4 border-transparent hover:bg-black">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="h-6 w-6 text-grey-darker fill-current xl:mr-2"><path d="M12 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm9 11a1 1 0 0 1-2 0v-2a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v2a1 1 0 0 1-2 0v-2a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v2z" className="heroicon-ui"></path></svg>
                                <div className="text-white text-xs">Users</div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div className='pl-48 h-full grid grid-rows-5'>
                <div className='topArtists h-full grid grid-cols-2 gap-3'>
                    <div>
                        <div className='pl-16 pt-20 text-3xl font-semibold'>Your top artists</div>
                        {artistPlaycountDataset.labels.slice(0,5).map((artist, idx) => { 
                                let classes = 'pl-40 font-semibold text-' + (5 - idx); 
                                return <div className='pt-8'><a onClick={changeArtistPicture} className={classes} img={top5Artists[artist]}>{artist}</a></div>
                            }
                        )}
                    </div>
                    <div id='artistPic' style={{backgroundImage: 'url(' + top5Artists[artistPlaycountDataset.labels[0]] + ')'}}></div> 
                </div>
                <div className='topArtistGraph h-screen graph'>
                    <Bar 
                        width={40}
                        height={40}
                        data={artistPlaycountDataset}
                        options={{
                            maintainAspectRatio: false,
                            legend: {
                                labels: {
                                    fontColor: 'black'
                                }
                            },
                            scales: {
                                yAxes: [{
                                    ticks: {
                                        fontColor: 'black',
                                        beginAtZero: true,
                                    }
                                }],
                                xAxes: [{
                                    ticks: {
                                        fontColor: 'black'
                                    }
                                }]
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export async function getServerSideProps(context) {
    // Get user ID & access_token
    const id = context.params.id.substring(0, context.params.id.indexOf('access_token'));
    const access_token = context.params.id.substring(context.params.id.indexOf('access_token') + 'access_token='.length)

    // Fetch profile
    const fetchProfile = await fetch(`http://localhost:3000/api/users/${id}`);
    const profile = await fetchProfile.json();

    // By default, all data gotten will be for one week (will change later)
    let date = new Date();
    let start = date.toISOString().substring(0, 10);
    date.setDate(date.getDate() - 7);
    let end = date.toISOString().substring(0, 10);

    // Fetch play count for artist
    const fetchArtistPlaycount = await fetch(`http://localhost:3000/api/history/artistplaycount/${id}/${start}/${end}`);
    const artistPlaycount = await fetchArtistPlaycount.json();

    let artistNames = [];
    let artistPlaycounts = [];
    for(let i = 0; i < artistPlaycount.length; i++) {
        artistNames.push(artistPlaycount[i].artist_name);
        artistPlaycounts.push(artistPlaycount[i]['COUNT(artist_id)']);
    }
    // Format data for chart
    let artistPlaycountDataset = {
        labels: artistNames,
        datasets: [
            {
                label: 'Play Count',
                data: artistPlaycounts,
                backgroundColor: 'rgba(45,55,72,0.6)',
                hoverBackgroundColor: 'rgba(45,55,72,0.8)',
            }
        ]
    }

    // Try fetching top 5 artists from database; if doesn't exist, fetch from API and store in database
    // Don't store all artists because we don't really need to waste API calls/storage storing all artists, since we 
    // only display first 5 anyway
    const top5Artists = {};
    let top5Ids = [];
    for(let i = 0; i < 5; i++) {
        let fetchArtist = await fetch(`http://localhost:3000/api/artists/${artistPlaycount[i].artist_id}`);
        let artist = await fetchArtist.json();

        if(artist.length == 0) {
            top5Ids.push(artistPlaycount[i].artist_id); // store id so we can batch in single API call, not multiple
        } else {
            top5Artists[artist[0].artist_name] = artist[0].image;
        }
    }
    // Some artists not in database, fetch their data and store in database
    if(top5Ids.length > 0) {
        const fetchArtists = await fetch('https://api.spotify.com/v1/artists?ids=' + top5Ids.join(','), {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + access_token,
            }
        })
        const artists = await fetchArtists.json();
        for(let i = 0; i < artists.artists.length; i++) {
            let a = artists.artists[i];
            top5Artists[a.name] = a.images[0].url;
            db.query(escape`INSERT INTO artists (artist_id, artist_name, image)
                            VALUES(${a.id}, ${a.name}, ${a.images[0].url})`)
        }
    }
    
    return { props: { profile, artistPlaycountDataset, top5Artists} };
}

export default User;