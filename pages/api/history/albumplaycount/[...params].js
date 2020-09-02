const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

// (Default) Get last 7 days of listening data
export default async (req, res) => {

    let query = req.query.params;
    let user = query[0];
    let startDate = query[1];
    let endDate = query[2];

    let results = await db.query(escape`SELECT album_name, artist_name, image, COUNT(album_id) FROM history 
                                        WHERE user_id=${user} AND date <= ${startDate} AND date >= ${endDate} AND album_type="album"
                                        GROUP BY album_id 
                                        ORDER BY COUNT(album_id) DESC`)

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(results))
}