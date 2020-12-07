'use strict';
module.exports = (sequelize, DataTypes) => {
  const tables = sequelize.define('tables', {
    userID: DataTypes.INTEGER,
    name: DataTypes.STRING,
    tableID: DataTypes.INTEGER,
    date: DataTypes.DATE,
    description: DataTypes.STRING
  }, {
    underscored: true,
  });
  tables.associate = function(models) {
    Project.hasMany(User, {as: 'Workers'})
  };
  return tables;
};