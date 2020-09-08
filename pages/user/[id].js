import React, { useEffect } from 'react'
import { Bar, Doughnut, Polar, Line } from 'react-chartjs-2';
import Sidebar from '../../components/sidebar'
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

function User({ profile, artistPlaycountDataset, top5Artists, albumPlaycountDataset, top5Albums, trackPlaycountDataset, top5Tracks, genreDataset, valenceDataset }) {
    let img = profile[0].image || '/profile.png';
    return (
        <div>
            <div id="main">
                <Sidebar
                    image={img}
                    name={profile[0].name}
                />
                <div className='padw h-screen grid grid-rows-8'>
                    <div id="topArtists" className='unitw h-screen grid grid-cols-2'>
                        <div className='h-screen'>
                            <div className='pl-16 pt-20 text-3xl font-semibold'>Your top artists were:</div>
                            {artistPlaycountDataset.labels.slice(0,5).map((artist, idx) => { 
                                let classes = 'pl-40 font-semibold text-' + (5 - idx); 
                                return <div className='pt-8'><a onClick={changeArtistPicture} className={classes} img={top5Artists[artist]}>{artist}</a></div>
                            })}

                        </div>
                        <div id='artistPic' className='topPics' style={{backgroundImage: 'url(' + top5Artists[artistPlaycountDataset.labels[0]] + ')'}}></div> 
                    </div>
                    <div className='unitw h-screen graph'>
                        <Bar 
                            data={artistPlaycountDataset}
                            options={{
                                responsive: true, 
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
                    <div id='topAlbums' className='unitw h-screen grid grid-cols-2 gap-3'>
                        <div>
                            <div className='pl-16 pt-20 text-3xl font-semibold'>Your top albums were:</div>
                            {albumPlaycountDataset.labels.slice(0,5).map((album, idx) => { 
                                let classes = 'pl-40 font-semibold text-' + (2 - idx); 
                                return <div className='pt-8'><a onClick={changeAlbumPicture} className={classes} img={top5Albums[album]}>{album}</a></div>
                            })}
                        </div>
                        <div id='albumPic' className='topPics' style={{backgroundImage: 'url(' + top5Albums[albumPlaycountDataset.labels[0]] + ')'}}></div> 
                    </div>
                    <div className='topAlbumGraph h-screen graph'>
                        <Bar 
                            data={albumPlaycountDataset}
                            options={{
                                responsive: true,
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

                    <div id='topTracks' className='h-screen grid grid-cols-2 gap-3'>
                        <div>
                            <div className='pl-16 pt-20 text-3xl font-semibold'>Your top tracks were:</div>
                            {trackPlaycountDataset.labels.slice(0,5).map((track, idx) => { 
                                let classes = 'pl-40 font-semibold text-' + (2 - idx); 
                                return <div className='pt-8'><a onClick={changeTrackPicture} className={classes} img={top5Tracks[track]}>{track}</a></div>
                            })}
                        </div>
                        <div id='trackPic' className='topPics' style={{backgroundImage: 'url(' + top5Tracks[trackPlaycountDataset.labels[0]] + ')'}}></div> 
                    </div>
                    <div className='topTracksGraph h-screen graph'>
                        <Bar 
                            data={trackPlaycountDataset}
                            options={{
                                responsive: true,
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
                                            stepSize: 1,
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

                    <div id="genresChart" className='h-screen graph'>
                        <Polar
                            data={genreDataset}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                legend: {
                                    labels: {
                                        fontColor: 'black'
                                    }
                                },
                            }}
                        />
                    </div>

                    <div id='moodChart' className='graph'>
                        <Line 
                            data={valenceDataset}
                            options={{
                                responsive: true,
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
