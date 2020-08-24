const db = require('../../../lib/db')
const escape = require('sql-template-strings')

// (Default) Get last 7 days of listening data
export default async (req, res) => {
    const {
        query: { history }
    } = req;
    
    let query = req.query.history;
    let user = query[0];
    let startDate = query[1];
    let endDate = query[2];

    let results = await db.query(escape`SELECT * FROM history 
                                        WHERE user_id=${user} AND date <= ${startDate} AND date >= ${endDate}`)

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(results))
}