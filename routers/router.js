const express = require('express');
const userController = require('../controllers/user.controller');
const tableController = require('../controllers/table.controller');
const config = require('../configs');
const router = express.Router();

// User-router
router.route('/registration')
    .post(config.validate, userController.userRegistration);
router.route('/login')
    .post(userController.loginUser);
router.route('/logout')
    .post(userController.userLogout);
router.route('/user')
    .get(userController.getUserInfo);

// Table-router
router.route('/tables')
    .get(tableController.getTables);
router.route('/addTable')
    .post(tableController.addTable);
router.route('/showTable')
    .get(tableController.showTableSchema);
router.route('table/*')
    .get(tableController.showTable);

module.exports = router;