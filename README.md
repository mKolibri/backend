# backend
nodeJS + MySql

# how to run app
node app.js 

#how to create database
Create database info;
use info;

CREATE TABLE users (userID int NOT NULL AUTO_INCREMENT PRYMARY_KEY,
name varchar(255) NOT NULL,
surname varchar(255),
age int
);

CREATE TABLE mailPass (userID int NOT NULL AUTO_INCREMENT PRIMARY KEY,
mail char(255),
password char(255),
token varchar(255),
FOREIGN KEY (userID) 
REFERENCES users (userID)
);

CREATE TABLE tables ( userID int NOT NULL, name char(255), tableID varchar(255) PRIMARY KEY, date DATE, FOREIGN KEY (userID) REFERENCES users (userID));
