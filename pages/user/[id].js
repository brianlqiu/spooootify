import React, { useEffect } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2';

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
                            
                        </div>
                        <div className="group relative sidebar-item with-children">
                           
                        </div>
                    </div>
                </div>
            </div>
            <div className='pl-48 h-full grid grid-rows-5'>
                <div className='topArtists h-full grid grid-cols-2 gap-3'>
                    <div>
                        <div className='pl-16 pt-20 text-3xl font-semibold'>Your top artists were:</div>
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
    
    // Get images for top 5 artists
    const top5Artists = {};
    for(let i = 0; i < 5; i++) {
        let fetchPicture = await fetch(`http://localhost:3000/api/artists/${artistPlaycount[i].artist_id}`)
        let picture = await fetchPicture.json();
        console.log(picture[0]);
        top5Artists[picture[0].artist_name] = picture[0].image;
    }

    // Fetch play count for album
    const fetchAlbumPlaycount = await fetch(`http://localhost:3000/api/history/albumplaycount/${id}/${start}/${end}`);
    const albumPlaycount = await fetchAlbumPlaycount.json();
    
    // Format album play count data for chart
    let albumNames = [];
    let albumPlaycounts = [];
    for(let i = 0; i < albumPlaycount.length; i++) {
        albumNames.push(artistPlaycount[i].artist_name);
        albumPlaycounts.push(albumPlaycount[i]['COUNT(album_id)']);
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
    
    return { props: { profile, artistPlaycountDataset, top5Artists} };
}

export default User;