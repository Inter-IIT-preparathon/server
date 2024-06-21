const {client} = require('../config/configDB')
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET
const { OAuth2Client } = require('google-auth-library');


const googleClient = new OAuth2Client({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: 'http://localhost:4000/auth/google/callback',
});

const auth = (req, res, next) => {
    try {
        res.redirect(googleClient.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']
        }));
    } catch (error) {
        next(error);
    }
};

const callback = async (req, res, next) => {
    try {
        const { code } = req.query;
        const { tokens } = await googleClient.getToken(code);

        // Get user information from Google
        const userResponse = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.CLIENT_ID,
            url: 'https://www.googleapis.com/oauth2/v2/userinfo',
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
            },
        });

        const { email, name, at_hash } = userResponse.payload;

        // Check if the user already exists in your database
        const userQuery = await client.query(
            `SELECT * FROM users WHERE user_email = $1`,
            [email]
        );

        if (userQuery.rows.length > 0) {
            const user = userQuery.rows[0];
            const data = {
                user: {
                    id: user.user_id,
                }
            }
            const authToken = jwt.sign(data, JWT_SECRET);

            // Set the authToken cookie
            res.cookie('authToken', authToken, { httpOnly: true });

            return res.json({ success: true, authToken });
        }

        // If the user doesn't exist, create a new user
        const newUserQuery = await client.query(
            `INSERT INTO users (user_name, user_email, user_password)
            VALUES ($1, $2, $3)
            RETURNING user_id`,
            [name, email, at_hash]
        );

        const newUser = newUserQuery.rows[0];
        const data = {
            user: {
                id: newUser.user_id,
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);

        // Set the authToken cookie
        res.cookie('authToken', authToken, { httpOnly: true });

        return res.json({ success: true, authToken });

    } catch (error) {
        next(error);
    }
}


module.exports = { auth, callback };