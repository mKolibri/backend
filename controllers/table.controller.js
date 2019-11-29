const src = require('../src/src');
const configs = require('../configs');
const db = require('../database/db');

const getTables = function(req, res) {
    if (req.session.loggedin) {
        const userID = req.session.userID;
        if (!userID) {
            configs.logger.warn(`Empty data for getTables`);
            return res.status(400).json({
                message: "Empty data, the server did not understand the request"
            });
        }

        configs.logger.debug(`get Tables for user: ${userID}`);
        db.connection.query('SELECT * FROM tables WHERE userID = ?',
            [ userID ], function(err, result){
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
        configs.logger.warn(`Not logged in user: ${req.session.userID}`);
        return res.status(400).json({
            message: "Empty data, the server did not understand the request"
        });
    }
}

const addTable = function(req, res) {
    if (req.session.loggedin) {
        let info = {
            userID: req.session.userID,
            name: req.body.name,
            description: req.body.description,
            columns: req.body.columns
        };

        if (!info.userID) {
            configs.logger.warn(`userID is undefined for addTable`);
            return res.status(400).json({
                message: "Empty data, the server did not understand the request"
            });
        }

        db.connection.query(`INSERT INTO tables (userID, name, description, date) VALUES (?, ?, ?, CURDATE())`,
            [ info.userID, info.name, info.description ], function(err, results) {
                if (err) {
                    configs.logger.error(error.message);
                    throw err;
                } else if (results) {
                    info.values = src.getValues(info.columns);
                    info.tableName = "t" + results.insertId;
                    db.connection.query("CREATE TABLE " + info.tableName + info.values,
                        function(err) {
                            if (err) {
                                configs.logger.error(err.message);
                                throw err;
                            } else {
                                configs.logger.info(`add table with name: ${info.tableName}`);
                                return res.status(200).json({
                                    name : info.tableName
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

const showTableSchema = function(req, res) {
    if (req.session.loggedin) {
        const name = req.query.table;
        let data = {
            userID: req.session.userID,
            tableID: name.substring(1, name.length)
        }

        configs.logger.info(`show table schema for table: ${data.tableID}`);
        if (!data.userID) {
            configs.logger.warn(`Empty data for addTable`);
            return res.status(400).json({
                message: "Empty data, the server did not understand the request"
            });
        }

        db.connection.query('SELECT * FROM tables WHERE tableID = ?',
            [ data.tableID ], function(err, result) {
                if (err) {
                    configs.logger.error(err.message);
                    throw err;
                } else if (!result[0]) {
                    configs.logger.warn("The server can't find schema for table");
                    return res.status(404).json({
                        message: "The server can't find the requested page"
                    });
                } else if (result[0].name) {
                    data.name = result[0].name;
                    data.desc = result[0].description;
                    db.connection.query(`SHOW COLUMNS FROM ${data.name}`,
                        function(err, results) {
                            if (err) {
                                configs.logger.error(err.message);
                                throw err;
                            } else {
                                const count = results.length;
                                data.columns = [];
                                for (let i = 0; i < count; ++i) {
                                    const value = {
                                        column: results[i].Field,
                                        type : results[i].Type
                                    }
                                    data.columns.push(value);
                                }

                                return res.status(200).json({
                                    columns: data.columns,
                                    table: data.name,
                                    description: data.desc
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

const showTable = function(req, res) {
    if (req.session.loggedin) {
        const name = src.getTableID(req);
        let data = {
            userID: req.session.userID,
            tableID: name.substring(1, name.length)
        }

        if (!data.userID) {
            configs.logger.warn(`Empty data for showTable`);
            return res.status(400).json({
                message: "Empty data, the server did not understand the request"
            });
        }

        db.connection.query('SELECT * FROM tables WHERE tableID = ?',
            [ data.tableID ], function(err, result) {
                if (err) {
                    configs.logger.error(err.message);
                    throw err;
                } else if (!result[0]) {
                    configs.logger.warn("The server can't find table");
                    return res.status(404).json({
                        message: "The server can't find the requested page"
                    });
                } else if (result[0].name) {
                    data.name = result[0].name;
                    data.desc = result[0].description;
                    db.connection.query(`SELECT * FROM ${data.name}`,
                        function(err, results) {
                            if (err) {
                                configs.logger.error(err.message);
                                throw err;
                            } else {
                                const count = results.length;
                                data.values = [];
                                for (let i = 0; i < count; ++i) {
                                    let value = results[i];
                                    data.values.push(value);
                                }

                                return res.status(200).json({
                                    columns: data.values,
                                    table: data.name,
                                    description: data.desc
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

module.exports = {
    addTable: addTable,
    getTables: getTables,
    showTable: showTable,
    showTableSchema: showTableSchema
};