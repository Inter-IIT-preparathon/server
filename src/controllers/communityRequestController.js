const client = require("../config/configDB");
const { notifyUser } = require("../services/pushNotifications");
const { adminLookup } = require("../utils/adminLookup");
const { removeElementFromSet } = require("../utils/cache");
const communityRequestLookup = require("../utils/communityRequestLookup");
const { getNameOfId } = require("../utils/getNameofId");
const community_requests_cache = new Set()
const tableContainsLink = require("../utils/tabelContainsLink");
const { community_users_cache } = require("./communityController");


// TODO: Add all the error checking like, check if the user is admin or not, if he already is part of the community or not, etc.

const getAllCommunityRequestObjects = (req, res) => {
    client.query("SELECT * FROM community_requests", (err, results) => {
        if (!err) {
            res.status(200).json(results)
        }
        else {
            res.status(500).json({ status: 500, message: "unknown error occurred while fetching all the requests" })
        }
    })
}

function getCommunityRequestObjectByRequestId(req, res) {

    client.query("SELECT * FROM community_requests WHERE request_id = $1", [req.params.request_id],
        (err, results) => {
            if (!err) {
                console.log(results)
                if (results.rows[0].length != 0) {
                    res.status(200).json(results)
                }
                else {
                    res.status(400).json({ status: 400, message: "Invalid input: No request with the given request Id found" })
                }
            }
            else {
                res.status(500).json({ status: 500, message: "unknown error while fetching community request by id" })
            }
        }
    )
}

function getAllInviteObjectsByUserId(req, res) {

    client.query("SELECT * FROM community_requests WHERE user_id = $1 AND request_type = $2",
        [req.params.user_id, "invite"],
        (err, results) => {
            if (!err) {

                if (results.rows.length != 0) {
                    res.status(200).json(results)
                }
                else {
                    res.status(400).json({ status: 400, message: "Invalid input: No requests with the given parameters found" })
                }
            }
            else {
                res.status(500).json({ status: 500, message: "unknown error occurred while fetching invites by id" })
            }
        }
    )

}


function getAllRequestObjectsByAdminId(req, res) {

    client.query("SELECT * FROM community_requests WHERE admin_id = $1 AND request_type = $2",
        [req.params.user_id, "request"],
        (err, results) => {
            if (!err) {
                if (results.rows.length != 0) {
                    res.status(200).json(results)
                }
                else {
                    res.status(400).json({ status: 400, message: "Invalid input: No requests with the given parameters found" })
                }
            }
            else {
                res.status(500).json({ status: 500, message: "unknown error occurred while requests invites by id" })
            }
        }
    )

}

//TODO: Admin can only issue to a new user, user can only request if he is not already part of the community and he is not the admin
async function createCommunityRequestObject(req, res) {
    const { user_id, request_type, community_id } = req.body
    const requestAlreadyExists = await tableContainsLink("community_requests", "user_id", "community_id", user_id, community_id, community_requests_cache)
    const userAlreadyPartOfCommunity = await tableContainsLink("community_users", "community_id", "user_id", community_id, user_id, community_users_cache)

    //we can let the client input the admin id, but it might be wrong so we would anyway have to verify if the admin id belongs to the
    //community, so instead of that we are implicity getting the admin id from the community_id sent in the request

    const admin_id = await adminLookup(req.body.community_id)

    if (userAlreadyPartOfCommunity || user_id == admin_id) {
        res.status(400).json({ status: 400, message: "Invalid request: User is already part of the community or They are the admin" })
    }
    else if (requestAlreadyExists) {
        res.status(400).json({ status: 400, message: "Invalid request: The request object already exists, withdraw it, or wait till it is accepted/denied" })
    }
    else {
        client.query("INSERT INTO community_requests (user_id, community_id, admin_id, request_type, request_status) VALUES ($1, $2, $3, $4, $5)",
            [user_id, community_id, admin_id, request_type, "pending"],
            (err, results) => {
                if (!err) {
                    if (request_type == "invite") {
                        notifyUser(user_id, "Community Invite Received", "You have received a community invite")
                    }
                    else {
                        notifyUser(admin_id, "Community Request Received", "You have received a community join request")
                    }
                    res.status(201).json(results)
                }
                else {
                    console.log(err)
                    res.status(500).json({
                        status: 500, message: "unknown error occurred while creating community request object"
                    })
                }
            }
        )
    }
}


//TODO; only the user or the admin can perform this function
async function deleteCommunityRequestObjectById(req, res) {
    const requestExists = await tableContainsLink("community_requests", "user_id", "community_id", req.body.user_id, req.body.community_id, community_requests_cache)

    if (requestExists) {

        if (req.user.id == req.body.user_id || req.user.id == admin_id) {

            client.query("DELETE FROM community_requests WHERE request_id = $1 RETURNING *", [req.params.community_request_id],

                (err, results) => {
                    if (!err) {
                        res.status(204).json({
                            status: 204, message: "request object deleted successfully"
                        })
                        removeElementFromSet(community_requests_cache, String(results.rows[0].user_id) + "-" + String(results.rows[0].community_id))
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
                .json({ status: 400, message: "Invalid request: Only the user or the admin related to the request can perform this action" })
        }

    }
    else {
        res.status(400).json({ status: 400, message: "Invalid request: No such community request object" })
    }
}
const updateCommunityRequestObject = async (req, res) => {
    client.query(
        "UPDATE community_request SET user_id = $1, community_id = $2 , admin_id =$3, request_type = $4, request_status = $5 WHERE request_id = $5",
        [
            req.body.user_id,
            req.body.community_id,
            req.body.admin_id,
            req.body.request_type,
            req.params.community_request_id

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

//TODO: Make this a transaction instead of 2 separate queries
const updateCommunityRequestStatus = async (req, res) => {

    const setRequestStatus = req.headers.set_request_status;
    const requestId = req.params.community_request_id;
    const callerId = req.user.id
    // we need to check whether the request the user is making is correct, that is, if it is an invite, it must be the user who is mutating and if
    // it is a request, the admin must be the one handling.
    // we also need to check that we are changing the status of a pending request, not one that has already been accepted or declined
    const request = await communityRequestLookup(requestId)
    const { community_id, user_id, admin_id, request_type, request_status } = request
    if (request_status == "pending") {
        try {
            if (setRequestStatus !== "accepted" && setRequestStatus !== "rejected" && setRequestStatus !== "pending") {
                return res.status(400).json({ status: 400, message: `Invalid request_status: ${setRequestStatus}, should either be "accepted", "rejected" or "pending"` });
            }
            else if (!((request_type == "invite" && callerId == user_id) || (request_type == "request" && callerId == admin_id))) {
                return res.status(400).json({ status: 400, message: "You are not eligible to perform this action" })
            }
            else {
                await client.query("BEGIN")
                const updateResult = await client.query(
                    "UPDATE community_requests SET request_status = $1 WHERE request_id = $2",
                    [setRequestStatus, requestId]
                );

                if (setRequestStatus == "accepted") {
                    await client.query(
                        `INSERT INTO community_users(community_id, user_id)
                         SELECT $1, $2
                         WHERE
                         NOT EXISTS (
                         SELECT 1 FROM community_users WHERE community_id = $1 AND user_id = $2
                         );`, [community_id, user_id]
                    );
                    const userName = await getNameOfId(user_id)
                    await notifyCommunityMembers(req.user.id, "New community member", `${userName} has joined the community, say hi!`)
                    res.status(204).json({ status: 204, message: `User successfully added to the community of community_id: ${community_id}` });
                } else if (setRequestStatus === "rejected") {
                    if (request_type == "invite") {
                        const userName = await getNameOfId(user_id)
                        notifyUser(admin_id, "Community Invite Denied", `Your community invite to ${userName} has been denied`)
                    }
                    else {
                        const adminName = await getNameOfId(admin_id)
                        notifyUser(admin_id, "Community Request Denied", `Your community request to ${adminName} has been denied`)
                    }
                    res.status(204).json({ status: 204, message: `User request to join community of community_id: ${community_id} has been rejected` });
                }
                await client.query("COMMIT")
            }
        } catch (err) {
            await client.query("ROLLBACK")
            console.error(err);
            res.status(500).json({ status: 500, message: "Unknown error occurred while processing request" });
        }
    }
    else {
        res.status(400).send({ status: 400, message: "Invalid request: Can only change the status of a request that is 'pending'" })
    }
};

module.exports = {
    getAllCommunityRequestObjects, getCommunityRequestObjectByRequestId, createCommunityRequestObject, deleteCommunityRequestObjectById, updateCommunityRequestObject,
    getAllInviteObjectsByUserId, getAllRequestObjectsByAdminId, updateCommunityRequestStatus, deleteCommunityRequestObjectById
}
