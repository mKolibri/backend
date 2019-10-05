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
                    for ( let i = 0; i < columns.length; ++i ) {
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

                    values = values.substring(0, values.length - 1);
                    values += ")";
                    const tableID = results.insertId;
                    const tableName = "t" + tableID;
                    
                    connection.query("CREATE TABLE " + tableName + values,
                        (err) => {
                            if (err) {
                                throw err;
                            } else {
                                return res.status(200).json({
                                    name : tableName
                                });
                            }
                    });
                });
    } else {
        return res.status(400).json({
            message: "Incorrect token"
        });
    }
}

let showTable = async function (req, res) {
    console.log("userID: " + req.query.userID);
    console.log("token: " + req.query.token);
    console.log("name: " + req.query.name);
    const userID = req.query.userID;
    const token = req.query.token;
    const name = req.query.name;
    const tableID = substring(1, name.length);


    if (!userID || !token) {
        res.status(401).json({
            message: "Empty data"
        });
    }
    console.log("1")

    const isTokenExist = Token.checkToken(userID, token);
    if (isTokenExist) {
        console.log("2")
        onnection.query('SELECT * FROM tables WHERE tableID = ?',
            [ tableID ], (err, result) => {
                if (err) {
                    throw err;
                } else if (!result[0]) {
                    return res.status(400).json({
                        message: "Incorrect user"
                    });
                } else if (result[0].name) {
                    console.log("3")
                    const table = result[0].name;
                    const desc = result[0].description;
                    connection.query("SHOW COLUMNS FROM ?",
                        [ name ], (err, results) => {
                            if (err) {
                                throw err;
                            } else {
                                console.log("4")
                                const count = results.length;
                                const columns = [];
                                for (let i = 0; i < count; ++i) {
                                    let value = {
                                        column: results[i].Field,
                                        type : results[i].Type
                                    }
                                    columns.push(value);
                                }

                                console.log("1")
                                return res.status(200).json({
                                    columns: columns,
                                    tableName: table,
                                    description: desc
                                });
                            }
                    });
                }
        });
    } else {
        return res.status(400).json({
            message: "Incorrect token"
        });
    }
}

module.exports.getTables = getTables;
module.exports.addTable = addTable;
module.exports.showTable = showTable;