const { client } = require("../config/configDB.js")
const usernameCache = new Map()


async function getNameOfId(userId) {
    try {
        if (usernameCache.has(userId)) {
            return usernameCache.get(userId)
        }
        else {
            const userName = await client.query("SELECT user_name FROM users WHERE user_id = $1", [userId])
            usernameCache.set(userId, userName.rows[0].user_name)
            return userName.rows[0].user_name
        }
    } catch (err) {
        console.log(err)
    }
}
module.exports = { getNameOfId }
