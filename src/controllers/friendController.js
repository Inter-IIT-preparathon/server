const { client } = require("../config/configDB");
const tableContainsLink = require("../utils/tabelContainsLink")

const deleteFriendship = async (req, res, next) => {
    try {
        const callerId = req.user.id;
        const user1_id = req.body.user1_id;
        const user2_id = req.body.user2_id;
        if (callerId !== user1_id && callerId !== user2_id) {
            return res.status(404).json({ status: 404, message: "User is not allowed to perform this operation" })
        }
        client.query(
            `DELETE FROM friendship WHERE 
            (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)
            RETURNING *`,
            [user1_id, user2_id],
            function (error, results) {
                if (!error && results.rows.length !== 0) {
                    res.status(200).json({
                        "success": true,
                        "data_deleted": results.rows
                    });
                } else {
                    res.status(400).json({
                        code: 400,
                        message: "friendship not found",
                    });
                }
            }
        );
    } catch (error) {
        console.log(error);
        next(error)
    }
};

const getAllFriendsOfMine = async (req, res, next) => {
    try {
        client.query(`
    SELECT u.user_id, u.user_name, u.user_bio
    FROM friendship f
    JOIN users u ON (
        CASE
            WHEN f.user1_id = $1 THEN f.user2_id
            WHEN f.user2_id = $1 THEN f.user1_id
        END
    ) = u.user_id;
`
            , [req.user.id],

            function (error, results) {
                if (!error && results.rows.length != 0) {
                    return res.status(201).send(results.rows);
                } else if (results.rows.length == 0) {
                    return res.status(400).json({
                        code: 400,
                        message: "no friends exist",
                    });
                } else {
                    console.log(error);
                    return res.status(500).json({
                        code: 500,
                        message: "Internal server error",
                    });

                }
            }
        )
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const getAllFriendsOfUser = async (req, res, next) => {

    client.query(`
    SELECT u.user_id, u.user_name, u.user_bio
    FROM friendship f
    JOIN users u ON (
        CASE
            WHEN f.user1_id = $1 THEN f.user2_id
            WHEN f.user2_id = $1 THEN f.user1_id
        END
    ) = u.user_id;
`
        , [req.params.user_id],

        function (error, results) {
            if (!error && results.rows.length != 0) {
                return res.status(201).send(results.rows);
            } else if (results.rows.length == 0) {
                return res.status(400).json({
                    code: 400,
                    message: "no friends exist",
                });
            } else {
                console.log(error);
                return res.status(500).json({
                    code: 500,
                    message: "Internal server error",
                });

            }
        }
    )
}

const createFriendship = async (req, res, next) => {
    try {
        const { user1_id, user2_id } = req.body;
        if (req.user.id !== user1_id && req.user.id !== user2_id) {
            return res.status(404).json({
                status: 404,
                message: "You're not allowed to perform this operation"
            })
        }
        client.query(`
            INSERT INTO friendships (user1_id, user2_id)
            VALUES ($1, $2)
            RETURNING *
        `, [user1_id, user2_id], (err,results) => {
            if(err) {
                console.log(err);
                return res.status(500).json({
                    code: 500,
                    message: "Internal server error",
                });;
            }
            else {
                return res.status(201).send(results.rows);
            }
        })
    } catch (error) {
        console.log(error);
        next(error);
    }
}


module.exports = { deleteFriendship, getAllFriendsOfUser, getAllFriendsOfMine, createFriendship }
