const client = require("../config/configDB.js")
const community_admin_cache = new Map()
//TODO: add error handling when empty rows
async function adminLookup(community_id) {
    const cachedAdminValue = community_admin_cache.has(community_id)
    if (cachedAdminValue) {
        return community_admin_cache.get(community_id)
    }
    else {
        try {
            const results = await client.query("SELECT community_admin_id FROM communities WHERE community_id =$1", [community_id])
            community_admin_cache.set(community_id, results.rows[0].community_admin_id)
            return results.rows[0].community_admin_id
        }
        catch (err) {
            console.log(err);
            return null;
        }
    }
}
module.exports = { adminLookup }
