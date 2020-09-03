const db = require('../../../lib/db')
const escape = require('sql-template-strings')

// Get user profile
export default async (req, res) => {

    let id = req.query.id;

    let results = await db.query(escape`SELECT image, artist_name, genres FROM artists WHERE artist_id=${id}`);

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(results))
}