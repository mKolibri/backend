const src = require('../src/src');
const configs = require('../configs');

let getTables = async function (req, res) {
    if (req.session.loggedin) {
        const userID = req.session.userID;
        if (!userID) {
            configs.logger.warn(`Empty data for getTables`);
            return res.status(400).json({
                message: "Empty data, the server did not understand the request"
            });
        }

        configs.logger.debug(`get Tables for user: ${userID}`);
        configs.connection.query('SELECT * FROM tables WHERE userID = ?',
            [ userID ], (err, result) => {
                if (err) {
                    throw err;
                } else if (!result) {
                    configs.logger.warn(`The server can't get Tables for user: ${userID}`);
                    return res.status(404).json({
                        message: "The server can't find the requested page"
                    });
                } else {
                    return res.status(200).json(result);
                }
        });
    } else {
        configs.logger.warn(`Not logged in user: ${userID}`);
        return res.status(400).json({
            message: "Empty data, the server did not understand the request"
        });
    }
}

let addTable = async function (req, res) {
    if (req.session.loggedin) {
        const userID = req.session.userID;
        const name = req.body.name;
        const description = req.body.description;
        const columns = req.body.columns;

        if (!userID) {
            configs.logger.warn(`userID is undefined for addTable`);
            return res.status(400).json({
                message: "Empty data, the server did not understand the request"
            });
        }

        configs.connection.query(`INSERT INTO tables (userID, name, description, date) VALUES (?, ?, ?, DATE)`,
            [ userID, name, description ], (err, results) => {
                if (err) {
                    configs.logger.error(error.message);
                    throw err;
                } else if (results) {
                    const values = src.getValues(columns);
                    const tableName = "t" + results.insertId;
                    configs.connection.query("CREATE TABLE " + tableName + values,
                        (err) => {
                            if (err) {
                                configs.logger.error(error.message);
                                throw err;
                            } else {
                                configs.logger.info(`add table with name: ${tableName}`);
                                return res.status(200).json({
                                    name : tableName
                                });
                            }
                });
            }
        });
    } else {
        configs.logger.warn(`Empty data for addTable`);
        return res.status(400).json({
            message: "Empty data, the server did not understand the request"
        });
    }
}

let showTableSchema = async function (req, res) {
    if (req.session.loggedin) {
        const userID = req.session.userID;
        const name = req.query.table;
        const tableID = name.substring(1, name.length);

        configs.logger.info(`show table schema for table: ${tableID}`);
        if (!userID) {
            configs.logger.warn(`Empty data for addTable`);
            return res.status(400).json({
                message: "Empty data, the server did not understand the request"
            });
        }

        configs.connection.query('SELECT * FROM tables WHERE tableID = ?',
            [ tableID ], (err, result) => {
                if (err) {
                    configs.logger.error(err.message);
                    throw err;
                } else if (!result[0]) {
                    configs.logger.warn("The server can't find schema for table");
                    return res.status(404).json({
                        message: "The server can't find the requested page"
                    });
                } else if (result[0].name) {
                    const name = result[0].name;
                    const desc = result[0].description;
                    configs.connection.query(`SHOW COLUMNS FROM ${name}`,
                        (err, results) => {
                            if (err) {
                                configs.logger.error(err.message);
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
    } else {
        configs.logger.warn(`Empty data for showSchemaTable`);
        return res.status(400).json({
            message: "Empty data, the server did not understand the request"
        });
    }
}

let showTable = async function (req, res) {
    if (req.session.loggedin) {
        const userID = req.session.userID;
        const name = src.getTableID(req);
        const tableID = name.substring(1, name.length);

        if (!userID) {
            configs.logger.warn(`Empty data for showTable`);
            return res.status(400).json({
                message: "Empty data, the server did not understand the request"
            });
        }

        configs.connection.query('SELECT * FROM tables WHERE tableID = ?',
            [ tableID ], (err, result) => {
                if (err) {
                    configs.logger.error(err.message);
                    throw err;
                } else if (!result[0]) {
                    configs.logger.warn("The server can't find table");
                    return res.status(404).json({
                        message: "The server can't find the requested page"
                    });
                } else if (result[0].name) {
                    const name = result[0].name;
                    const desc = result[0].description;
                    configs.connection.query(`SELECT * FROM ${name}`,
                        (err, results) => {
                            if (err) {
                                configs.logger.error(err.message);
                                throw err;
                            } else {
                                const count = results.length;
                                const values = [];
                                for (let i = 0; i < count; ++i) {
                                    let value = results[i];
                                    values.push(value);
                                }

                                return res.status(200).json({
                                    columns: values,
                                    table: name,
                                    description: desc
                                });
                            }
                    });
                }
        });
    } else {
        configs.logger.warn(`Empty data for showTable`);
        return res.status(400).json({
            message: "Empty data, the server did not understand the request"
        });
    }
}

module.exports.addTable = addTable;
module.exports.getTables = getTables;
module.exports.showTable = showTable;
module.exports.showTableSchema = showTableSchema;