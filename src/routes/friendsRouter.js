const express = require('express');
const router = express.Router();
const cors = require('cors');
const { checkAuthenticated } = require('../middleware/checkAuthentication');
const { makeFriendRequest, getFriendRequest, AcceptOrRejectFriendRequest } = require('../controllers/friendControllers');
router.use(cors());

router.route('/friendRequests').post(checkAuthenticated, makeFriendRequest).get(checkAuthenticated, getFriendRequest).put(checkAuthenticated, AcceptOrRejectFriendRequest);

module.exports = router;