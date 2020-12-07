'use strict';
module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
    userID: DataTypes.INTEGER,
    name: DataTypes.STRING,
    mail: DataTypes.STRING,
    surname: DataTypes.STRING,
    age: DataTypes.INTEGER,
    password: DataTypes.STRING
  }, {
    underscored: true,
  });
  users.associate = function(models) {
  };
  return users;
};