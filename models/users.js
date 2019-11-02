'use strict';
module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
    userID: DataTypes.INTEGER,
    name: DataTypes.STRING,
    surname :DataTypes.STRING,
    age: DataTypes.INTEGER
  }, {});
  users.associate = function(models) {
    // associations can be defined here
  };
  return users;
};