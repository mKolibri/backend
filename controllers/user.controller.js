const configs = require('../configs');
const db = require('../database/db');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const loginUser = function(req, res) {
    let user = {
        mail: req.body.mail,
        password: req.body.password
    };

    if (!user.mail || !user.password) {
        configs.logger.warn(`Empty data for login`);
        return res.status(400).json({
            message: "Empty data, the server did not understand the request"
        });
    }

    db.connection.query(`SELECT * FROM users WHERE mail = ?`,
        [ user.mail ], function(err, results) {
            if (err) {
                configs.logger.error(err.message);
                throw err;
            } else if (!results[0]) {
                configs.logger.warn(`Incorrect mail or password: ${user.mail}`);
                return res.status(401).json({
                    message: "Incorrect mail or password"
                });
            } else {
                if (bcrypt.compareSync(user.password, results[0].password)) {
                    req.session.loggedin = true;
                    req.session.userID = results[0].userID;
                    configs.logger.debug(`Succesfully logged in user: ${user.mail}`);
                    return res.status(200).json({
                        message: "Succesfully logged in"
                    });
                } else {
                    configs.logger.warn(`Incorrect mail or password: ${user.mail}`);
                    return res.status(401).json({
                        message: "Incorrect mail or password"
                    });
                }
            }
        });
}

const userRegistration = function(req, res) {
    if (!req.body.mail || !req.body.password || !req.body.name) {
        configs.logger.warn(`Less data for user registration:`);
        return res.status(400).json({
            message: "Empty data, the server did not understand the request"
        });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        configs.logger.warn(`Received an invalid response from the upstream server registration: ${req.body.mail}`);
        console.log(errors.array())
        return res.status(502).json(errors.array());
    }

    const mail = req.body.mail;
    try {
        db.connection.query(`SELECT * FROM users where mail = ?`,
            [ mail ], function(err, results) {
                if (err) {
                    configs.logger.error(err.message);
                    throw err;
                } else if (!results[0]) {
                    const user = {
                        name: req.body.name,
                        surname: req.body.surname,
                        age: req.body.age,
                        password: req.body.password,
                        mail: mail
                    };
                    configs.logger.debug(`User registration with mail: ${user.mail}`);

                    if (user.name && user.mail && user.password) {
                        const cryptPass = bcrypt.hashSync(user.password, 16);
                        db.connection.query(`INSERT INTO users(name, surname, age, mail, password)
                            VALUES (?, ?, ?, ?, ?)`, [user.name, user.surname, user.age, user.mail, cryptPass],
                            function(err, result) {
                                if (err) {
                                    configs.logger.error(err.message);
                                    throw err;
                                } else if (!result[0]) {
                                    const userID = result.insertId;
                                    configs.logger.info(`User registrated with userID: ${userID}`);
                                    req.session.loggedin = true;
                                    req.session.userID = userID;
                                    return res.status(200).json({
                                        message: "Succesfully registrated"
                                    });
                                }
                        });
                    } else {
                        configs.logger.warn(`Empty data for user registartion`);
                        return res.status(400).json({
                            message: "Empty data, the server did not understand the request"
                        });
                    }
                } else {
                    configs.logger.warn(`E-mail addres is already exist: ${mail}`);
                    return res.status(500).json({
                        message: "E-mail addres is already exist"
                    });
                }
        });
    } catch (error) {
        configs.logger.error(error.message);
        return res.status(505).json({
            message: error.message
        });
    }
};

const userLogout = function(req, res) {
    if (req.session) {
        configs.logger.debug(`user logout: ${req.session.userID}`);
        req.session.destroy(function() {
            req.session = null;
            req.session.userID = '';
            req.session.loggedin = false;
            res.clearCookie('connect.sid');
            return res.status(200).json({
                message: "Successfully logouted"
            });
        })
    }

    configs.logger.warn(`user already log outed`);
    return res.status(200).json({
        message: "Logouted"
    });
}

const getUserInfo = function(req, res) {
    const userID = req.session.userID;
    if (req.session.loggedin) {
        db.connection.query('SELECT * FROM users WHERE userID = ?',
            [ userID ], function(err, result) {
                if (err) {
                    configs.logger.error(err.message);
                    throw err;
                } else if (!result[0]) {
                    configs.logger.warn(`Needs a mail and a password to get info: ${userID}`);
                    return res.status(401).json({
                        message: "The requested page needs a mail and a password."
                    });
                } else {
                    configs.logger.debug(`Information finded for user: ${userID}`);
                    return res.status(200).json({
                        name: result[0].name,
                        age: result[0].age,
                        mail: result[0].mail,
                        surname: result[0].surname,
                    });
                }
            });
    } else {
        configs.logger.error(`Empty data to get information for user ${userID}`);
        return res.status(400).json({
            message: "Empty data, the server did not understand the request"
        });
    }
}

module.exports = {
    userRegistration: userRegistration,
    loginUser: loginUser,
    getUserInfo: getUserInfo,
    userLogout: userLogout
};