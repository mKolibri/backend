const url = require('url');

module.exports.getValues = function(columns) {
    let values = "( ";
    if (columns.length <= 0) {
        values = "";
    } else {
        for ( let i = 0; i < columns.length; ++i ) {
            values += columns[i].column + " " + columns[i].type + ",";
        }
        values = values.substring(0, values.length - 1);
        values += ")";
    }
    return values;
}

module.exports.getTableID = function(req) {
    let path = url.parse(req.url).pathname;
    let array = path.split("/");
    return array[1];
}