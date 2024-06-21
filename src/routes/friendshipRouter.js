const express = require("express");
const router = express.Router();
const { checkAuthenticated } = require("../middleware/checkAuthentication.js")
const { deleteFriendship, getAllFriendsOfUser, getAllFriendsOfMine, createFriendship } = require("../controllers/friendController");

router.route("/").delete(checkAuthenticated,deleteFriendship).get(checkAuthenticated, getAllFriendsOfMine).post(checkAuthenticated, createFriendship)
router.route("/:user_id").get(getAllFriendsOfUser)

module.exports = router
