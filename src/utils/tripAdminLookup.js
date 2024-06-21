const {client} = require('../config/configDB');
const {findAdmin} = require('../controllers/tripController');
const tripAdminQuery = `SELECT user_id FROM trip_admin WHERE trip_id = $1`;
const trip_admin_cache = new Map();

const getAllTripJoinRequests = async (req, res, next) => {

    const trip_id = parseInt(req.params.trip_id, 10);
    const auth_user_id = req.user.id;

    try {
        const tripAdmin = await findAdmin(tripAdminQuery, trip_id);
        if (auth_user_id === tripAdmin) {
            client.query(`

            SELECT user_id FROM trip_join_requests WHERE trip_id = $1;
    
            `, [trip_id], (err, results) => {
                if(err)
                {
                    res.status(400).json({
                        status: 400,
                        message: "Unexpected error occured"
                    })
                }  
                else
                {
                    let requestSet = new Set();
                    results.rows.map((ele) => {
                        requestSet.add(ele.user_id);
                    })
                    let requestArray = Array.from(requestSet);
                    client.query(`SELECT users.*, user_bio.*
                    FROM users
                    LEFT JOIN user_bio ON users.user_id = user_bio.user_id
                    WHERE users.user_id = ANY($1);
                    `,[requestArray],(err, results) => {
                        if(err)
                        {
                            res.status(400).json({
                                status: 400,
                                message: "Unexpected error occured"
                            })
                        }
                        else
                        {
                            res.status(200).json({results: results.rows})
                        }
                    })
                }

            })
        } else {
            res.status(401).json({ results: "cannot get join requests" })
        }
    } catch (error) {
        next(error);
    }
}

module.exports = {getAllTripJoinRequests}