const {client} = require('../config/configDB');
const trip_invite_cache = new Map();

async function tripRequestLookup(invite_id){
    try {
        if(trip_invite_cache.has(invite_id))
        {
            return trip_invite_cache.get(invite_id);
        }
        else{
        
            const requestObject = await client.query(`SELECT * FROM trip_invites WHERE invite_id = $1`,[invite_id]);
            if(requestObject.rows[0].length != 0)
            {
                const request = requestObject.rows[0];

                trip_invite_cache.set(request.invite_id, request);
                return request;
            }

        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = {tripRequestLookup}