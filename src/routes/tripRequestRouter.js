const express = require('express');
const Router = express.Router();
const {
    getAllTripRequestsObjects, getTripInviteByInviteId, createTripRequestObjects, deleteTripRequestObjectById, updateTripRequestObject, updateCommunityRequestStatus
} = require('../controllers/tripRequestController');
const {checkAuthenticated} = require('../middleware/checkAuthentication');

Router.route('/').get(getAllTripRequestsObjects).post(checkAuthenticated, createTripRequestObjects);
Router.route('/:trip_request_id').get(getTripInviteByInviteId).delete(deleteTripRequestObjectById).put(checkAuthenticated, (req, res, next) => {
    if(!req.headers.set_request_status)
    {
        updateTripRequestObject(req, res, next);
    }
    else
    {
        updateTripRequestObject(req, res, next);
    }
})

module.exports = Router;
