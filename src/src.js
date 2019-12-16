const url = require('url');

const getValues = function(columns) {
    let values = "( ";
    if (columns.length <= 0) {
        values = "id int(6))";
    } else {
        for (let i = 0; i < columns.length; ++i) {
            values += columns[i].column + " " + columns[i].type + ",";
        }
        values = values.substring(0, values.length - 1);
        values += ")";
    }
    return values;
}

const getTableID = function(req) {
    let path = url.parse(req.url).pathname;
    let array = path.split("/");
    return array[2];
}

const getAddValues = function(data) {
    let fields = "(";
    let values = "(";
    if (data && data.length) {
        for (let i = 0; i < data.length; ++i) {
            for (let [key, value] of Object.entries(data[i])) {
                fields += key + ", ";
                values += "'" + value + "', ";
            }
        }
        fields = fields.slice(0, -2) + ")";
        values = values.slice(0, -2) + ")";
        const condition = fields + " values " + values;
        return condition;
    }
    return false;
}

const getType = function(type) {
    let strType = String(type);
    if (strType.search("varchar") >= 0) {
        return "string";
    }
    if (strType.search("int") >= 0) {
        return "number"
    }
}

const getConditions = function(data) {
    let condition = "";
    const values = data.values;
    if (values) {
        for (let [key, value] of Object.entries(values)) {
            if (key !== "number" && value !== null) {
                condition += key + "= '" + value + "' and ";
            }
        }
        condition = condition.slice(0, -5);
        return condition;
    }
    return false;
}

const getConditionsMultAdd = function(data) {
    let condition = "";
    const values = data.values;
    if (values && values.length) {
        for (let i = 0; i < values.length; ++i) {
            for (let [key, value] of Object.entries(values[i])) {
                if (key !== "number" && value !== null) {
                    condition += key + "= '" + value + "' and ";
                }
            }
        }
        condition = condition.slice(0, -5);
        return condition;
    }
    return false;
}

const getUpdateData = function(info) {
    const newData = info.newData;
    const oldData = info.oldData;
    if (newData && oldData) {
        condition = '';
        for (let [key, value] of Object.entries(newData)) {
            if (key !== "number") {
                condition += key + " = '" + value + "', ";
            }
        }
        condition = condition.slice(0, -2) + " where ";
        for (let [key, value] of Object.entries(oldData)) {
            if (key !== "number" && value !== null) {
                condition += key + " = '" + value + "' and ";
            }
        }
        condition = condition.slice(0, -5);
        return condition;
    } else {
        return false;
    }
}

module.exports = {
    getValues: getValues,
    getTableID: getTableID,
    getType: getType,
    getConditions: getConditions,
    getAddValues: getAddValues,
    getConditionsMultAdd: getConditionsMultAdd,
    getUpdateData: getUpdateData
}