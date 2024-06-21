const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET

const checkAuthenticated = (req, res, next) => {
    const token = req.headers['auth-token']
    // const token = req.cookies['authToken'];
    if(!token)
    {
        res.status(401).send({error : "Please authenticate  using a valid token"})
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ error: "Please authenticate using a valid token" })
    }
}

module.exports = { checkAuthenticated }
