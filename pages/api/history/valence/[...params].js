const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

// (Default) Get last 7 days of listening data
export default async (req, res) => {

    let query = req.query.params;
    let user = query[0];
    let startDate = query[1];
    let endDate = query[2];

    console.log(startDate);
    console.log(endDate);

    let results = await db.query(escape`SELECT AVG(valence), date FROM history 
                                        WHERE user_id=${user} AND date <= ${startDate} AND date >= ${endDate}
                                        GROUP BY date
                                        ORDER BY date`)

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(results))
}
