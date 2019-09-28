const connection = require('../db/mysql');
const Token = require('./token.controller');

let getTables = async function (req, res) {
    const userID = req.query.userID;
    const token = req.query.token;

    if (!userID || !token) {
        res.status(401).json({
            message: "Empty data"
        });
    }
    
    const isTokenExist = Token.checkToken(userID, token);
    if (isTokenExist) {
        connection.query('SELECT * FROM tables WHERE userID = ?',
            [ userID ], (err, result) => {
                if (err) {
                    throw err;
                } else if (!result) {
                    return res.status(400).json({
                        message: "Incorrect user"
                    });
                } else {
                    return res.status(200).json(result);
                }
        });
    } else {
        return res.status(400).json({
            message: "Incorrect token"
        });
    }
}

module.exports.getTables = getTables;