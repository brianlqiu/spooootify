import React, { useEffect } from 'react'
import { Bar } from 'react-chartjs-2';

function changeArtistPicture(e) {
    console.log(e.target.getAttribute('img'));
    document.getElementById('artistPic').style.backgroundImage = 'url(' + e.target.getAttribute('img') + ')';
}

function scrollIntoViewWrapper(e) {
    document.querySelector('.' + e.target.getAttribute('dest')).scrollIntoView({behavior: 'smooth'});
}
function User({ profile, topArtistData, artistImages }) {
    let img = profile.images.length == 0 ? '/profile.png' : profile.images[0].url;
    return (
        <div>
            <div id="main" >
                <div id='sidebar' className="pt-6 bg-gray-900 fixed h-full min-h-screen">
                    <div className="xl:py-2">
                        <img id='profile' className='object-center' src={img}></img>
                        <div className='pt-4 text-white text-xl object-center text-center'>{profile.display_name}</div>
                    </div>
                    <div className="xl:py-2">
                        <div className="object-center text-center xl:block uppercase font-bold text-white text-xs px-4 py-2">
                            Charts
                        </div>
                        <div dest='topArtists' className="group object-center relative sidebar-item with-children">
                            <a onClick={scrollIntoViewWrapper} dest='topArtists' className="block xl:flex xl:items-center object-center text-center xl:text-left shadow-light xl:shadow-none pl-4 py-6 xl:py-2 xl:px-4 border-l-4 border-transparent hover:bg-black">
                                <svg xmlns="http://www.w3.org/2000/svg" class="graph-icon icon icon-tabler icon-tabler-brush" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#FFFFFF" fill="none" stroke-linecap="round" stroke-linejoin="round">
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
            <div class='pl-48 h-full grid grid-rows-5'>
                <div className='topArtists h-full grid grid-cols-2 gap-3'>
                    <div>
                        <div className='pl-16 pt-20 text-3xl font-semibold'>Your top five artists of the last week:</div>
                        {topArtistData.labels.slice(0,5).map((artist, idx) => { 
                                let classes = 'pl-40 font-semibold text-' + (5 - idx); 
                                return <div className='pt-8'><a onClick={changeArtistPicture} className={classes} img={artistImages[artist]}>{artist}</a></div>
                            }
                        )}
                    </div>
                    <div id='artistPic' style={{backgroundImage: 'url(' + artistImages[topArtistData.labels[0]] + ')'}}></div> 
                </div>
                <div className='topArtistGraph h-screen graph'>
                    <Bar 
                        width={40}
                        height={40}
                        data={topArtistData}
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
                                        fontColor: 'black'
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
                data: values,
                backgroundColor: 'rgba(45,55,72,0.6)',
                hoverBackgroundColor: 'rgba(45,55,72,0.8)',
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