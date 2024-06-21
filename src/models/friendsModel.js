const {client} = require("../config/configDB");

//friendship table
const createFriendsTable = async () => {
    try {
        const query = `
      CREATE TABLE IF NOT EXISTS friendship (
        friendship_id SERIAL PRIMARY KEY,
        user1_id INT,
        user2_id INT,
        FOREIGN KEY (user1_id) REFERENCES users(user_id),
        FOREIGN KEY (user2_id) REFERENCES users(user_id)
    );
    `;
        await client.query(query);
    }
    catch (error) {
        console.error('Error creating table:', error);
    }
}

//friend requests table
const createFriendRequestsTable = async () => {
    try {
        const query = `
        CREATE TABLE IF NOT EXISTS friend_requests (
            request_id SERIAL PRIMARY KEY,
            requester_id INT NOT NULL,
            requestee_id INT NOT NULL,
            request_status request_status NOT NULL,
            FOREIGN KEY (requester_id) REFERENCES users(user_id),
            FOREIGN KEY (requestee_id) REFERENCES users(user_id)
        );
        `
        await client.query(query);
    } catch (error) {
        console.error('Error creating friend_requests table:', error);
    }
}

module.exports = { createFriendsTable, createFriendRequestsTable }
