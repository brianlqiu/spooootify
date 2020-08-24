import React, { useEffect } from 'react'

function User({ data }) {
    return (
        <div>
            <h1>Hi user</h1>
            {data.map((entry) =>
                <p>{entry.track.name}</p>
            )}
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

    const profile = await fetch('https://api.spotify.com/v1', {
        method: 'GET',
    })
    
    return { props: { data } };
}

export default User;