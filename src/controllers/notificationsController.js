const { client } = require('../config/configDB')

async function saveNotifObject(req, res) {
    const { endpoint, expiration_time, p256dh, auth } = req.body
    const user_id = req.user.id
    console.log("inside handler")
    try {
        await client.query('BEGIN')
        const notif = await client.query(`
                INSERT INTO notifs (endpoint, expiration_time, p256dh, auth)
                VALUES ($1, $2, $3, $4)
                RETURNING notif_id
                `,
            [endpoint, expiration_time, p256dh, auth])
        const notif_id = notif.rows[0].notif_id
        await client.query("INSERT INTO user_notif (user_id, notif_id) VALUES ($1, $2)", [user_id, notif_id])
        await client.query('COMMIT')
        res.status(201).json({ status: 201, message: "Successfully stored notif subscription and mapped user to subscription" })

    } catch (error) {
        await client.query('ROLLBACK')
        console.log("Error occurred while creating subscription object and linking it to user: " + error)
        res.status(500).json({ status: 500, message: "Error occurred while creating subscription object and linking it to user" })
    }
}

const getAllNotifs = async (req, res) => {
    client.query("SELECT * FROM notifs", function(error, results,) {
        if (!error) {
            res.status(200).json(results);
        } else {
            res.status(500).json({
                code: 500,
                message: "unexpected error while fetching all notification objects",
            });
        }
    });
};
const getNotifById = async (req, res) => {
    client.query("SELECT * FROM notifs WHERE notif_id = $1"
        , [req.params.notif_id],
        function(error, results) {
            if (!error) {
                res.status(200).json(results);
            } else {
                res.status(404).json({
                    code: 404,
                    message: "notif not found",
                })
            }
        })
}

const updateNotif = async (req, res) => {
    client.query(
        "UPDATE notifs SET endpoint = $1, expiration_time= $2 , p256dh = $3, auth = $4 WHERE notif_id =$5",
        [
            req.body.endpoint,
            req.body.expiration_time,
            req.body.p256dh,
            req.body.auth,
            req.params.notif_id
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

const deleteNotif = async (req, res) => {
    client.query(
        "DELETE FROM notifs WHERE notif_id = $1",
        [req.params.notif_id],
        function(error, results) {
            if (!error) {
                res.status(204).json({ code: 204, message: "notif deleted successfully" });
            } else {
                res.status(400).json({
                    code: 400,
                    message: "notif not found",
                });
            }
        }
    );
};

module.exports = { saveNotifObject, updateNotif, deleteNotif, getAllNotifs, getNotifById }

