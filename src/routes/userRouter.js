const express = require('express');
const router = express.Router();
const { getAllUsers, updateUser, deleteUser, makeTripJoinRequest, getUserById, getAllTripsOfUser, unlinkTripAndUser, inputUserBio, editUserBio, getUserBio } = require('../controllers/userControllers');
const { getAllTripJoinRequests, getTripById, getAllTripsOfUserFriendsAndCommunity, AllowOrDenyTripJoinRequest } = require('../controllers/tripController');
const {getAllInviteObjectsByUserId} = require('../controllers/tripRequestController')
const {checkAuthenticated} = require('../middleware/checkAuthentication')

const { getAllRequestObjectsByAdminId } = require('../controllers/communityRequestController');

router.get('/', getAllUsers);
router.route('/bio').post(checkAuthenticated, inputUserBio).put(checkAuthenticated, editUserBio).get(checkAuthenticated, getUserBio);
router.route("/:user_id").get(checkAuthenticated,getUserById).put(checkAuthenticated,updateUser).delete(checkAuthenticated,deleteUser);
router.route('/:user_id/trips/joinRequest').post(checkAuthenticated, makeTripJoinRequest)
router.route("/:user_id/trips").get(checkAuthenticated,getAllTripsOfUserFriendsAndCommunity);
router.route("/:user_id/mytrips").get(checkAuthenticated, getAllTripsOfUser);
router.route('/:user_id/trips/:trip_id').get(checkAuthenticated,getTripById).post(checkAuthenticated,AllowOrDenyTripJoinRequest).delete(checkAuthenticated,unlinkTripAndUser);
router.get('/:user_id/trips/:trip_id/join_requests',checkAuthenticated, getAllTripJoinRequests);
router.route('/:user_id/trip_invites').get(checkAuthenticated,getAllInviteObjectsByUserId)

router.route("/:user_id/community_requests").get((req, res) => {
    if (req.headers.request_type == "invite") {
        getAllInviteObjectsByUserId(req, res)
    }
    else if (req.headers.request_type == "request") {
        getAllRequestObjectsByAdminId(req, res)
    }
})

module.exports = router;
