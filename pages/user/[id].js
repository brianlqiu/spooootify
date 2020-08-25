import React, { useEffect } from 'react'
import Sidebar from '../../components/sidebar'

function User({ data, profile }) {
    return (
        <div>
            <Sidebar profile={profile}/>
            <div id='gridbox' class='grid grid-cols-3 gap-4'>
                <div>1</div>
                <div>2</div>
                <div>3</div>
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
    
    return { props: { data, profile } };
}

export default User;