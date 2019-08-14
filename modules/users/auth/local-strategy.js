'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const DBHandler = require('../../db/db.handler');
const bcrypt = require('bcrypt');

/**
 * Passport login handler
 */
module.exports = function () {
    // Use local strategy. This will set the password.authenticate to handle the user login
    passport.use('local-strategy', new LocalStrategy(
        {
            usernameField: 'username', // property in the request
            passwordField: 'password' // property in the request
        },
        function (usernameOrEmail, password, done) { // validate user here
            DBHandler.getPGClient().query('SELECT id, name, password_hash FROM users WHERE name = $1', [usernameOrEmail], (err, result) => {
                if (err) {
                    console.error('Error when selecting user on login', err);
                    return done(err)
                }

                if (result.rows.length > 0) {
                    const firstUser = result.rows[0];

                    bcrypt.compare(password, firstUser.password_hash, function (err, res) {
                        if (res) {
                            done(null, {id: firstUser.id, username: firstUser.name});
                        } else {
                            done(null, false);
                        }
                    })
                } else {
                    done(null, false);
                }
            })
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user) // this is the data under the req.passport. Same data need to be handled in the deserializeUser method
    });

    passport.deserializeUser((user, cb) => {
        DBHandler.getPGClient().query('SELECT id, name FROM users WHERE id = $1', [parseInt(user.id, 10)], (err, results) => {
            if (err) {
                console.error('Error when selecting user on session deserialize', err);
                return cb(err)
            }

            cb(null, results.rows[0])
        })
    });
};
