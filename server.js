const app = require('./app.js');
const { createUsersTable, createUserBioTable } = require("./src/models/userModel");
const {
  createTrip, createCommunityTripTable, createUserTripTable, createTripJoinRequestTable
  // , createCommunityAdminTable
} = require('./src/models/tripModels');
const { createFriendsTable, createFriendRequestsTable } = require('./src/models/friendsModel.js');
const { createCommunityRequestTable, createCommunitiesTable } = require('./src/models/communityModel.js');
const { createNotificationObjectTable, createUserNotifTable } = require('./src/models/notificationModel.js');
const PORT = process.env.PORT || 4000;

// Database Models
createUsersTable();
createUsersTable();
createTrip();
createCommunityRequestTable();
createCommunitiesTable()
createNotificationObjectTable()
createUserNotifTable()
createFriendsTable();
createFriendRequestsTable();
createUserBioTable();
createCommunityTripTable();
createUserTripTable();
createTripJoinRequestTable();


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
