import React, { useEffect } from 'react'

function User({ data }) {
    console.log(data);
    return (
        <div>
            <h1>Hi user</h1>
            {data.map((entry) =>
                <p>{entry.song_id}</p>
            )}
        </div>
    )
}

export async function getServerSideProps(context) {
    const { access_token } = context.query;
    const id = context.params.id.substring(0, context.params.id.indexOf('access_token'));

    let now = new Date();
    let start = now.toISOString().substring(0, 10)
    now.setTime(now.getDate() - 7);
    let end = now.toISOString().substring(0, 10);
    const res = await fetch(`http://localhost:3000/api/date/${id}/${start}/${end}`);
    const data = await res.json();

    return { props: { data } };
}

export default User;