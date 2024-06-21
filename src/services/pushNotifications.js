// const webpush = require('web-push')
// const { client } = require("../config/configDB.js")
// const { getAllCommunityRequestObjects } = require('../controllers/communityRequestController.js')

// webpush.setVapidDetails(
//     'mailto:example@yourdomain.org',
//     process.env.VAPID_PUBLIC_KEY,
//     process.env.VAPID_PRIVATE_KEY
// )

// //in the client side, the coordinates should be in location, and in coordinates
// async function sendSecurityNotif(userId, message, coordinates) {
//     try {
//         const allEntries = new Set()
//         const friends = await getAllFriendsSubscriptions(userId)
//         friends.forEach((object) => {
//             allEntries.add(object)
//         })
//         const communities = await getAllCommunitiesOfUser(userId)
//         communities.forEach(async (communityId) => {
//             const communitySubscriptions = await getAllCommunityMembersSubscription(communityId)
//             communitySubscriptions.forEach((object) => {
//                 allEntries.add(object)
//             })
//         })
//         sendNotification(allEntries, "Security Alert", message, "security", coordinates)
//     }
//     catch (err) {
//         console.log("Error occurred while sending security notification: " + err)

//     }
// }

// async function notifyFriends(userId, title, message) {
//     try {
//         notifObjects = await getAllFriendsSubscriptions(userId)
//         await sendNotification(notifObjects, title, message, "casual")
//     }
//     catch (err) {
//         console.log("error while sending notifications to friends: " + err)
//     }
// }

// async function notifyUser(userId, title, message) {
//     try {
//         const notifObject = await getUserSubscription(userId)
//         await sendNotification(notifObject, title, message, "casual")
//     }
//     catch (err) {
//         console.log("error while sending notifications to friends: " + err)
//     }
// }

// async function notifyCommunityMembers(communityId, title, message) {
//     try {
//         const notifObjects = await getAllCommunityMembersSubscription(communityId)
//         sendNotification(notifObjects, title, message, "casual")
//     }
//     catch {
//         console.log("Error occurred while notifying all community members" + err)
//     }
// }

// async function getUserSubscription(userId) {

//     try {
//         const notifObjects = await client.query(`SELECT n.*
// FROM notifs n
// JOIN user_notif un ON n.notif_id = un.notif_id
// WHERE un.user_id = $1;
// `, [userId])
//         return notifObjects
//     }


//     catch (err) {
//         console.log("An error occurred while getting user subscription object from db: " + err)
//     }
// }


// async function getAllFriendsSubscriptions(userId) {

//     try {
//         const friends = new Set()
//         const friendsQuery = `
//     SELECT
//     CASE
//     WHEN user1_id = $1 THEN user2_id
//     ELSE user1_id
//     END AS friend_id
//     FROM friendship
//     WHERE user1_id = $1 OR user2_id = $1;
// `
//         const communityUsers = await client.query(friendsQuery, [userId]);
//         communityUsers.rows.forEach((friend) => {
//             friends.add(friend.friend_id)
//         });


//         const notifObjects = await client.query(`SELECT n.*
//       FROM notifs n
//       JOIN user_notif un ON n.notif_id = un.notif_id
//       WHERE un.user_id = ANY($1::int[]);
// `, [[...friends]])

//         return notifObjects
//     }
//     catch (err) {
//         console.log("Error occurred while fetching the subscription ids of all the friends of user: " + err)

//     }
// }

// async function getAllCommunityMembersSubscription(communityId) {

//     try {
//         const friends = new Set()
//         const communityQuery = `
//     SELECT
//     user_id FROM community_users
//     WHERE community_id = $1;
// `
//         const communityUsers = await client.query(communityQuery, [communityId]);
//         communityUsers.rows.forEach((row) => {
//             friends.add(row.user_id)
//         });


//         const notifObjects = await client.query(`SELECT n.*
//       FROM notifs n
//       JOIN user_notif un ON n.notif_id = un.notif_id
//       WHERE un.user_id = ANY($1::int[]);
// `, [[...friends]])

//         return notifObjects
//     }
//     catch (err) {
//         console.log("Error while fetching subscription ids of all the community members of user: " + err)
//     }


// }
// async function getAllCommunitiesOfUser(userId) {
//     try {
//         const communities = new Set()
//         const communityIds = await client.query("SELECT community_id from community_users WHERE user_id = $1", [userId])
//         communityIds.forEach((row) => {
//             communities.add(row.community_id)
//         })
//         return communities
//     }
//     catch (err) {
//         console.log("Error occurred while getting all community ids of user: " + err)
//     }
// }
// async function sendNotification(notifObjects, title, message, type, coordinates) {
//     try {
//         notifObjects.rows.map((result) => {
//             let sub = { endpoint: result.endpoint, expiration_time: result.expiration_time, keys: { auth: result.auth, p256dh: result.p256dh } }
//             if (coordinates) {
//                 webpush.sendNotification(sub, `{ "title": "${title}", "type": "${type}", "message": "${message}", "coordinates": "${coordinates}"`);
//             }
//             else {
//                 webpush.sendNotification(sub, `{ "title": "${title}", "type": "${type}", "message": "${message}"}`);
//             }
//         }
//         )
//     }
//     catch (err) {
//         console.log(err)
//     }
// }
// module.exports = { sendSecurityNotif, notifyUser, notifyFriends, notifyCommunityMembers }




