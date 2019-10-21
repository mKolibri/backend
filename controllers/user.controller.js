const configs = require('../configs');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const Token = require('./token.controller');

let loginUser = async function (req, res) {
    const mail = req.body.mail;
    const password = req.body.password;

    if (!mail || !password) {
        return res.status(403).json({
            message: "Empty data"
        });
    }

    try {
        configs.connection.query(`SELECT * FROM users WHERE mail = ?`,
            [ mail ], (err, results) => {
                if (err) {
                    throw err;
                } else if (!results[0]) {
                    return res.status(400).json({
                        message: "Incorrect mail or password"
                    });
                } else if (results[0].password) {
                    if (bcrypt.compareSync(password, results[0].password)) {
                        Token.addToken(results[0].userID)
                            .then((value) => {
                                return res.status(200).json({
                                    token: value,
                                    userID: results[0].userID
                                });
                            }).catch((err) => {
                                return res.status(505).json({
                                    message: "Database problem"
                                });                        
                            });
                    }
                } else {
                    return res.status(400).json({
                        message: "Incorrect mail or password"
                    });
                }
            });
    } catch (err) {
        return res.status(505).json({
            message: err.message
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
        configs.connection.query(`SELECT * FROM users where mail = ?`,
            [ mail ], (err, results) => {
                if (err) {
                    throw err;
                } else if (!results[0]) {
                    const name = req.body.name;
                    const surname = req.body.surname;
                    const age = req.body.age;
                    const password = req.body.password;

                    if (name && mail && password) {
                        const cryptPass = bcrypt.hashSync(password, 6);
                        configs.connection.query(`INSERT INTO users(name, surname, age, mail, password) VALUES (?, ?, ?, ?, ?)`,
                            [name, surname, age, mail, cryptPass], (err, result) => {
                                if (err) {
                                    throw err;
                                } else if (!result[0]) {
                                    configs.connection.query(`SELECT * FROM users where mail = ?`,
                                        [ mail ], (err, result) => {
                                            if (err) {
                                                throw err;
                                            } else if (!result[0]) {
                                                return res.status(505).json({ 
                                                    message: "Something went wrong"
                                                });
                                            } else if (result[0].userID) {
                                                const userID = result[0].userID;
                                                Token.addToken(userID)
                                                    .then((value) => {
                                                        return res.status(200).json({
                                                            token: value,
                                                            userID: userID
                                                        });
                                                    }).catch((e) => {
                                                        return res.status(505).json({ 
                                                            message: e.message
                                                        });
                                                    });
                                            }
                                    });
                            }
                        });
                    } else {
                        return res.status(400).json({
                            message: "Empty data"
                        });
                    }
                } else if (results[0].userID) {
                    return res.status(400).json({
                        message: "E-mail addres is already exist"
                    });   
                }
        });
    } catch (error) {
        return res.status(505).json({
            message: error.message
        });
    }
};

let userLogout = async function (req, res) {
    if (!req.body) {
        return res.sendStatus(400).json({
            message: "Empty data!"
        });
    }
    const userID = req.body.userID;
    const token = req.body.token;
    
    Token.deleteToken(userID, token).then((result) => {
        if (result) {
            return res.status(200).json({
                message: "By !!!"
            });
        }

        return res.status(400).json({
            message: "Incorrect token"
        });    
    }).catch((err) => {
        return res.status(400).json({
            message: err.message
        });
    })

}

let getUserInfo = async function (req, res) {
    const userID = req.query.userID;
    const token = req.query.token;
    if (userID && token) {
        const isTokenExist = Token.checkToken(userID, token);
        if (isTokenExist) {
            configs.connection.query('SELECT * FROM users WHERE userID = ?',
            [ userID ], function (err, result) {
                if (err) {
                    throw err;
                } else if (!result[0]) {
                    return res.status(400).json({
                        message: "Wrong user ID"
                    });
                } else {
                    return res.status(200).json({
                        name: result[0].name,
                        age: result[0].age,
                        mail: result[0].mail,
                        surname: result[0].surname,                    
                    });
                }
            });
        }
    } else {
        return res.status(401).json({
            message: "Empty data"
        });
    }
}

module.exports.userRegistration = userRegistration;
module.exports.loginUser = loginUser;
module.exports.getUserInfo = getUserInfo;
module.exports.userLogout = userLogout;