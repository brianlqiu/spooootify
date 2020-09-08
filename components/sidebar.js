function scrollIntoViewWrapper(e) {
    document.getElementById(e.target.getAttribute('dest')).scrollIntoView({behavior: 'smooth'});
}

export default function Sidebar({ image, name }) {
    return (
        <div id='sidebar' className="pt-6 bg-gray-900 fixed h-full min-h-screen">
            <div className="xl:py-2">
                <img id='profile' className='object-center' src={image}></img>
                <div className='pt-4 text-white text-xl object-center text-center'>{name}</div>
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
                <div dest='moodChart' className="group object-center relative sidebar-item with-children">
                    <a onClick={scrollIntoViewWrapper} dest='moodChart' className="block xl:flex xl:items-center object-center text-center xl:text-left shadow-light xl:shadow-none pl-4 py-6 xl:py-2 xl:px-4 border-l-4 border-transparent hover:bg-black">
                        <svg xmlns="http://www.w3.org/2000/svg" className="sidebaricon icon icon-tabler icon-tabler-mood-smile" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z"/>
                          <circle cx="12" cy="12" r="9" />
                          <line x1="9" y1="10" x2="9.01" y2="10" />
                          <line x1="15" y1="10" x2="15.01" y2="10" />
                          <path d="M9.5 15a3.5 3.5 0 0 0 5 0" />
                        </svg>
                        <div dest='moodChart' className="text-white text-xs pl-2">Genres</div>
                    </a>
                </div>
            </div>
        </div>
    )
}
