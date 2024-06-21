const client = require("../config/configDB.js")
const community_request_cache = new Map()
//TODO: add error handling for when rows is 0
const communityRequestLookup = async (request_id) => {

    if (community_request_cache.has(request_id)) {
        console.log("inside cache")
        return community_request_cache.get(request_id)
    }

    else {
        try {
            console.log("inside query")
            const requestObject = await client.query("SELECT * FROM community_requests WHERE request_id = $1", [request_id])
            if (requestObject.rows[0].length != 0) {
                const request = requestObject.rows[0]
                community_request_cache.set(request.request_id, request)
                return request
            }
        }
        catch (err) {
            console.log(err)
        }
    }



}
module.exports = communityRequestLookup
