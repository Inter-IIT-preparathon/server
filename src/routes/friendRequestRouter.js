const express = require("express");
const router = express.Router();
const { checkAuthenticated } = require("../middleware/checkAuthentication.js")
const { getAllFriendRequestObjectsByUserId, createFriendRequestObject, getFriendRequestObjectByRequestId, updateFriendRequestObject, deleteFriendRequestObjectById, updateFriendRequestStatus } = require("../controllers/friendRequestController");

router.route("/").get(checkAuthenticated,getAllFriendRequestObjectsByUserId).post(checkAuthenticated, createFriendRequestObject)
router.route("/:friend_request_id").delete(checkAuthenticated, deleteFriendRequestObjectById)
.put(checkAuthenticated, (req,res) => {
    if (!req.headers.set_request_status) {
        updateFriendRequestObject(req, res)
    }
    else {
        updateFriendRequestStatus(req, res)
    }
})


module.exports = router
