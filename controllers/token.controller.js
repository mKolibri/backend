const cryptoRandomString = require('crypto-random-string');
const connection = require('../db/mysql');

module.exports.addToken = async function(userID) {
    const key = cryptoRandomString({length: 10});
    const token = userID + key + "666";
    try {
        connection.query(`INSERT tokens(token, userID) VALUES (?, ?)`,
            [ token, userID ], (error) => {
                if (error) {
                    return console.error(error.message);
                }
                console.log("Token created and inserted");
            }
        );
        return token;
    } catch (err) {
        console.error(err.message);
    }
};

module.exports.checkToken = async function(userID, token) {
    try {
        connection.query(`SELECT * FROM tokens WHERE userID = ?`,
            [ userID ], (error, results) => {
                if (error) {
                    throw error;
                } else if (!results.length) {
                    return false;
                } else if (results.length) {
                    const array = results.map(
                        function(num) {
                            return num.token;
                        }
                    );

                    var filtered = array.filter((value) => {
                        return (value === token); 
                    });

                    if (filtered.length === 0) {
                        return true;
                    }
                        return false;
            }
        });
    } catch (err) {
        console.error(err.message);
        return false;    
    }
};

module.exports.deleteToken = async function(userID, token) {
    try {
        connection.query(`DELETE FROM tokens WHERE userID = ? AND token = ?`,
            [ userID, token ], (error) => {
            if (error) throw error;
        });
        return true;
    } catch (err) {
        console.error(err.message);
        return false;
    }
};