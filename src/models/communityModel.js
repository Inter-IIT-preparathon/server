
const {client} = require("../config/configDB");



const createCommunitiesTable = () => {

    client.query(`
            CREATE TABLE IF NOT EXISTS communities (
                community_id SERIAL PRIMARY KEY,
                community_name VARCHAR(255) NOT NULL,
                community_desc VARCHAR(255),
                community_admin_id INT NOT NULL,
                FOREIGN KEY (community_admin_id) references users (user_id)
            );
            `, (err, res) => {
        if (err) {
            console.error('Error creating communities table:', err);
        }``
    });


}

const createCommunityRequestTable = async () => {
    // createStatus()
    // createTypes()

    client.query(`
CREATE TABLE IF NOT EXISTS community_requests (
    request_id SERIAL PRIMARY KEY,
    community_id INT NOT NULL,
    user_id INT NOT NULL,
    admin_id INT NOT NULL,
    request_type request_type NOT NULL,
    request_status request_status NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (community_id) REFERENCES communities(community_id),
    FOREIGN KEY (admin_id) REFERENCES users(user_id)
);
`, (err, res) => {
        if (err) {
            console.error('Error creating communities_requests table:', err);
        }
    });


}

const createStatus = () => {
    client.query(`
    SELECT typname FROM pg_type WHERE typname = 'request_status';`, (err, res) => {
    if (err) {
        console.log("Error checking for existing enum type: " + err);
    } else if (res.rows.length === 0) {
        // The enum type does not exist, so create it
        client.query(`
            CREATE TYPE request_status AS ENUM ('accepted', 'rejected', 'pending');`, (err, res) => {
            if (err) {
                console.log("Error while creating status type: " + err);
            } else {
                console.log('request_status type created successfully');
            }
        });
    } else {
        // The enum type already exists
    }
})
}
const createTypes = () => {
    client.query(`
    SELECT typname FROM pg_type WHERE typname = 'request_type';`, (err, res) => {
        if (err) {
            console.log("Error checking for existing enum type: " + err);
        } else if (res.rows.length === 0) {
            // The enum type does not exist, so create it
            client.query(`
            CREATE TYPE request_type AS ENUM ('invite', 'request');`, (err, res) => {
                if (err) {
                    console.log("Error while creating type type: " + err)
                }});
        } else {
            // The enum type already exists
        }
    })
}

const createCommunitiesTripsTable = () => {
    client.query(`
        CREATE TABLE IF NOT EXISTS community_trips (
            community_trips_id SERIAL PRIMARY KEY,
            community_id INT NOT NULL,
            trip_id INT NOT NULL,
            FOREIGN KEY (community_id) REFERENCES communities(community_id),
            FOREIGN KEY (trip_id) REFERENCES trips(trip_id)
        );
        `, (err, res) => {
        if (err) {
            console.error('Error creating community_trips table:', err);
        } else {
            console.log('Community_trips table created successfully');
        }
    });
}

//create table which user with community
const createUserCommunityTable = async () => {
    try {
        const query = `
    CREATE TABLE IF NOT EXISTS user_community (
      user_community_id SERIAL PRIMARY KEY,
      user_id INT,
      community_id INT,
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (community_id) REFERENCES communities(community_id)
  );
  `;
        await client.query(query);
    } catch (error) {
        console.error('Error creating table:', error);
    }
}

// create community trip table
const createCommunityAdminTable = async (req, res, next) => {
    try {
        client.query(`CREATE TABLE IF NOT EXISTS community_admin (
            community_admin_id SERIAL PRIMARY KEY,
            user_id INT,
            community_id INT,
            FOREIGN KEY (user_id) REFERENCES users (user_id),
            FOREIGN KEY (community_id) REFERENCES communities (community_id)
        );`)
    } catch (error) {
        next(error);
    }
}

module.exports = { createCommunitiesTripsTable, createCommunitiesTable, createCommunityAdminTable, createUserCommunityTable,createCommunityRequestTable }
