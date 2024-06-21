const community_trips_cache = new Set();
const community_users_cache = new Set()
const community_cache = [];
//TODO: return results using the utils defined by Varun
//TODO: uncomment the line for community admin from the req.user
const {client} = require("../config/configDB");
const tableContainsLink = require("../utils/tabelContainsLink")
const { removeElementFromSet } = require("../utils/cache")
const { queryTrips } = require('./tripController');
const { notifyCommunityMembers } = require("../services/pushNotifications");
const { getNameOfId } = require("../utils/getNameofId");

const getAllCommunities = async (req, res) => {
    client.query("SELECT * FROM communities", function(error, results,) {
        if (!error) {
            res.status(200).json(results.rows);
        } else {
            res.status(500).json({
                code: 500,
                message: "unexpected error",
            });
        }
    });
};

const createCommunity = async (req, res) => {
    client.query(
        "INSERT INTO communities (community_name, community_desc, community_admin_id) VALUES ($1, $2 , $3)",
        [
            req.body.community_name,
            req.body.community_desc,
            req.user.id
        ],
        function(error, results) {
            if (!error) {
                res.status(201).send(results);
            } else {
                console.log(error);
                res.status(500).json({
                    code: 500,
                    message: "unexpected error",
                });
            }
        }
    )
}

const getCommunityById = async (req, res) => {
    client.query("SELECT *  FROM communities WHERE community_id = $1"
        , [req.params.community_id],
        function(error, results) {
            if (!error) {
                res.status(200).json(results.rows);
            } else {
                res.status(404).json({
                    code: 404,
                    message: "community not found ",
                })
            }
        })
}

const updateCommunity = async (req, res) => {
    client.query(
        "UPDATE communities SET community_name = $1, community_desc= $2 WHERE community_id =$3",
        [
            req.body.community_name,
            req.body.community_desc,
            req.params.community_id
        ],
        function(error, results) {
            if (!error) {
                res.status(204).send(results.rows);
            }
            else {
                res.status(400).json({ code: 400, message: "invalid input", })
            }
        }
    );
};

const deleteCommunity = async (req, res) => {
    client.query(
        "DELETE FROM communities WHERE community_id = $1",
        [req.params.community_id],
        function(error, results) {
            if (!error) {
                res.status(204).json({ code: 204, message: "community deleted successfully" });
            } else {
                res.status(400).json({
                    code: 400,
                    message: "community not found",
                });
            }
        }
    );
};

const getAllTripsOfCommunity = async (req, res, next) => {
    // Collect unique dates, origins, and destinations
    const tripIds = new Set();
    const community_id = req.params.community_id;
    
    try {

        let sqlQuery = `
        SELECT DISTINCT CT.trip_id
        FROM community_trip CT
        WHERE CT.community_id = ${community_id}
        `;

        // Execute the SQL query
        client.query(sqlQuery, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'An error occurred while querying the database' });
            }
            else if (results.rows.length == 0) {
                return res.status(400).json({
                    code: 400,
                    message: "no trips present in the community",
                });
            }

            results.rows.forEach((row) => {
                tripIds.add(row.trip_id);
            });

            queryTrips(req, res, tripIds);
        });

    } catch (error) {
        next(error);
    }
};

const addTripToCommunity = async (req, res, next) => {

    const entryIsInDB = await tableContainsLink("community_trips", "community_id", "trip_id", req.params.community_id, req.params.trip_id, community_trips_cache)

    res.json({ message: "received" })

    if (entryIsInDB) {
        res.status(400).json({ code: 400, message: "trip already part of community" })
    }
    else {
        client.query(
            "INSERT INTO community_trips (community_id, trip_id) VALUES ($1,$2)", [req.params.community_id, req.params.trip_id],
            async function(error, results) {
                if (!error) {
                    const userName = await getNameOfId(req.user.id)
                    await notifyCommunityMembers(req.user.id, "Trip Posted", `${userName} has posted a new Trip in the community, check it out!`)
                    res.status(201).send(results);

                } else {
                    console.log(error);
                    res.status(400).json({
                        code: 400,
                        message: "invalid input",
                    });
                }
            }
        )
    }
}

const removeTripFromCommunity = async (req, res) => {

    if (!tableContainsLink("community_trips", req.params.community_id, req.params.trip_id, community_trips_cache)) {
        res.status(404).json({ code: 404, message: "trip not part of community" })
    }

    client.query(
        "DELETE FROM community_trips WHERE community_id = $1 AND trip_id = $2",
        [req.params.community_id, req.params.trip_id],
        function(error, results) {
            if (!error) {
                removeElementFromSet(community_trips_cache, String(req.params.community_id) + "-" + String(req.params.trip_id))
                res.status(204).json({
                    code: 204,
                    message: "trip removed from the community successfully"
                });
            } else {
                console.log(error)
                res.status(500).json({
                    code: 500,
                    message: "unexpected error",
                });
            }
        }
    );
}

const getAllUsersOfCommunity = async (req, res) => {

    client.query(`
SELECT users.*
FROM users
INNER JOIN community_users ON users.user_id = community_users.user_id
WHERE community_users.community_id = $1;
`
        , [req.params.community_id],

        function(error, results) {
            if (!error && results.rows.length != 0) {
                res.status(201).send(results.rows);
            } else if (results.rows.length == 0) {
                res.status(400).json({
                    code: 400,
                    message: "no users present in the community",
                });
            } else {
                console.log(error);
                res.status(500).json({
                    code: 500,
                    message: "unknown error occurred",
                });

            }
        }
    )
}

const addUserToCommunity = async (req, res) => {

    const entryIsInDB = await tableContainsLink("community_users", "community_id", "user_id", req.params.community_id, req.params.user_id, community_users_cache)

    res.json({ message: "received" })

    if (entryIsInDB) {
        res.status(400).json({ code: 400, message: "user already part of community" })
    }
    else {
        client.query(
            "INSERT INTO community_users (community_id, user_id) VALUES ($1,$2)", [req.params.community_id, req.params.user_id],
            async function(error, results) {
                if (!error) {
                    const userName = await getNameOfId(req.params.user_id)
                    await notifyCommunityMembers(req.user.id, "New community member", `${userName} has joined the community, say hi!`)
                    res.status(201).send(results);

                } else {
                    console.log(error);
                    res.status(400).json({
                        code: 400,
                        message: "invalid input",
                    });
                }
            }
        )


    }
}

const removeUserFromCommunity = async (req, res) => {


    if (!tableContainsLink("community_users", req.params.community_id, req.params.user_id, community_trips_cache)) {
        res.status(404).json({ code: 404, message: "user not part of community" })
    }

    client.query(
        "DELETE FROM community_users WHERE community_id = $1 AND user_id = $2",
        [req.params.community_id, req.params.user_id],
        async function(error, results) {
            if (!error) {
                removeElementFromSet(community_users_cache, String(req.params.community_id) + "-" + String(req.params.user_id))
                res.status(204).json({
                    code: 204,
                    message: "user removed from the community successfully"
                });
            } else {
                console.log(error)
                res.status(500).json({
                    code: 500,
                    message: "unexpected error",
                });
            }
        }
    );


}









module.exports = { community_users_cache, addUserToCommunity, removeUserFromCommunity, getAllUsersOfCommunity, createCommunity, getAllCommunities, getCommunityById, deleteCommunity, updateCommunity, getAllTripsOfCommunity, removeTripFromCommunity, addTripToCommunity }
