const {client} = require("../config/configDB.js")
const friend_requests_cache = new Map()

const friendRequestLookup = async (request_id) => {

    if (friend_requests_cache.has(request_id)) {
        console.log("inside cache")
        return friend_requests_cache.get(request_id)
    }

    else {
        try {
            console.log("inside query")
            const requestObject = await client.query("SELECT * FROM friend_requests WHERE request_id = $1", [request_id])
            if (requestObject.rows.length !== 0) {
                const request = requestObject.rows[0]
                friend_requests_cache.set(request.request_id, request)
                return request
            }
        }
        catch (err) {
            console.log(err)
        }
    }
}
module.exports = friendRequestLookup
