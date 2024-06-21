const express = require("express")
const { addTripToCommunity, createCommunity, deleteCommunity, getAllCommunities, getAllTripsOfCommunity, getCommunityById, removeTripFromCommunity, updateCommunity, getAllUsersOfCommunity, addUserToCommunity, removeUserFromCommunity } = require("../controllers/communityController");
const { deleteTrip, UpdateTrip, getTripById } = require("../controllers/tripController");
const { getUserById } = require("../controllers/userControllers.js");
const { checkAuthenticated } = require("../middleware/checkAuthentication.js")



const router = express.Router();


router.route("/").get(checkAuthenticated, getAllCommunities).post(checkAuthenticated, createCommunity)
router.route("/:community_id").get(checkAuthenticated, getCommunityById).put(checkAuthenticated, updateCommunity).delete(checkAuthenticated, deleteCommunity)
router.route("/:community_id/trips").get(checkAuthenticated, getAllTripsOfCommunity)
router.route("/:community_id/trips/:trip_id").get(checkAuthenticated, getTripById).post(checkAuthenticated, addTripToCommunity).delete(checkAuthenticated, removeTripFromCommunity).delete(checkAuthenticated, deleteTrip).put(checkAuthenticated, UpdateTrip);

// TODO: add the function that corresponds to getTripById here at the get endpoint of /:trip_id;
// TODO: add error handling for when user tries to update a community that does not exist

module.exports = router
