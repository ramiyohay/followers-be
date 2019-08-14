'use strict';

const config = require('config'); //http://lorenwest.github.io/node-config/
const {Pool, Client} = require('pg');
const chalk = require('chalk');
const bcrypt = require('bcrypt');
let pgClient;

const _hashPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

/**
 * Class for handling all DB actions
 */
class DbHelper {
    static getPGClient() {
        return pgClient;
    }

    static connect() {
        return new Promise(function (resolve, reject) {
            const dbConfig = config.get('postgresDB');
            const pool = new Pool(dbConfig);

            pool.connect(function (err, client, done) {
                if (err) {
                    if (client) client.end();
                    console.log(chalk.red(`error connecting to PG! ${err}`));

                    reject();
                } else {
                    pgClient = client;
                    console.log(chalk.green(`Connected to PG`));

                    resolve();
                }
            });
        });
    }

    static disconnect() {
        if (pgClient) {
            pgClient.end();
            pgClient = null;

            console.log(chalk.green('Disconnected from PG'));
        } else {
            console.log(chalk.yellow('Not connected to PG so no need to disconnect'));
        }
    }

    static doSeeding() {
        pgClient.query('TRUNCATE users,groups;', [], (err, res) => {
            if (err) console.log(err.stack);
            else {
                this.insertNewUser(1, 'user1', 'user1', 1, []);
                this.insertNewUser(2, 'user2', 'user2', 2, []);
                this.insertNewUser(3, 'user3', 'user3', 3, []);
                this.insertNewUser(4, 'user4', 'user4', 4, []);
                this.insertNewUser(5, 'user5', 'user5', 5, []);
                this.insertNewUser(6, 'user6', 'user6', 1, []);
                this.insertNewUser(7, 'user7', 'user7', 2, []);
                this.insertNewUser(8, 'user8', 'user8', 3, []);
                this.insertNewUser(9, 'user9', 'user9', 4, []);
                this.insertNewUser(10, 'user10', 'user10', 5, []);

                this.insertNewGroup(1, 'Group 1');
                this.insertNewGroup(2, 'Group 2');
                this.insertNewGroup(3, 'Group 3');
                this.insertNewGroup(4, 'Group 4');
                this.insertNewGroup(5, 'Group 5');
            }
        });
    }

    static insertNewUser(id, username, password, groupId, followersIds) {
        const text = 'INSERT INTO users(id,name,password_hash,group_id,followers_ids) VALUES($1,$2,$3,$4,$5)';
        const values = [id, username, _hashPassword(password), groupId, followersIds];

        pgClient.query(text, values, (err, res) => {
            if (err) console.log(err.stack);
            else {
                console.log(chalk.cyan(`Seeded user ${username} with password ${password}`));
            }
        });
    };

    static insertNewGroup(id, name) {
        const text = 'INSERT INTO groups(id,name) VALUES($1,$2)';
        const values = [id, name];

        pgClient.query(text, values, (err, res) => {
            if (err) console.log(err.stack);
            else {
                console.log(chalk.cyan(`Seeded group ${name}`));
            }
        });
    };

    static handleUserFollowing(userId, userIdToUpdate, isFollowing) {
        return new Promise(function (resolve, reject) {
            let text = 'SELECT followers_ids FROM users WHERE id = $1';
            let values = [userIdToUpdate];

            if (!pgClient) resolve(null);
            else {
                pgClient.query(text, values, (err, res) => {
                    if (err) {
                        console.log(err.stack);
                        resolve(false);
                    } else {
                        let arrFn = isFollowing ? 'array_append' : 'array_remove';
                        text = `UPDATE users SET followers_ids=${arrFn}( followers_ids, $2 ) WHERE id = $1`;
                        values = [userIdToUpdate, parseInt(userId)];

                        pgClient.query(text, values, (err, res) => {
                            if (err) {
                                console.log(err.stack);
                                resolve(false)
                            } else {
                                resolve(true);
                            }
                        });
                    }
                });
            }
        });
    }

    static getUserFollowingData(userId) {
        return new Promise(function (resolve, reject) {
            const text =
                'SELECT u.id,u.name,u.followers_ids,g.name as group_name FROM users u' +
                ' INNER JOIN groups g ON u.group_id = g.id ' +
                ' WHERE u.id != $1';

            const values = [userId];

            if (!pgClient) resolve(null);
            else {
                pgClient.query(text, values, (err, res) => {
                    if (err) {
                        console.log(err.stack);
                        resolve(null);
                    } else {
                        res.rows.forEach((row) => {
                            row.total_followers = row.followers_ids.length;
                            row.following = row.followers_ids.includes(parseInt(userId));
                            delete row.followers_ids;
                        });

                        resolve(res.rows);
                    }
                });
            }
        });
    }
}

module.exports = DbHelper;
