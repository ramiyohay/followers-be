"use strict";

const path = require('path');
const DbHelper = require(path.resolve('./helpers/db.helper.js'));

module.exports.connect = async () => {
    await DbHelper.connect(); // we use async/await to make this method run in synchronization
};

module.exports.disconnect = () => {
    DbHelper.disconnect();
};

module.exports.getPGClient = () => {
    return DbHelper.getPGClient();
};

module.exports.doSeeding = () => {
    DbHelper.doSeeding();
};

module.exports.getUserFollowingData = async (userId) => {
    return await DbHelper.getUserFollowingData(userId);
};

module.exports.followUser = async (userId, userIdToFollow) => {
    return await DbHelper.handleUserFollowing(userId, userIdToFollow, true);
};

module.exports.unFollowUser = async (userId, userIdToUnfollow) => {
    return await DbHelper.handleUserFollowing(userId, userIdToUnfollow, false);
};

