const express = require('express');
const router = express.Router();
const passport = require('passport');
const DBHandler = require('../modules/db/db.handler');

/**
 * Get user following data route
 */
router.post('/follow_data', function (req, res, next) {
    DBHandler.getUserFollowingData(req.body.userId).then((rows) => {
        res.status(rows ? 200 : 500).send(rows);
    });
});

/**
 * Follow user route
 */
router.post('/follow_user', function (req, res, next) {
    DBHandler.followUser(req.body.userId, req.body.userIdToFollow).then((success) => {
        res.status(success ? 200 : 500).send();
    });
});

/**
 * Unfollow user route
 */
router.post('/unfollow_user', function (req, res, next) {
    DBHandler.unFollowUser(req.body.userId, req.body.userIdToUnfollow).then((success) => {
        res.status(success ? 200 : 500).send();
    });
});

/**
 * Logout route
 */
router.post('/logout', function (req, res, next) {
    req.logout(); // this cleans the passport object from the session
    req.session.destroy((err) => {
    }); // kill the session

    res.end();
});

/**
 * Login route
 */
router.post('/login', passport.authenticate('local-strategy'), // local-strategy is the name of the strategy in local-strategy.js
    function (req, res) {
        req.login(req.user, function (err) { // this will add req.passport with the data from the passport.serializeUser method
            if (err) {
                res.status(400).send(err);
            } else {
                const userObj = {
                    id: req.user.id,
                    username: req.user.username,
                };

                res.json({user: userObj});
            }
        });
    }
);

module.exports = router;
