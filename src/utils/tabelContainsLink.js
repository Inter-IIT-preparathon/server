const {client} = require("../config/configDB")
const tableContainsLink = async (tableName, column1, column2, id1, id2, cacheName) => {
    let contains = false;
    const isInCache = cacheName.has(String(id1) + '-' + String(id2));
    if (isInCache) {
        contains = true;
    } else {
        try {
            const results = await client.query(
                `SELECT EXISTS (SELECT * FROM ${tableName} WHERE ${column1} = $1 AND ${column2} = $2)`,
                [id1, id2]
            );
            if (results.rows[0].exists) {

                cacheName.add(String(id1) + '-' + String(id2))
            }
            return results.rows[0].exists
        } catch (error) {
            console.log(
                `Error occurred while checking if entry already exists in ${tableName} table: ` +
                error
            );
        }
    }
    return contains;
};

module.exports = tableContainsLink
