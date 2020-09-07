import React, { useEffect } from 'react'
import { Bar, Doughnut, Polar, Line } from 'react-chartjs-2';

const escape = require('sql-template-strings')

function changeArtistPicture(e) {
    document.getElementById('artistPic').style.backgroundImage = 'url(' + e.target.getAttribute('img') + ')';
}

function changeAlbumPicture(e) {
    document.getElementById('albumPic').style.backgroundImage = 'url(' + e.target.getAttribute('img') + ')';
}

function changeTrackPicture(e) {
    document.getElementById('trackPic').style.backgroundImage = 'url(' + e.target.getAttribute('img') + ')';
}

function scrollIntoViewWrapper(e) {
    document.querySelector('.' + e.target.getAttribute('dest')).scrollIntoView({behavior: 'smooth'});
}

function User({ profile, artistPlaycountDataset, top5Artists, albumPlaycountDataset, top5Albums, trackPlaycountDataset, top5Tracks, genreDataset, valenceDataset }) {
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
                        <div dest='topAlbums' className="group object-center relative sidebar-item with-children">
                            <a onClick={scrollIntoViewWrapper} dest='topAlbums' className="block xl:flex xl:items-center object-center text-center xl:text-left shadow-light xl:shadow-none pl-4 py-6 xl:py-2 xl:px-4 border-l-4 border-transparent hover:bg-black">
                                <img className='sidebaricon' src='/album.svg'/>
                                <div dest='topAlbums' className="text-white text-xs pl-2">Albums</div>
                            </a>
                        </div>
                        <div dest='topTracks' className="group object-center relative sidebar-item with-children">
                            <a onClick={scrollIntoViewWrapper} dest='topTracks' className="block xl:flex xl:items-center object-center text-center xl:text-left shadow-light xl:shadow-none pl-4 py-6 xl:py-2 xl:px-4 border-l-4 border-transparent hover:bg-black">
                                <img className='sidebaricon' src='/track.svg'/>
                                <div dest='topTracks' className="text-white text-xs pl-2">Tracks</div>
                            </a>
                        </div>
                        <div dest='genresChart' className="group object-center relative sidebar-item with-children">
                            <a onClick={scrollIntoViewWrapper} dest='genresChart' className="block xl:flex xl:items-center object-center text-center xl:text-left shadow-light xl:shadow-none pl-4 py-6 xl:py-2 xl:px-4 border-l-4 border-transparent hover:bg-black">
                                <img className='sidebaricon' src='/genre.svg'/>
                                <div dest='genresChart' className="text-white text-xs pl-2">Genres</div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div className='pl-48 h-screen grid grid-rows-8'>
                <div className='topArtists h-screen grid grid-cols-2 gap-3'>
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
                <div className='topAlbums h-screen grid grid-cols-2 gap-3'>
                    <div>
                        <div className='pl-16 pt-20 text-3xl font-semibold'>Your top albums were:</div>
                        {albumPlaycountDataset.labels.slice(0,5).map((album, idx) => { 
                                let classes = 'pl-40 font-semibold text-' + (2 - idx); 
                                return <div className='pt-8'><a onClick={changeAlbumPicture} className={classes} img={top5Albums[album]}>{album}</a></div>
                            }
                        )}
                    </div>
                    <div id='albumPic' style={{backgroundImage: 'url(' + top5Albums[albumPlaycountDataset.labels[0]] + ')'}}></div> 
                </div>
                <div className='topAlbumGraph h-screen graph'>
                    <Bar 
                        width={40}
                        height={40}
                        data={albumPlaycountDataset}
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

                <div className='topTracks h-screen grid grid-cols-2 gap-3'>
                    <div>
                        <div className='pl-16 pt-20 text-3xl font-semibold'>Your top tracks were:</div>
                        {trackPlaycountDataset.labels.slice(0,5).map((track, idx) => { 
                                let classes = 'pl-40 font-semibold text-' + (2 - idx); 
                                return <div className='pt-8'><a onClick={changeTrackPicture} className={classes} img={top5Tracks[track]}>{track}</a></div>
                            }
                        )}
                    </div>
                    <div id='trackPic' style={{backgroundImage: 'url(' + top5Tracks[trackPlaycountDataset.labels[0]] + ')'}}></div> 
                </div>
                <div className='topTracksGraph h-screen graph'>
                    <Bar 
                        width={40}
                        height={40}
                        data={trackPlaycountDataset}
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

                <div className='genresChart h-screen graph'>
                    <Polar
                        width={40}
                        height={40}
                        data={genreDataset}
                        options={{
                            maintainAspectRatio: false,
                            legend: {
                                labels: {
                                    fontColor: 'black'
                                }
                            },
                        }}
                    />
                </div>

                <div className='graph'>
                    <Line 
                        width={40}
                        height={40}
                        data={valenceDataset}
                        options={{
                            maintainAspectRatio: false,
                            legend: {
                                labels: {
                                    fontColor: 'black'
                                }
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
    date.setDate(date.getDate() + 1);
    let start = date.toISOString().substring(0, 10);
    date.setDate(date.getDate() - 7);
    let end = date.toISOString().substring(0, 10);

    // Fetch play count for artist
    const fetchArtistPlaycount = await fetch(`http://localhost:3000/api/history/artistplaycount/${id}/${start}/${end}`);
    const artistPlaycount = await fetchArtistPlaycount.json();

    let artistNames = [];
    let artistPlaycounts = [];
    let genrePercentage = {};
    let top5Artists = {};
    for(let i = 0; i < artistPlaycount.length; i++) {
        let fetchArtist = await fetch(`http://localhost:3000/api/artists/${artistPlaycount[i].artist_id}`)
        let artist = await fetchArtist.json();
        if(i < 5) { top5Artists[artist[0].artist_name] = artist[0].image; }
        let genres = JSON.parse(artist[0].genres);
        genres.forEach((genre) => {
            if(genre in genrePercentage) {
                genrePercentage[genre] += artistPlaycount[i]['COUNT(artist_id)'];
            } else {
                genrePercentage[genre] = artistPlaycount[i]['COUNT(artist_id)'];
            }
        })

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

    // Fetch play count for album
    const fetchAlbumPlaycount = await fetch(`http://localhost:3000/api/history/albumplaycount/${id}/${start}/${end}`);
    const albumPlaycount = await fetchAlbumPlaycount.json();
    
    // Format album play count data for chart
    let albumNames = [];
    let albumPlaycounts = [];
    let top5Albums = {};
    for(let i = 0; i < albumPlaycount.length; i++) {
        let album = `${albumPlaycount[i].artist_name} - ${albumPlaycount[i].album_name}`;
        console.log(album);
        if(i < 5) top5Albums[album] = albumPlaycount[i].image;
        albumNames.push(album);
        albumPlaycounts.push(albumPlaycount[i]['COUNT(album_id)']);
    }
    // Format data for chart
    let albumPlaycountDataset = {
        labels: albumNames,
        datasets: [
            {
                label: 'Play Count',
                data: albumPlaycounts,
                backgroundColor: 'rgba(45,55,72,0.6)',
                hoverBackgroundColor: 'rgba(45,55,72,0.8)',
            }
        ]
    }

    // Fetch play count for tracks
    const fetchTrackPlaycount = await fetch(`http://localhost:3000/api/history/trackplaycount/${id}/${start}/${end}`);
    const trackPlaycount = await fetchTrackPlaycount.json();
    
    // Format album play count data for chart
    let trackNames = [];
    let trackPlaycounts = [];
    let top5Tracks = {};
    for(let i = 0; i < trackPlaycount.length; i++) {
        let track = `${trackPlaycount[i].artist_name} - ${trackPlaycount[i].track_name}`;
        if(i < 5) top5Tracks[track] = trackPlaycount[i].image;
        trackNames.push(track);
        trackPlaycounts.push(trackPlaycount[i]['COUNT(track_id)']);
    }
    // Format data for chart
    let trackPlaycountDataset = {
        labels: trackNames,
        datasets: [
            {
                label: 'Play Count',
                data: trackPlaycounts,
                backgroundColor: 'rgba(45,55,72,0.6)',
                hoverBackgroundColor: 'rgba(45,55,72,0.8)',
            }
        ]
    }

    let numSongs = artistPlaycounts.reduce((prev, curr) => prev + curr);
    Object.keys(genrePercentage).forEach((genre) => {
        genrePercentage[genre] /= numSongs / 100;
    })

    let genreNames = Object.keys(genrePercentage).slice(0, 15);
    let genrePercents = Object.values(genrePercentage).slice(0, 15).map(num => Math.round(num * 100) / 100);

    console.log(genreNames);

    let genreDataset = {
        labels: genreNames,
        datasets: [
            {
                label: 'Percentage of Listening Data',
                data: genrePercents,
                backgroundColor: [
                    '#bee3f8',
                    '#90cdf4',
                    '#63b3ed',
                    '#c3dafe',
                    '#a3bffa',
                    '#7f9cf5',
                    '#e9d8fd',
                    '#d6bcfa',
                    '#b794f4',
                    '#cbd5e0',
                    '#a0aec0',
                    '#718096',
                    '#4fd1c5',
                    '#81e6d9',
                    '#b2f5ea',
                ],
            }
        ]
    }

    const fetchValence = await fetch(`http://localhost:3000/api/history/valence/${id}/${start}/${end}`);
    const valenceData = await fetchValence.json();

    let dates = [];
    let avgValence = [];
    valenceData.forEach((data) => {
        dates.push(data.date.substring(0, 10));
        avgValence.push(data.valence - 0.5);
    })
   
    let valenceDataset = {
        labels: dates,
        datasets: [
            {
                label: 'Average Mood',
                data: avgValence,
                backgroundColor: 'rgba(45,55,72,0.6)',
                hoverBackgroundColor: 'rgba(45,55,72,0.8)',
            }
        ]
    }

    return { props: { 
                    profile, 
                    artistPlaycountDataset, 
                    top5Artists, 
                    albumPlaycountDataset, 
                    top5Albums, 
                    trackPlaycountDataset,
                    top5Tracks,
                    genreDataset,
                    valenceDataset,
      
    } };
}

export default User;
