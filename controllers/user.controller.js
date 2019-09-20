const user = require('../db/mysql');
const { validationResult } = require('express-validator');
const Token = require('../token/user.token.js')

let loginUser = async function (req, res) {
    const mail = req.body.mail;
    const password = req.body.password;

    if (mail && password) {
        try {
            user.query(`SELECT userID FROM mailPass WHERE mail = ? AND password = ?`,
                [mail, password],
                function (err, results) {
                    if (err) {
                        throw err;
                    } else if (!results[0]) {
                        return res.status(400).json({
                            message: "Can't find user, incorrect mail or password"
                        });
                    } else if (results[0].userID) {
                        const userID = results[0].userID;
                        user.query('SELECT * FROM users WHERE userID = ?',
                            userID,
                            function (err, result) {
                                if (err) {
                                    throw err;
                                } else if (!result) {
                                    return res.status(400).json({
                                        message: "Can't find user, incorrect mail or password"
                                    });
                                } else {
                                    Token.generateToken(userID)
                                        .then(function(value) {
                                            return res.status(200).json({
                                                token: value,
                                                userID: userID
                                            });
                                        }).catch(function(err) {
                                            console.log(err);
                                        });
                                }
                            }
                        );
                    }
                }
            );
        } catch (err) {
            return res.status(505).json({
                message: "Problem with database"
            });
        }
    } else {
        return res.status(403).json({
            message: "Not valid email or password"
        });
    }
}

let userRegistration = async function (req, res) {
    if (!req.body.mail || !req.body.password || !req.body.name) {
        return res.sendStatus(400).json({
            message: "Empty data!"
        });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json(errors.array());
    }

    const mail = req.body.mail;    
    try {
        user.query(`SELECT userID FROM mailPass where mail = ?`, mail,
            function(err, results) {
                if (err) {
                    throw err;
                } else if (!results[0]) {
                    const name = req.body.name;
                    const surname = req.body.surname;
                    const age = req.body.age;
                    const password = req.body.password;
                    user.query(`INSERT INTO users (name, surname, age) VALUES (?,?,?)`,
                    [name, surname, age], function(err, result) {
                        if (err) {
                            throw err;
                        } else if (!results[0]) {
                            try {
                                user.query(`SELECT max(userID) FROM users`,
                                function(err, results) {
                                    if (err) {
                                        throw err;
                                    } else if (!results[0]) {
                                        return res.status(505).json({
                                            message: "Database problem"
                                        });
                                    } else if (results[0]["max(userID)"]) {
                                        const userID = results[0]["max(userID)"];
                                        user.query(`INSERT INTO mailPass (userID, mail, password) VALUES (?,?,?)`,
                                        [userID, mail, password], function(err, result) {
                                            if (err) {
                                                throw err;
                                            } else {
                                                Token.generateToken(userID)
                                                .then(function(value) {
                                                    return res.status(200).json({
                                                        token: value,
                                                        userID: userID
                                                    });
                                                }).catch(function(e) {
                                                    console.log(e);
                                                });
                                            }
                                        });
                                    }
                                });
                            } catch (err) {
                                return res.status(505).json({ message: error.message });
                            }
                        }
                    });
                } else if (results[0].userID) {
                    return res.status(400).json({ message: "Mail already exist" });
                }
            });
    } catch (error) {
        return res.status(505).json({ message: error.message });
    }
};

let userLogout = async function (req, res) {
    if (!req.body) {
        return res.sendStatus(400).json({
            message: "Empty data!"
        });
    }

    const userID = req.body.userID;
    try {
        user.query('SELECT token FROM mailPass where userID = ?', userID,
            function (err, result) {
                if (err) {
                    throw err;
                } else if (!result[0]) {
                    return res.status(505).json({ message: "Database problem" });
                } else if (result[0].token) {
                    const token = result[0].token;
                    if (token == req.body.token) {
                        user.query(`UPDATE mailPass SET token = NULL WHERE userID = ?`,
                            userID, (error, results) => {
                                if (error) {
                                    throw error;
                                } else {
                                    return res.status(200).json({ message: "By!!!" });
                                }
                        });
                    }
                } 
        });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}

let getUserInfo = async function (req, res) {
    const userID = req.query.userID;
    const token = req.query.token;
    if (userID && token) {
        user.query(`SELECT * FROM mailPass WHERE userID = ? AND token = ?`,
            [userID, token],
            function (err, results) {
                if (err) {
                    throw err;
                } else if (!results[0]) {
                    return res.status(400).json({
                        message: "incorrect token"
                    });
                } else if (results[0].mail) {
                    user.query('SELECT * FROM users WHERE userID = ?',
                        userID,
                        function (err, result) {
                            if (err) {
                                throw err;
                            } else if (!result[0]) {
                                return res.status(400).json({
                                    message: "Incorrect token"
                                });
                            } else {
                                return res.status(200).json({
                                    name: result[0].name,
                                    surname: result[0].surname,
                                    age: result[0].age,
                                    mail: results[0].mail
                                });
                            }
                        }
                );
            }
        });
    } else {
        res.status(401).json({
            message: "Empty data"
        });
    }
}

let getUserTables = async function (req, res) {
    const userID = req.query.userID;
    const token = req.query.token;
    if (userID && token) {
        user.query(`SELECT * FROM mailPass WHERE userID = ? AND token = ?`,
            [userID, token],
            function (err, results) {
                if (err) {
                    throw err;
                } else if (!results[0]) {
                    return res.status(400).json({
                        message: "incorrect token"
                    });
                } else if (results[0].mail) {
                    user.query('SELECT * FROM tables WHERE userID = ?',
                        userID,
                        function (err, result) {
                            if (err) {
                                throw err;
                            } else if (!result) {
                                return res.status(400).json({
                                    message: "Incorrect token"
                                });
                            } else {
                                return res.status(200).json(result);
                            }
                        }
                );
            }
        });
    } else {
        res.status(401).json({
            message: "Empty data"
        });
    }
}

module.exports.userRegistration = userRegistration;
module.exports.loginUser = loginUser;
module.exports.getUserInfo = getUserInfo;
module.exports.getUserTables = getUserTables;
module.exports.userLogout = userLogout;