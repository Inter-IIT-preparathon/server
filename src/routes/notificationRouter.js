const express = require("express")
const { checkAuthenticated } = require("../middleware/checkAuthentication.js");
const { getAllNotifs, getNotifById, updateNotif, deleteNotif, saveNotifObject } = require("../controllers/notificationsController.js");
const { notifyFriends, sendSecurityNotif } = require("../services/pushNotifications.js");
const router = express.Router();


router.route("/").get(getAllNotifs).post( checkAuthenticated, saveNotifObject)
router.route("/:notif_id").get(getNotifById).put(updateNotif).delete(deleteNotif)
router.route("/test").post((req, res) => {
    const { user_id, title, message } = req.body
    notifyFriends(user_id, title, message)
})
router.route("/security_alert").post(checkAuthenticated, (req, res) => {
    const user_id = req.user.id
    const message = req.body.message
    const position = req.body.position
    sendSecurityNotif(user_id, message, position)
})



module.exports = router

