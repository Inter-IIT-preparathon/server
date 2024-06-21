const { client } = require("../config/configDB.js")
//results = await client.query("INSERT INTO notif_subscriptions (endpoint, expiration_time, p256dh, auth) VALUES ($1, $2, $3, $4)",

const createNotificationObjectTable = () => {
    client.query(
        `CREATE TABLE IF NOT EXISTS notifs (
                notif_id SERIAL PRIMARY KEY,
                endpoint TEXT NOT NULL UNIQUE,
                expiration_time VARCHAR(256),
                p256dh VARCHAR(256) NOT NULL,
                auth VARCHAR(256) NOT NULL
            );
`, (err, result) => {
        if (err) {
            console.log("Error creating notif_subscriptions table: " + err)
        }
    }
    )
}

const createUserNotifTable = () => {
    client.query(
        `CREATE TABLE IF NOT EXISTS user_notif (
                user_notif_id SERIAL PRIMARY KEY,
                user_id INT NOT NULL,
                notif_id INT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(user_id),
                FOREIGN KEY(notif_id) REFERENCES notifs(notif_id)
            );
`, (err, result) => {
        if (err) {
            console.log("Error creating user_notif table: " + err)
        }
    }
    )
}
module.exports = { createNotificationObjectTable, createUserNotifTable }
