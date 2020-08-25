export default function Sidebar({ profile }) {
    let img = profile.images.length == 0 ? '/profile.png' : profile.images[0].url;
    return (
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
                    <div className="group object-center relative sidebar-item with-children">
                        <a href="#" className="block xl:flex xl:items-center text-center xl:text-left shadow-light xl:shadow-none py-6 xl:py-2 xl:px-4 border-l-4 border-transparent hover:bg-black">
                            <svg xmlns="http://www.w3.org/2000/svg" class="graph-icon icon icon-tabler icon-tabler-brush" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#FFFFFF" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z"/>
                            <path d="M3 21v-4a4 4 0 1 1 4 4h-4" />
                            <path d="M21 3a16 16 0 0 0 -12.8 10.2" />
                            <path d="M21 3a16 16 0 0 1 -10.2 12.8" />
                            <path d="M10.6 9a9 9 0 0 1 4.4 4.4" />
                            </svg>
                            <div className="text-white text-xs pl-2">Artists</div>
                        </a>
                    </div>
                    <div className="group relative sidebar-item with-children">
                        <a href="#" className="block xl:flex xl:items-center text-center xl:text-left shadow-light xl:shadow-none py-6 xl:py-2 xl:px-4 border-l-4 border-transparent hover:bg-black">
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
    )
}