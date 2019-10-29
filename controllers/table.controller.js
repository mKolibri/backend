const configs = require('../configs');

let getTables = async function (req, res) {
    const userID = req.cookies.userID;
    if (!userID) {
        return res.status(400).json({
            message: "Empty data, the server did not understand the request"
        });
    }

    configs.connection.query('SELECT * FROM tables WHERE userID = ?',
        [ userID ], (err, result) => {
            if (err) {
                throw err;
            } else if (!result) {
                return res.status(404).json({
                    message: "The server can't find the requested page"
                });
            } else {
                return res.status(200).json(result);
            }
        });
}

let addTable = async function (req, res) {
    const userID = req.cookies.userID;
    const name = req.body.name;
    const description = req.body.description;
    const columns = req.body.columns;

    if (!userID) {
        return res.status(400).json({
            message: "Empty data, the server did not understand the request"
        });
    }

    configs.connection.query(`INSERT INTO tables (userID, name, description, date) VALUES (?, ?, ?, DATE)`,
        [ userID, name, description ], (err, results) => {
            if (err) {
                throw err;
            } else if (results) {
                const values = configs.getValues(columns);

                const tableName = "t" + results.insertId;
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
            }
    });

}

let showTable = async function (req, res) {
    const userID = req.cookies.userID;
    const name = req.query.table;
    const tableID = name.substring(1, name.length);

    if (!userID) {
        return res.status(400).json({
            message: "Empty data, the server did not understand the request"
        });
    }

    configs.connection.query('SELECT * FROM tables WHERE tableID = ?',
        [ tableID ], (err, result) => {
            if (err) {
                throw err;
            } else if (!result[0]) {
                return res.status(404).json({
                    message: "The server can't find the requested page"
                });
            } else if (result[0].name) {
                const name = result[0].name;
                const desc = result[0].description;
                configs.connection.query(`SHOW COLUMNS FROM ${name}`,
                    (err, results) => {
                        if (err) {
                            throw err;
                        } else {
                            const count = results.length;
                            const columns = [];
                            for (let i = 0; i < count; ++i) {
                                let value = {
                                    column: results[i].Field,
                                    type : results[i].Type
                                }
                                columns.push(value);
                            }

                            return res.status(200).json({
                                columns: columns,
                                table: name,
                                description: desc
                            });
                        }
                });
            }
    });
}

module.exports.getTables = getTables;
module.exports.addTable = addTable;
module.exports.showTable = showTable;