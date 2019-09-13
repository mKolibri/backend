const cryptoRandomString = require('crypto-random-string');
const connection = require('../db/mysql');

// create token and add in table mailPass
module.exports.generateToken = async function(userID) {
    const key = cryptoRandomString({length: 10});
    const token = userID + key + 666;
    try {
        await connection.query(`UPDATE mailPass SET  token = ? WHERE userID = ?`,
        token, userID, (error, results) => {
            if (error) {
                return console.error(error.message);
            }
            console.log('Rows affected:', results.affectedRows);
        });
        return token;
    } catch(err) {
        console.error(err.message);
    }
};