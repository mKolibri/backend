const configs = require('../configs');
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
        configs.connection.query('SELECT * FROM tables WHERE userID = ?',
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

    console.log("userID: " + userID);
    console.log("token: " + token);

    if (!userID || !token) {
        return res.status(401).json({
            message: "Empty data"
        });
    }

    const isTokenExist = Token.checkToken(userID, token);
    console.log("OK");
    if (isTokenExist) {
        configs.connection.query(`INSERT INTO tables (userID, name, description, date) VALUES (?, ?, ?, DATE)`,
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
                    
                    configs.connection.query("CREATE TABLE " + tableName + values,
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
    console.log("HI");
    console.log("userID: " + req.query.userID);
    console.log("token: " + req.query.token);
    console.log("name: " + req.query.table);
    const userID = req.query.userID;
    const token = req.query.token;
    const name = req.query.table;
    console.log(name);
    const tableID = name.substring(1, name.length);
    console.log(tableID );


    if (!userID || !token) {
        return res.status(401).json({
            message: "Empty data"
        });
    }
    console.log("1");

    const isTokenExist = Token.checkToken(userID, token);
    if (isTokenExist) {
        console.log("2");
        configs.connection.query('SELECT * FROM tables WHERE tableID = ?',
            [ tableID ], (err, result) => {
                if (err) {
                    throw err;
                } else if (!result[0]) {
                    return res.status(400).json({
                        message: "Incorrect user"
                    });
                } else if (result[0].name) {
                    console.log(result[0]);
                    const name = result[0].name;
                    const desc = result[0].description;
                    console.log("table: " + table);
                    console.log("desc: " + desc);
                    configs.connection.query(`SHOW COLUMNS FROM ${name}`,
                        (err, results) => {
                            if (err) {
                                throw err;
                            } else {
                                console.log("4");
                                const count = results.length;
                                const columns = [];
                                for (let i = 0; i < count; ++i) {
                                    let value = {
                                        column: results[i].Field,
                                        type : results[i].Type
                                    }
                                    console.log("value: " + value.column + " " + value.type);
                                    columns.push(value);
                                }

                                console.log("col: " + columns);
                                console.log("table: " + name);
                                console.log("description: " + desc);
                                return res.status(200).json({
                                    columns: columns,
                                    table: name,
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