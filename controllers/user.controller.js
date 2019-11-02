const configs = require('../configs');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const log4js = require('log4js');
const logger = log4js.getLogger();
logger.level = configs.level;

let loginUser = async function (req, res) {
    const mail = req.body.mail;
    const password = req.body.password;

    if (!mail || !password) {
        logger.warn(`Empty data for login`);
        return res.status(400).json({
            message: "Empty data, the server did not understand the request"
        });
    }

    configs.connection.query(`SELECT * FROM users WHERE mail = ?`,
        [ mail ], (err, results) => {
            if (err) {
                logger.error(err.message);
                throw err;
            } else if (!results[0]) {
                logger.warn(`Incorrect mail or password: ${mail}`);
                return res.status(401).json({
                    message: "Incorrect mail or password"
                });
            } else if (results[0].password) {
                logger.info(`Succesfully logged in user: ${mail}`);
                if (bcrypt.compareSync(password, results[0].password)) {
                    req.session.loggedin = true;
                    req.session.userID = results[0].userID;
                    return res.status(200).json({
                        message: "Succesfully logged in"
                    });
                }
            } else {
                logger.warn(`Incorrect mail or password: ${mail}`);
                return res.status(401).json({
                    message: "Incorrect mail or password"
                });
            }
        });
}

let userRegistration = async function (req, res) {
    if (!req.body.mail || !req.body.password || !req.body.name) {
        logger.warn(`Less data for user registration:`);
        return res.status(400).json({
            message: "Empty data, the server did not understand the request"
        });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Received an invalid response from the upstream server registration: ${req.body.mail}`);
        return res.status(502).json(errors.array());
    }

    const mail = req.body.mail;
    try {
        configs.connection.query(`SELECT * FROM users where mail = ?`,
            [ mail ], (err, results) => {
                if (err) {
                    logger.error(err.message);
                    throw err;
                } else if (!results[0]) {
                    const name = req.body.name;
                    const surname = req.body.surname;
                    const age = req.body.age;
                    const password = req.body.password;
                    logger.debug(`User registration with mail: ${mail}`);

                    if (name && mail && password) {
                        const cryptPass = bcrypt.hashSync(password, 16);
                        configs.connection.query(`INSERT INTO users(name, surname, age, mail, password)
                            VALUES (?, ?, ?, ?, ?)`, [name, surname, age, mail, cryptPass],
                            (err, result) => {
                                if (err) {
                                    logger.error(err.message);
                                    throw err;
                                } else if (!result[0]) {
                                    const userID = result.insertId;
                                    logger.info(`User registrated with userID: ${userID}`);
                                    req.session.loggedin = true;
                                    req.session.userID = userID;
                                    return res.status(200).json({
                                        message: "Succesfully registrated"
                                    });
                                }
                        });
                    } else {
                        logger.warn(`Empty data for user registartion`);
                        return res.status(400).json({
                            message: "Empty data, the server did not understand the request"
                        });
                    }
                } else if (results[0].userID) {
                    logger.warn(`E-mail addres is already exist: ${mail}`);
                    return res.status(500).json({
                        message: "E-mail addres is already exist"
                    });
                }
        });
    } catch (error) {
        logger.error(error.message);
        return res.status(505).json({
            message: error.message
        });
    }
};

let userLogout = async function (req, res) {
    if (req.session.loggedin) {
        req.session.userID = '';
        res.session.loggedin = false;
        logger.debug(`user logout: ${userID}`);
        req.session.destroy(() => {
            return res.status(200).json({
                message: "Successfully logouted"
            });
        })
    }

    logger.warn(`user already log outed: ${userID}`);
    return res.status(200).json({
        message: "Logouted"
    });
}

let getUserInfo = async function (req, res) {
    if (req.session.loggedin) {
        const userID = req.session.userID;
        logger.debug(`get user information: ${userID}`);
        configs.connection.query('SELECT * FROM users WHERE userID = ?',
            [ userID ], function (err, result) {
                if (err) {
                    logger.error(err.message);
                    throw err;
                } else if (!result[0]) {
                    logger.warn(`Needs a mail and a password to get info: ${userID}`);
                    return res.status(401).json({
                        message: "The requested page needs a mail and a password."
                    });
                } else {
                    logger.debug(`Information finded for user: ${userID}`);
                    return res.status(200).json({
                        name: result[0].name,
                        age: result[0].age,
                        mail: result[0].mail,
                        surname: result[0].surname,
                    });
                }
            });
    } else {
        logger.error(`Empty data to get information for user: ${userID}`);
        return res.status(400).json({
            message: "Empty data, the server did not understand the request"
        });
    }
}

module.exports.userRegistration = userRegistration;
module.exports.loginUser = loginUser;
module.exports.getUserInfo = getUserInfo;
module.exports.userLogout = userLogout;