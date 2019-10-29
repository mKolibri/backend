const cryptoRandomString = require('crypto-random-string');
const configs = require('../configs');

module.exports.addToken = async function(userID) {
    const key = cryptoRandomString({length: 10});
    const token = userID + key;
    configs.connection.query(`INSERT tokens(token, userID) VALUES (?, ?)`,
        [token, userID], (error) => {
            if (error) {
                return console.error(error.message);
            }
            console.log("Token created and inserted");
    });

    return token;
};

module.exports.checkToken = async function(userID, token) {
    try {
        configs.connection.query(`SELECT * FROM tokens WHERE userID = ?`,
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

                    array.filter((value) => {
                        return (value === token);
                    });
            }
        });
    } catch (err) {
        return false;
    }
};

module.exports.deleteToken = async function(userID, token) {
    try {
        configs.connection.query(`DELETE FROM tokens WHERE userID = ? AND token = ?`,
            [ userID, token ], (error) => {
            if (error) throw error;
        });
        return true;
    } catch (err) {
        return false;
    }
};