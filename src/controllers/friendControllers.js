const { client } = require('../config/configDB');

//make friend request
const makeFriendRequest = async(req, res, next) => {
    const user1_id = req.user.id;
    const user2_id = req.body.user_id;

    try {
        client.query(`INSERT INTO friend_requests (user1_id, user2_id) VALUES ($1, $2)`,[user1_id, user2_id]);
    } catch (error) {
        next(error);
    }
}

//get friend requests
const getFriendRequest = async(req, res, next) => {
    const user_id = req.user.id;

    try {
        client.query(`SELECT user1_id FROM friend_requests WHERE user2_id = $1`,[user_id],(err, results) => {
            if(err){
                throw err;
            } else {
                res.status(204).json({result : results.rows})
            }
        })
    } catch (error) {
        next(error);
    }
}

//Accept or Reject Friend Request
const AcceptOrRejectFriendRequest = async(req, res, next) => {
    const user1_id = req.user.id;
    const action = req.body.action;
    const user2_id = parseInt(req.body.user_id, 10);

    try {
        if(action)
        {
            client.query(`INSERT INTO friendship (user1_id, user2_id) VALUES ($1, $2)`,[user1_id, user2_id]);
        }
        client.query(`DELETE FROM friend_requests WHERE user1_id = $1 AND user2_id = $2`,[user2_id, user1_id]);
    } catch (error) {
        next(error);
    }
}

module.exports = {makeFriendRequest, getFriendRequest, AcceptOrRejectFriendRequest};