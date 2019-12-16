const express = require('express');
const userController = require('../controllers/user.controller');
const tableController = require('../controllers/table.controller');
const sessionMiddle = require('../middlewares/session.mid');
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
    .get(sessionMiddle.isLoggedIn, userController.getUserInfo);

// Table-router
router.route('/tables')
    .get(sessionMiddle.isLoggedIn, tableController.getTables);
router.route('/addTable')
    .post(config.validateTable, sessionMiddle.isLoggedIn, tableController.addTable);
router.route('/table/*')
    .get(sessionMiddle.isLoggedIn, tableController.showTable);
router.route('/deleteTable')
    .post(sessionMiddle.isLoggedIn, tableController.deleteTable);
router.route('/deleteColumn')
    .post(sessionMiddle.isLoggedIn, tableController.deleteTableColumn);
router.route('/deleteValue')
    .post(sessionMiddle.isLoggedIn, tableController.deleteValue);
router.route('/addValues')
    .post(sessionMiddle.isLoggedIn, tableController.addValues);
router.route('/updateTableInfo')
    .post(sessionMiddle.isLoggedIn, tableController.updateTableInfo);
router.route('/addColumn')
    .post(sessionMiddle.isLoggedIn, tableController.addColumnToTable);
router.route('/updateData')
    .post(sessionMiddle.isLoggedIn, tableController.updateTableValues);
router.route('/sortTable/*')
    .get(sessionMiddle.isLoggedIn, tableController.sortTable);

module.exports = router;