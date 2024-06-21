const {client} = require('../config/configDB')
const bcrypt = require("bcrypt");
const user_trip_cache = new Set()
const tableContainsLink = require("../utils/tabelContainsLink")
const { removeElementFromSet } = require("../utils/cache");
const { findAdmin, tripAdminQuery } = require('./tripController');

const inputUserBio = async (req, res, next) => {
    const user_id = req.user.id;

    try {
        const { phone, location, vehicle, bio, image } = req.body;

        // First query to insert user bio
        const bioQuery = `
            INSERT INTO user_bio (user_id, user_phone, user_fav_location, user_preffered_vehicle, user_profile_photo, bio) 
            VALUES ($1, $2, $3, $4, $5, $6);
        `;

        // Execute the first query
        client.query(bioQuery, [user_id, phone, location, vehicle, image, bio], (err, results) => {
            if (err) {
                res.status(500).json({ 
                    message: "Unknown internal error occurred, and bio can't be inputted!",
                    error: err
                });
            } else {
                res.status(200).json({ message: "Bio entered successfully!" });
            }
        });
    } catch (error) {
        throw error;
    }
};

const editUserBio = async (req, res, next) => {
    const { phone, location, vehicle, bio, image } = req.body;
    
    const user_id = req.user.id;

    const bioQuery = `UPDATE user_bio SET user_phone = $1, user_fav_location = $2, user_preffered_vehicle = $3, user_profile_photo = $4, bio = $6 WHERE user_id = $5;`;

    try {

        client.query(bioQuery, [phone, location, vehicle, image, user_id, bio], (err, results) => {
            if(err)
            {
                res.status(500).json({
                    status: 500,
                    message: "Unknown error occures can't update user's bio"
                })
            }
            else
            {
                res.status(200).json({
                    status: 200,
                    message: "User Bio updated successfully"
                })
            }
        })
    } catch (error) {
        next(error);
    }
}

const getAllUsers = async (req, res, next) => {

    try {
        client.query(`
        SELECT u.user_id, u.user_name, u.user_bio,
        CASE 
            WHEN 
                u.user_id IN (SELECT f.user2_id FROM friendship f WHERE f.user1_id = $1) 
                OR 
                u.user_id IN (SELECT f.user1_id FROM friendship f WHERE f.user2_id = $1) 
            THEN 'friends'
            WHEN 
                u.user_id IN (SELECT requester_id FROM friend_requests WHERE request_status = 'pending' AND requestee_id = $1) 
            THEN 'got_request'
            WHEN 
                u.user_id IN (SELECT requestee_id FROM friend_requests WHERE request_status = 'pending' AND requester_id = $1) 
            THEN 'sent_request'
            ELSE 'not_friends'
        END AS friendship_status
        from users u
        WHERE NOT u.user_id = $1
        `, [req.user.id], (err, results) => {
            res.status(200).json(results.rows)
        })
    } catch (error) {
        console.log(error)
        next(error);
    }
}
const getUserById = (req, res) => {

    const auth_user_id = req.user.id;
    const user_id = parseInt(req.params.user_id, 10);

    if(auth_user_id === user_id)
    {

        client.query("SELECT * FROM users WHERE user_id = $1", [user_id]
            , (error, result) => {

            if (!error) {
                res.status(200).json(result.rows)
            }
            else {
                res.status(500).json({ status: 500, message: "Unknown error while getting user by Id" })
            }
        })
    }
    else
    {
        res.status(401).json({ message: "Cannot get user" });
    }
    
}

const getUserBio = async (req, res, next) => {
    const user_id = req.user.id;
    try {
        const query = `SELECT * FROM user_bio WHERE user_id = $1`;
        client.query(query,[user_id],(err, results) => {
            if(err)
            {
                res.status(400).json({
                    status: 400,
                    message: "Unexpected error occured while geting user's bio",
                })
            }
            else
            {
                res.status(200).json({result: results.rows});
            }
        })
    } catch (error) {
        next(error);
    }
}

const updateUser = async (req, res, next) => {
    const user_id = parseInt(req.params.user_id, 10);
    const auth_user_id = req.user.id;
    const { name, email, password, bio, phone } = req.body;
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(password, salt);
    try {
        if (user_id === auth_user_id) {
            client.query(`
            UPDATE users SET user_name = $1, user_email = $2, user_password = $3, user_bio = $4, user_mobile = $5
            WHERE user_id = $6
        `, [name, email, secPass, bio, phone, user_id], (err, results) => {
                if (err) {``
                    throw err;
                }
            })
            res.status(200).json({ message: "User updated successfully." })
        } else {
            res.status(401).json({ message: "Cannot update user" })
        }
        
    } catch (error) {
        next(error);
    }
}

const deleteUser = async (req, res, next) => {
    const user_id = parseInt(req.params.user_id, 10);
    const auth_user_id = req.user.id;
    try {
        if (user_id === auth_user_id) {
            client.query(`
            DELETE FROM users WHERE user_id = $1
            `, [user_id], (err, results) => {
                if (err) {
                    throw err;
                }
            })
            res.status(200).json({ message: "User deleted successfully." })
        } else {
            res.status(401).json({ message: "Cannot delete user" });
        }
        
    } catch (error) {
        next(error);
    }
}

const makeTripJoinRequest = async (req, res, next) => {

    const user_id = parseInt(req.params.user_id, 10);
    const trip_id = parseInt(req.body.trip_id, 10);
    const requestQuery = `SELECT * FROM trip_join_requests WHERE trip_id = $1 AND user_id = $2`;

    const auth_user_id = req.user.id;
    // const entryIsInDB = await tableContainsLink("user_trip", user_id, trip_id, user_trip_cache)

    // if (entryIsInDB) {
    //     res.status(400).json({ code: 400, message: "User already part of trip" })
    // }
    // else {
        try {
            if (auth_user_id === user_id) {

                const request = await client.query(requestQuery,[trip_id, user_id]);

                if(request.rows.length > 0)
                {
                    console.log("request already present!")
                    return res.status(400).json({
                        code: 400,
                        message: "request already present",
                    })
                }

                else
                {
                    client.query(`INSERT INTO trip_join_requests (user_id, trip_id) VALUES ($1, $2)`,[user_id, trip_id],(err, results) => {
                        if(err)
                        {
                            res.status(400).json({
                                status: 400,
                                message: "Unepected error occured!!"
                            })
                        }
                        else
                        {
                            console.log(results.rows);
                            res.status(200).json({
                                message: "trip request made successfully!"
                            })
                        }
                    });
                }

            } else {
                res.status(401).json({ message: "Cannot link user" });
            }

        } catch (error) {
            next(error);
        }
}

const getAllTripsOfUser = (req, res) => {

    const user_id = parseInt(req.params.user_id, 10);
    const auth_user_id = req.params.id;

    if(auth_user_id === user_id)
    {
        client.query(`SELECT trips.*
        FROM trips
        INNER JOIN user_trip ON trips.trip_id = user_trip.trip_id
        WHERE user_trip.user_id = $1;
    `, [user_id],
        (error, result) => {
            if (!error) {
                res.status(200).json(result)
            }
            else {
                res.status(500).json({ status: 500, message: "Unknown error while getting all the trips of user" })
            }
        })
    }
    else
    {
        res.status(401).json({ message: "Cannot get trips user" });
    }
}

const unlinkTripAndUser = (req, res) => {

    const user_id = parseInt(req.params.user_id, 10);
    const auth_user_id = req.user.id;
    const trip_id = parseInt(req.params.trip_id, 10);
    const AdminId = findAdmin(tripAdminQuery, trip_id)

    if(user_id === auth_user_id && AdminId === user_id)
    {
        if (!tableContainsLink("user_trip",user_id , req.params.trip_id, user_trip_cache)) {
            res.status(404).json({ code: 404, message: "trip not part of community" })
        }
    
        client.query("DELETE FROM user_trip WHERE user_id= $1 AND trip_id = $2", [user_id, req.params.trip_id]
            , (error, result) => {
                if (!error) {
                    removeElementFromSet(user_trip_cache, String(user_id) + "-" + String(req.params.trip_id))
    
                    res.status(204).json({ code: 204, message: "User and trip unlinked successfully" });
                } else {
                    res.status(400).json({
                        code: 400,
                        message: "User and trip link not found",
                    });
                }
            })
    }
    else
    {
        res.status(401).json({ message: "Cannot unlink user" });
    }
}

module.exports = { getAllTripsOfUser, unlinkTripAndUser, getUserById, getAllUsers, updateUser, deleteUser, makeTripJoinRequest, inputUserBio, editUserBio, getUserBio};
