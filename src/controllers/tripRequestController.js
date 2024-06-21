const {client} = require('../config/configDB');
const {tripAdminLookup} = require('../utils/tripAdminLookup');
const {removeElementFromSet} = require('../utils/cache');
const trip_invite_cache = new Set();
const tableContainsLink = require('../utils/tabelContainsLink');
const {trip_users_cache} = require('./tripController');

const getAllTripRequestsObjects = (req, res, next) => {
    try {
       client.query(`SELECT * FROM trip_invites`,(err, results) => {
            if (!err) {
                res.status(200).json(results)
            }
            else {
                res.status(500).json({ status: 500, message: "unknown error occurred while fetching all the requests" })
            };
        })
    } catch (error) {
        next(error);
    }
}

function getTripInviteByInviteId(req, res, next){
    try {
        client.query(`SELECT * FROM trip_invites WHERE user_id = $1`,[req.params.invite_id], (err, results) => {
            if(err)
            {
                res.status(400).json({
                    message:"Invalid Input No requests found."
                })
            } else {
                res.status(200).json({result : results.rows});
            }
        })
    } catch (error) {
        next(error);
    }
}

const getAllInviteObjectsByUserId = async (req, res, next) => {
    const user_id = req.user.id;
    let tripsSet = new Set();
    try { 
        client.query(`SELECT trip_id FROM trip_invites WHERE user_id = $1`,[user_id],(err, results) => {
            
            if(err)
            {
                res.status(400).json({message: "Unknown error occured!!"})
            }
            else 
            {
                try {
                    let TripInviteArray = Array.from(tripsSet.add(results.rows[0].trip_id));
                    let AdminId = Array.from(tripsSet.add(results.rows[0].admin_id))
                    client.query(`SELECT * FROM trips WHERE trip_id = ANY($1)`,[TripInviteArray],(err, resulta)=>{
                        if(err)
                        {
                            res.status(400).json({message: "Unknown error occured!!"})
                        }
                        else
                        {
                            client.query(`SELECT * FROM user_bio WHERE user_id = ANY($1)`,[AdminId],(err, result) => {
                            if(err) 
                            {
                                    res.status(400).json({
                                        status:400,
                                        message: "unexpected error occured"
                                    })
                            }
                            else
                            {
                                    client.query(`SELECT * FROM users WHERE user_id = ANY($1)`,[AdminId],(err, results) => {
                                        if(err)
                                        {
                                            res.status(400).json({
                                                status:400,
                                                message: "unexpected error occured"
                                            })
                                        }
                                        else
                                        {
                                            res.status(200).json({
                                                resulta : resulta.rows,
                                                result : result.rows,
                                                results: results.rows
                                                
                                            })
                                        }
                                    })
                            }
                            })
                            tripsSet.clear();
                        }
                    })
                } catch (error) {
                    console.log(error);
                }
            }
            
        })
    } catch (error) {
        next(error);
    }
}

async function createTripRequestObjects(req, res, next){
    try {
        const {user_id, trip_id} = req.body;
        const requestAlreadyExists = await tableContainsLink("trip_invites", "user_id","trip_id", user_id, trip_id,trip_users_cache);
        const userAlreadyPartOfTrip = await tableContainsLink("user_trip", "user_id", "trip_id",user_id, trip_id, trip_invite_cache);
        const admin_id = tripAdminLookup(req.body.trip_id);

        if(userAlreadyPartOfTrip || user_id == admin_id)
        {
            res.status(400).json({
                status: 400,
                message: "User already part of the trip!!"
            })
        }
        else if(requestAlreadyExists)
        {
            res.status(400).json({
                status: 400,
                message: "The request object already exists!!"
            })
        }
        else
        {
            client.query(`INSERT INTO trip_invites (
                user_id, trip_id, admin_id, request_status) VALUES ($1,$2,$3,$4)
            )`,[user_id, trip_id, admin_id, "pending"],(err, results)=>{
                if(!err)
                {
                    res.status(200).json({
                        message: "request made successfully!!",
                        result: results.rows
                    })
                }
                else
                {
                    res.status(400).json({message: "unknown error occured"});
                }
            })
        }
    } catch (error) {
        next(error);
    }
}

async function deleteTripRequestObjectById(req, res, next){
    try {
        const requestExists = await tableContainsLink("trip_invites","user_id","trip_id",req.body.user_id, req.body,trip_id, trip_users_cache);
        if(requestExists){
            if(req.user.id == req.body.user_id || req.user.id == admin_id)
            {
                client.query(`DELETE FROM trip_invites WHERE request_id = $1 RETURNING *`,[req.params.trip_invite_id],
                (err, results) => {
                    if(!err)
                    {
                        res.status(204).json({
                            status: 204,
                            message: "request object deleted successfully!"
                        })
                        removeElementFromSet(trip_invite_cache,String(results.rows[0].user_id) + " - " + String(results.rows[0].trip_id))
                    }
                    else
                    {
                        res.status(500).json({
                            status: 500,
                            message: "unknown error occured!"
                        })
                    }
                })
            }
            else
            {
                res.status(400).json({
                    status: 400,
                    message: "Invalid request"
                })
            }
        }
        else
        {
            res.status(400).json({
                status: 400,
                message: "No such community request object"
            })
        }
    } catch (error) {
        next(error);
    }
}

const updateTripRequestObject = async (req, res, next) => {
    client.query(
        "UPDATE trip_invites SET user_id = $1, community_id = $2 , admin_id =$3, request_status = $4 WHERE invite_id = $4",
        [
            req.body.user_id,
            req.body.trip_id,
            req.body.admin_id,
            req.params.trip_invite_id
        ],
        function(error, results) {
            if (!error) {
                res.status(204).send(results);
            }
            else {
                res.status(400).json({ code: 400, message: "invalid input", })
            }
        }
    );
};

const updateTripRequestStatus = async(req, res, next) => {
    const setRequestStatus = req.headers.set_request_status;
    const request_id = req.params.trip_request_id;
    const callerId = req.user.id;
    const request = await tripAdminLookup(request_id);
    const {trip_id, user_id, admin_id, request_status} = request;
    if(request_status == "pending")
    {
        try {
            if (setRequestStatus !== "accepted" && setRequestStatus !== "rejected" && setRequestStatus !== "pending") {
                return res.status(400).json({
                    status: 400,
                    message: "Invalid request status"
                })
            }
            else if(!(callerId == admin_id))
            {
                return res.status(400).json({
                    status: 400,
                    message: "You are not eligible to do this operation"
                })
            }
            else
            {
                await client.query(`UPDATE trip_invites SET invite_status = $1`,[setRequestStatus]);
                if(setRequestStatus == "accepted")
                {
                    await client.query(`INSERT INTO user_trip (trip_id, user_id) VALUES ($1, $2);`,[trip_id, user_id]);
                    res.status(204).json({
                        status: 204,
                        message: "User successfully added to the trip"
                    })
                }
                else if(setRequestStatus == "rejected")
                {
                    res.status(204).json({
                        status: 204,
                        message: "User request to join community has been rejected!"
                    })
                }
            }
        } catch (error) {
            next(error);
        }
    }
    else
    {
        res.status(400).json({
            status: 400,
            message: "Invalid request: can only change the status of the requsest that is pending!"
        })
    }
}

module.exports = {
    getAllTripRequestsObjects, getTripInviteByInviteId, getAllInviteObjectsByUserId, 
    createTripRequestObjects, deleteTripRequestObjectById, updateTripRequestObject, updateTripRequestStatus
}