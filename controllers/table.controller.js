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

let addTable = async function (req, res) {
    const userID = req.body.userID;
    const token = req.body.token;
    const name = req.body.name;
    const description = req.body.description;
    const columns = req.body.columns;

    console.log(userID);
    console.log(token);
    console.log(name);
    console.log(description);
    console.log(columns);

    if (!userID || !token) {
        res.status(401).json({
            message: "Empty data"
        });
    }

    const isTokenExist = Token.checkToken(userID, token);
    if (isTokenExist) {
        connection.query(`INSERT INTO tables (userID, name, description, date) VALUES (?, ?, ?, DATE)`,
            [ userID, name, description ], (err, results) => {
                if (err) {
                    throw err;
                } else if (results) {
                    var values = "( ";
                    console.log("columns: " + columns.length);
                    for ( let i = 0; i < columns.length; ++i ) {
                        console.log(values + " " + columns[i].type);
                            values += columns[i].column;
                            if (columns[i].type === "Number") {
                                values += " INTEGER,";
                            } else if (columns[i].type === "Date") {
                                values += " DATE,";
                            } else if (columns[i].type === "String") {
                                values += " VARCHAR(255),";
                            }
                        }
                    }

                    console.log(values + "ho");
                    values = values.substring(0, values.length - 1);
                    console.log(values + "ho");                    
                    values += ")";
                    const tableID = results.insertId;
                    const tableName = "t" + tableID;
                    console.log("CREATE TABLE [IF NOT EXISTS] " + tableName +  values);
                    
                    connection.query("CREATE TABLE ? " + values,
                        [ tableName ], (err, results) => {
                            if (err) {
                                throw err;
                            } else {
                                console.log("Table created: " + results);
                            }
                    });
                });
    } else {
        return res.status(400).json({
            message: "Incorrect token"
        });
    }
}

module.exports.getTables = getTables;
module.exports.addTable = addTable;