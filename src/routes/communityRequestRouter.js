const express = require("express");
const { getAllCommunityRequestObjects, createCommunityRequestObject, getCommunityRequestObjectByRequestId, updateCommunityRequestObject, deleteCommunityRequestObjectById, updateCommunityRequestStatus } = require("../controllers/communityRequestController");
const router = express.Router();
const { checkAuthenticated } = require("../middleware/checkAuthentication.js")

router.route("/").get(getAllCommunityRequestObjects).post(checkAuthenticated, createCommunityRequestObject)
router.route("/:community_request_id").get(getCommunityRequestObjectByRequestId).delete(deleteCommunityRequestObjectById)
    .put(checkAuthenticated, (req, res) => {
        console.log("request received")
        if (!req.headers.set_request_status) {
            updateCommunityRequestObject(req, res)
        }
        else {
            updateCommunityRequestStatus(req, res)
        }
    })

// TODO: add the function that corresponds to getTripById here at the get endpoint of /:trip_id;
// TODO: add error handling for when user tries to update a community that does not exist

module.exports = router
