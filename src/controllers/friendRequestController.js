const { client } = require("../config/configDB");
const { removeElementFromSet } = require("../utils/cache");
const friendRequestLookup = require("../utils/friendRequestLookup");
const friend_requests_cache = new Set()
const tableContainsLink = require("../utils/tabelContainsLink");
const friendship_cache = new Set()


const getAllFriendRequestObjectsByUserId = (req, res) => {
    client.query(`
    SELECT * FROM friend_requests
    WHERE requestee_id = $1
    `, [req.user.id], (err, results) => {
        if (err) {
            return res.status(500).json({ status: 500, message: "unknown error occurred while fetching all the requests" })
        }
        else if (results.rows[0].length !== 0) {
            return res.status(200).json(results)
        }
        else {
            return res.status(400).json({ status: 400, message: "No friend requests were found" });
        }
    })
}

async function createFriendRequestObject(req, res, next) {
    try {
        const { requestee_id } = req.body
        const requester_id = req.user.id;
        if (requestee_id === requester_id) {
            return res.status(404).json({ status: 404, message: "You can't send request to yourselves"})
        }
        const requestAlreadyExists = await tableContainsLink("friend_requests", "requester_id", "requestee_id", requester_id, requestee_id, friend_requests_cache)
        const usersAlreadyFriends = friendship_cache.has(String(requester_id) + '-' + String(requestee_id))

        if (usersAlreadyFriends) {
            res.status(400).json({ status: 400, message: "Invalid request: Users are already friends" })
        }
        else if (requestAlreadyExists) {
            res.status(400).json({ status: 400, message: "Invalid request: The request object already exists, withdraw it, or wait till it is accepted/denied" })
        }
        else {

            client.query("INSERT INTO friend_requests (requester_id, requestee_id, request_status) VALUES ($1, $2, $3) RETURNING *",
                [requester_id, requestee_id, "pending"],
                (err, results) => {
                    if (!err) {
                        res.status(201).json(results.rows)
                    }
                    else {
                        console.log(err)
                        res.status(500).json({
                            status: 500, message: "unknown error occurred while creating friend request object"
                        })
                    }
                }
            )
        }
    } catch (error) {
        next(error)
    }
}


async function deleteFriendRequestObjectById(req, res) {
    const request = await friendRequestLookup(req.params.friend_request_id)
    const {requester_id, requestee_id} = request;
    const requestExists = await tableContainsLink("friend_requests", "requester_id", "requestee_id", requester_id, requestee_id, friend_requests_cache)

    if (requestExists) {

        if (req.user.id == requester_id || req.user.id == requestee_id) {

            client.query("DELETE FROM friend_requests WHERE request_id = $1 OR requestee_id = $1 RETURNING *", [req.params.friend_request_id],

                (err, results) => {
                    if (!err) {
                        res.status(200).json({
                            status: 200, message: "request object deleted successfully"
                        })
                        removeElementFromSet(friend_requests_cache, String(results.rows[0].requester_id) + "-" + String(results.rows[0].requestee_id))
                    }
                    else {
                        res.status(500).json({
                            status: 500, message: "unknown error occurred while deleting request object"
                        })
                    }
                }
            )

        }
        else {
            res.status(400)
                .json({ status: 400, message: "Invalid request: Only the users who are friends related to the request can perform this action" })
        }

    }
    else {
        res.status(400).json({ status: 400, message: "Invalid request: No such community request object" })
    }
}


const updateCommunityRequestObject = async (req, res) => {
    client.query(
        "UPDATE friend_requests SET requester_id = $1, requestee_id = $2 , request_status =$3 WHERE request_id = $4",
        [
            req.body.requester_id,
            req.body.requestee_id,
            req.body.request_status,
            req.params.friend_request_id

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

const updateFriendRequestStatus = async (req, res,next) => {

    try {
        const setRequestStatus = req.headers.set_request_status;
        const requestId = req.params.friend_request_id;
        const callerId = req.user.id
        const request = await friendRequestLookup(requestId)
        const { requester_id, requestee_id, request_status } = request
        if (request_status == "pending") {
            try {
                if (callerId !== requester_id && callerId !== requestee_id) {
                    return res.status(404).json({ status: 404, message: "User is not allowed to perform this operation" })
                }
                if (setRequestStatus !== "accepted" && setRequestStatus !== "rejected" && setRequestStatus !== "pending") {
                    return res.status(400).json({ status: 400, message: `Invalid request_status: ${setRequestStatus}, should either be "accepted", "rejected" or "pending"` });
                }
                else {
                    if (setRequestStatus == "accepted") {
                        await client.query(
                            `INSERT INTO friendship (user1_id, user2_id)
                            SELECT $1, $2
                            WHERE NOT EXISTS (
                                SELECT 1 FROM friendship
                                WHERE user1_id = $1 AND user2_id = $2
                            );`, [requester_id, requestee_id]
                        );
                        friendship_cache.add(String(requester_id) + '-' + String(requestee_id))
                        res.status(201).json({ status: 201, message: `Users successfully added as friends` });
                    } else if (setRequestStatus === "rejected") {
                        let other_user_id = req.user.id === requester_id ? requestee_id : requester_id;
                        removeElementFromSet(friend_requests_cache, String(requester_id) + String(requestee_id))
                        removeElementFromSet(friend_requests_cache, String(requestee_id) + String(requester_id))
                        res.status(200).json({ status: 200, message: `User of user_id: ${other_user_id} has been rejected` });
                    }else {
                        res.status(200).json({ status: 200, message: "Request is already in pending"})
                    }
                    await client.query(
                        "UPDATE friend_requests SET request_status = $1 WHERE request_id = $2",
                        [setRequestStatus, requestId]
                    );
                }
            } catch (err) {
                console.error(err);
                res.status(500).json({ status: 500, message: "Unknown error occurred while processing request" });
            }
        }
        else {
            res.status(400).send({ status: 400, message: "Invalid request: Can only change the status of a request that is 'pending'" })
        }
    } catch (error) {
        next(error)
    }
};

module.exports = {
    getAllFriendRequestObjectsByUserId, createFriendRequestObject, deleteFriendRequestObjectById,
    updateFriendRequestStatus
}
