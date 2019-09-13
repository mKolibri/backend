const user = require('../db/mysql');
const { validationResult } = require('express-validator');
const Token = require('../token/user.token.js')

let loginUser = async function (req, res) {
    if (req.body) {
        const mail = req.body.email;
        const password = req.body.password;

        if (mail && password) {
            try {
                const userID = await user.query(
                    'SELECT userID FROM mailPass WHERE mail = ? AND password = ?',
                    mail, password,
                    function(err) {
                        if (err) {
                            console.log("Can't find user");
                        } else {
                            console.log(`user ID is: ${userID}`);
                        }
                    }
                );

                if (!userID) {
                    return res.status(404).json({
                        message: "Incorrect username or password"
                    });
                }
                
                const userInfo = user.query('SELECT * FROM users WHERE userId = ?', userID, function (err) {
                    if (err) {
                        console.log("Cant find user");
                    }
                    else
                        console.log(`user is: ${userInfo}`);
                });
                
                userInfo.token = Token.generateToken(userID);

                // TODO get user's table-names and sent

                return res.status(200).json(userInfo);
            } catch (err) {
                return res.status(400).json(err);
            }
        } else {
            return res.status(403).json({
                message: "Not valid email or password"
            });
        }
    } else {
        logger.error(`Login request body is empty`);
        return res.status(405).json({
            message: "Empty data!"
        })
    }
}

let userRegistration = async function (req, res) {
    console.log(req.body.mail);
    console.log(req.body.password);

    if (!req.body.mail && !req.body.password) {
        console.log("Empty data");
        return res.sendStatus(400).json({
            message: "Empty data!"
        });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("Mtav errorneri mej");
        return res.status(422).json(errors.array());
    }

    const mail = req.body.mail;
    console.log("Mail: ", mail);

    try {
        console.log("TRYYYY");
        const userExist = user.query(`SELECT userID FROM mailPass where mail = ?`, mail,
            (err) => {
                if (err) {
                    console.log(err.message);
                } else {
                    console.log("OK");
                }
            });

        if (typeof userExist === "string") {
            return res.status(409).json({ message: 'Mail is already exists'})
        }
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }

    const name = req.body.name;
    const surname = req.body.surname;
    const age = req.body.age;
    const password = req.body.password;

    try {
        user.query(`INSERT INTO users (name, surname, age) VALUES ?`,
            [name, surname, age], (err, result) => {
            if (err)
                throw err;
            console.log(result);
        });

        //TODO insert mail-pass
    } catch (error) {
        console.log(error.message);
        return res.status(404).json({ message: error.message })
    }

    try {
        const userID = user.query('SELECT userID FROM mailPass WHERE mail = ?', mail, function (err) {
            if (err) {
                console.log("Can't find user");
            }
            else {
                console.log(`user ID is: ${userID}`);
            }
        });

        const token = Token.generateToken(userID);
        return res.status(200).json({
            token: token,
            userID: userID
        });
    } catch(err) {
        console.log(err.message);
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
        const token = user.query('SELECT token FROM mailPass where userID = ?', userID, function (err) {
            if (err) {
                console.log(err.message);
            }
            else {
                console.log('OK');
            }
        });

        if (token && token == req.body.token) {
            try {
                await connection.query(
                    `UPDATE mailPass SET token = NULL WHERE userID = ?`, userID,
                    (error, results) => {
                        if (error) {
                            return console.error(error.message);
                        }
                    });
                    return token;
            } catch(err) {
                console.error(err.message);
            }
        }
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }

};

module.exports.userRegistration = userRegistration;
module.exports.loginUser = loginUser;
module.exports.userLogout = userLogout;