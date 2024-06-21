const {client} = require("../config/configDB");

// Create the users table
const createUsersTable = async () => {
    try {
        const query = `
    CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        user_name VARCHAR(255) NOT NULL,
        user_email VARCHAR(255) NOT NULL UNIQUE,
        user_password VARCHAR(255) NOT NULL,
        user_bio TEXT,
        user_mobile VARCHAR(20)
    );
    `;

        await client.query(query);
    } catch (error) {
        console.error('Error creating table:', error);
    }
};

//create user Bio table
const createUserBioTable = async (req, res, next) =>{
    try {
        client.query(`
            CREATE TABLE IF NOT EXISTS user_bio (
                bio_id SERIAL PRIMARY KEY,
                user_id INT,
                user_phone INT,
                user_fav_location VARCHAR(100),
                user_preffered_vehicle VARCHAR(30),
                user_profile_photo VARCHAR(255),
                bio TEXT
            );
        `)
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createUsersTable, createUserBioTable
}
