const src = require('../src/table.src');
const configs = require('../configs');
const db = require('../database/db');
const { validationResult } = require('express-validator');

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
            [ userID ], function(err, result) {
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
};

const deleteTableColumn = function(req, res) {
    let info = {
        userID: req.session.userID,
        columnName: req.body.colName,
        tableID: req.body.name,
        tableName: 't' + req.body.name
    };

    db.connection.query(`SELECT * FROM tables WHERE tableID = ? and userID = ?`,
    [ info.tableID, info.userID ], function(err, result) {
        if (err) {
            configs.logger.error(err.message);
            throw err;
        } else if (!result[0]) {
            configs.logger.warn("The server can't find table to delete a column");
            return res.status(404).json({
                message: "The server can't find the requested page"
            });
        } else {
            db.connection.query(`SHOW COLUMNS FROM ${info.tableName}`,
                function(err, results) {
                    if (err) {
                        configs.logger.error(err.message);
                            throw err;
                        } else {
                            const count = 1;
                            if (Number(results.length) > count) {
                                db.connection.query(`alter table ${info.tableName} drop column ${info.columnName}`,
                                    function(err) {
                                        if (err) {
                                            configs.logger.error(err.message);
                                            throw err;
                                        } else {
                                            configs.logger.info(`Succesfully deleted column`);
                                            return res.status(200).json({
                                                message: "Succesfully deleted column"
                                            });
                                        }
                                });
                            } else {
                                configs.logger.warn(`Can't delete last column`);
                                return res.status(402).json({
                                    message: "You can't delete last column"
                                });
                            }
                        }
            });
        }
    });
}

const addTable = function(req, res) {
    let info = {
        userID: req.session.userID,
        name: req.body.name,
        description: req.body.description,
        columns: req.body.columns
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        configs.logger.warn(`Received an invalid response from the upstream server addTable: ${info.name}`);
        return res.status(502).json(errors.array());
    }

    if (!info.userID) {
        configs.logger.warn(`userID is undefined for addTable`);
        return res.status(400).json({
            message: "Empty data, the server did not understand the request"
        });
    }

    db.connection.query(`INSERT INTO tables (userID, name, description, date) VALUES (?, ?, ?, CURDATE())`,
        [ info.userID, info.name, info.description ], function(err, results) {
            if (err) {
                configs.logger.error(err.message);
                throw err;
            } else if (results) {
                info.values = src.getValues(info.columns);
                info.tableName = "t" + results.insertId;
                db.connection.query("CREATE TABLE " + info.tableName + info.values,
                    function(err) {
                        if (err) {
                            configs.logger.error(err.message);
                            db.connection.query(`DELETE DROM tables where tableID = `, [ results.insertId ]);
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
};

const deleteTable = function(req, res) {
    let info = {
        userID: req.session.userID,
        tableID: req.body.tableID
    };

    if (!info.userID) {
        configs.logger.warn(`userID is undefined for addTable`);
        return res.status(400).json({
            message: "Empty data, the server did not understand the request"
        });
    }

    db.connection.query(`DELETE FROM tables WHERE tableID = ?`,
        [ info.tableID ], function(err, results) {
            if (err) {
                configs.logger.error(err.message);
                throw err;
            } else if (results) {
                info.tableName = "t" + info.tableID;
                db.connection.query("DROP TABLE " + [ info.tableName ],
                    function(err) {
                        if (err) {
                            configs.logger.error(err.message);
                            throw err;
                        } else {
                            configs.logger.info(`deleted table with name: ${info.tableName}`);
                            return res.status(200).json({
                                message: "Succesfully deleted"
                            });
                        }
                });
            }
    });
};

const addValues = function(req, res) {
    const name = req.body.tableID;
    let info = {
        userID: req.session.userID,
        tableID: name,
        tableName: "t" + name,
        values: req.body.values
    };

    if (!info.userID) {
        configs.logger.warn(`userID is undefined for addValues`);
        return res.status(400).json({
            message: "Empty data, the server did not understand the request"
        });
    }
    const cond = src.getConditionsMultAdd(info);
    db.connection.query(`SELECT * FROM ${info.tableName} WHERE ${cond}`,
        function(err, result) {
            if (err) {
                configs.logger.error(err.message);
                throw err;
            } else if (!result[0]) {
                const condition = src.getAddValues(info.values);
                if (!condition || !info.tableName) {
                    configs.logger.warn(`values is undefined for addValues`);
                    return res.status(400).json({
                        message: "Empty data, the server did not understand the request"
                    });
                }
                db.connection.query(`INSERT IGNORE INTO ${info.tableName} ${condition}`,
                    function(err, results) {
                        if (err) {
                            configs.logger.error(err.message);
                            throw err;
                        } else if (results) {
                            return res.status(200).json({
                                message: "Succesfully added"
                            });
                        }
                });
            } else {
                configs.logger.warn("The request could not be completed because of a conflict");
                return res.status(409).json({
                    message: "You can\'t add dublicate values in table"
                });
            }
    });
};

const deleteValue = function(req, res) {
    const name = req.body.table;
    let data = {
        userID: req.session.userID,
        tableID: name,
        tableName: "t" + name,
        values: req.body.delValue
    }

    if (!data.userID) {
        configs.logger.warn(`Empty data for deleteValue`);
        return res.status(400).json({
            message: "Empty data, the server did not understand the request"
        });
    }

    let info = {};
    info.values = [];
    db.connection.query('SELECT * FROM tables WHERE tableID = ? and userID = ?',
        [ data.tableID, data.userID ], function(err, result) {
            if (err) {
                configs.logger.error(err.message);
                throw err;
            } else if (!result[0]) {
                configs.logger.warn("The server can't find table");
                return res.status(404).json({
                    message: "The server can't find the requested page"
                });
            } else if (result[0].name) {
                const condition = src.getConditions(data);
                if (condition) {
                    db.connection.query(`DELETE FROM ${data.tableName} WHERE ${condition} LIMIT 1`,
                        function(err, results) {
                            if (err) {
                                configs.logger.error(err.message);
                                throw err;
                            } else {
                                const count = results.length;
                                for (let i = 0; i < count; ++i) {
                                    let value = results[i];
                                    info.values.push(value);
                                }
                                db.connection.query(`SHOW COLUMNS FROM ${data.tableName}`,
                                    function(err, results) {
                                        if (err) {
                                            configs.logger.error(err.message);
                                            throw err;
                                        } else {
                                            const count = results.length;
                                            data.columns = [];
                                            for (let i = 0; i < count; ++i) {
                                                let type = src.getType(results[i].Type);
                                                const value = {
                                                    column: results[i].Field,
                                                    type: type
                                                }
                                                data.columns.push(value);
                                            }
                                            return res.status(200).json({
                                                message: "Succesfully deleted"
                                            });
                                        }
                                });
                        }
                    });
                } else {
                    configs.logger.warn("The server can't find table!");
                    return res.status(404).json({
                        message: "The server can't find the requested page"
                    });
                }
            }
    });
}

const updateTableInfo = function(req, res) {
    const info = {
        name: req.body.name,
        description: req.body.description,
        tableID: req.body.tableID,
        userID: req.session.userID
    };

    if (!info.userID || !info.tableID) {
        configs.logger.warn(`Empty data for update table information`);
        return res.status(400).json({
            message: "Empty data, the server did not understand the request"
        });
    }

    db.connection.query('update tables SET name = ?, description = ? WHERE tableID = ? and userID = ? LIMIT 1',
        [ info.name, info.description, info.tableID, info.userID ],
        function(err) {
            if (err) {
                configs.logger.error(err.message);
                    throw err;
                } else {
                    return res.status(200).json({
                        message: "Succesfully updated"
                    });
                }
        });
}

const updateTableValues = function(req, res) {
    const info = {
        userID: req.session.userID,
        oldData: req.body.oldData,
        newData: req.body.newData,
        tableID: req.body.tableID,
        name: 't' + req.body.tableID
    };

    if (!info.userID || !info.tableID) {
        configs.logger.warn(`Empty data for update table information`);
        return res.status(400).json({
            message: "Empty data, the server did not understand the request"
        });
    }

    db.connection.query(`SELECT * FROM tables WHERE tableID = ? and userID = ?`,
    [ info.tableID, info.userID ], function(err, result) {
        if (err) {
            configs.logger.error(err.message);
            throw err;
        } else if (!result[0]) {
            configs.logger.warn("The server can't find table");
            return res.status(404).json({
                message: "The server can't find the requested page"
            });
        } else {
            const condition = src.getUpdateData(info);
            if (condition) {
                db.connection.query(`update ${info.name} SET ${condition} LIMIT 1`,
                    [ info.name, info.description, info.tableID, info.userID ],
                    function(err) {
                        if (err) {
                            configs.logger.error(err.message);
                            throw err;
                        } else {
                            return res.status(200).json({
                                message: "Succesfully updated"
                            });
                        }
                });
            } else {
                return res.status(400).json({
                    message: "Can not be updated"
                });
            }
        }
    });
}

const addColumnToTable = function(req, res) {
    const info = {
        name : req.body.column,
        type: req.body.type,
        tableID: req.body.tableID,
        tableName: "t" + req.body.tableID,
        userID: req.session.userID
    }

    if (!info.userID || !info.tableID) {
        configs.logger.warn(`Empty data for add column to table`);
        return res.status(400).json({
            message: "Empty data, the server did not understand the request"
        });
    }

    db.connection.query(`SELECT * FROM tables WHERE tableID = ? and userID = ?`,
    [ info.tableID, info.userID ], function(err, result) {
        if (err) {
            configs.logger.error(err.message);
            throw err;
        } else if (!result[0]) {
            configs.logger.warn("The server can't find table");
            return res.status(404).json({
                message: "The server can't find the requested page"
            });
        } else {
            db.connection.query(`ALTER TABLE ${info.tableName} add ${info.name} ${info.type}`,
                function(err) {
                    if (err) {
                        configs.logger.error(err.message);
                        throw err;
                    } else {
                        return res.status(200).json({
                            message: "Succesfully added column"
                        });
                    }
            });
        }
    });
}

const sortTable = function(req, res) {
    const name = src.getTableID(req);
    let data = {
        userID: req.session.userID,
        tableID: name,
        tableName: "t" + name,
        sortBy: req.query.sortBy,
        sortASC: req.query.sortASC,
        sortDESC: req.query.sortDESC
    }

    if (!data.userID || !data.tableID) {
        configs.logger.warn(`Empty data for sortTable`);
        return res.status(400).json({
            message: "Empty data, the server did not understand the request"
        });
    }

    let info = {};
    info.values = [];
    db.connection.query('SELECT * FROM tables WHERE tableID = ? and userID = ?',
        [ data.tableID, data.userID ], function(err, result) {
            if (err) {
                configs.logger.error(err.message);
                throw err;
            } else if (!result[0]) {
                configs.logger.warn("The server can't find table");
                return res.status(404).json({
                    message: "The server can't find the requested page"
                });
            } else if (result[0].name) {
                info.tableName = result[0].name;
                info.desc = result[0].description;
                if (String(data.sortASC) === 'true') {
                    data.sort = data.sortBy + " ASC";
                } else {
                    data.sort = data.sortBy + " DESC";
                }
                if (data.sortBy) {
                    db.connection.query(`SELECT * FROM ${data.tableName} ORDER BY ${data.sort}`,
                        function(err, results) {
                            if (err) {
                                configs.logger.error(err.message);
                                throw err;
                            } else {
                                const count = results.length;
                                for (let i = 0; i < count; ++i) {
                                    let value = results[i];
                                    info.values.push(value);
                                }
                                db.connection.query(`SHOW COLUMNS FROM ${data.tableName}`,
                                    function(err, results) {
                                        if (err) {
                                            configs.logger.error(err.message);
                                            throw err;
                                        } else {
                                            const count = results.length;
                                            data.columns = [];
                                            for (let i = 0; i < count; ++i) {
                                                let type = src.getType(results[i].Type);
                                                const value = {
                                                    column: results[i].Field,
                                                    type: type
                                                }
                                                data.columns.push(value);
                                            }
                                            return res.status(200).json({
                                                schema: data.columns,
                                                columns: info.values,
                                                table: info.tableName,
                                                description: info.desc
                                            });
                                        }
                                });
                            }
                    });
                } else {
                    configs.logger.warn(`Empty data for sortTable`);
                    return res.status(400).json({
                        message: "Empty data, the server did not understand the request"
                    });
                }
            } else {
                configs.logger.warn("The server can't find table");
                return res.status(404).json({
                    message: "The server can't find the requested page"
                });
            }
    });
};

const showTable = function(req, res) {
    const name = src.getTableID(req);
    let data = {
        userID: req.session.userID,
        tableID: name,
        tableName: "t" + name
    };

    if (!data.userID) {
        configs.logger.warn(`Empty data for showTable`);
        return res.status(400).json({
            message: "Empty data, the server did not understand the request"
        });
    }

    let info = {};
    info.values = [];
    db.connection.query('SELECT * FROM tables WHERE tableID = ? and userID = ?',
        [ data.tableID, data.userID ], function(err, result) {
            if (err) {
                configs.logger.error(err.message);
                throw err;
            } else if (!result[0]) {
                configs.logger.warn("The server can't find table");
                return res.status(404).json({
                    message: "The server can't find the requested page"
                });
            } else if (result[0].name) {
                info.tableName = result[0].name;
                info.desc = result[0].description;
                db.connection.query(`SELECT * FROM ${data.tableName}`,
                    function(err, results) {
                        if (err) {
                            configs.logger.error(err.message);
                            throw err;
                        } else {
                            const count = results.length;
                            for (let i = 0; i < count; ++i) {
                                let value = results[i];
                                info.values.push(value);
                            }
                            db.connection.query(`SHOW COLUMNS FROM ${data.tableName}`,
                                function(err, resu) {
                                    if (err) {
                                        configs.logger.error(err.message);
                                        throw err;
                                    } else {
                                        const count = resu.length;
                                        data.columns = [];
                                        for (let i = 0; i < count; ++i) {
                                            let type = src.getType(resu[i].Type);
                                            const value = {
                                                column: resu[i].Field,
                                                type: type
                                            }
                                            data.columns.push(value);
                                        }
                                        return res.status(200).json({
                                            schema: data.columns,
                                            columns: info.values,
                                            table: info.tableName,
                                            description: info.desc,
                                            file: results
                                        });
                                    }
                            });
                        }
                });
            } else {
                configs.logger.warn("The server can't find table");
                return res.status(404).json({
                    message: "The server can't find the requested page"
                });
            }
    });
};

module.exports = {
    addTable: addTable,
    getTables: getTables,
    showTable: showTable,
    deleteTable: deleteTable,
    deleteValue: deleteValue,
    addValues: addValues,
    updateTableInfo: updateTableInfo,
    addColumnToTable: addColumnToTable,
    deleteTableColumn: deleteTableColumn,
    updateTableValues: updateTableValues,
    sortTable: sortTable
};