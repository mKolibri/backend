const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const tableController = require('../controllers/table.controller');
const { check } = require('express-validator');

router.route('/registration')
    .post([check('name').matches(/^[A-Z]{1}[a-z]{1,}$/)
        .withMessage('Names first simbol must upper'),
        check('mail').isEmail().withMessage('Not valid E-mail adress.'),
        check('password').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
        .withMessage('Password must be contain at least one uppercase character, and lowercase character, and one symbol.')],
        userController.userRegistration);
router.route('/login')
    .post(userController.loginUser);
router.route('/logout')
    .post(userController.userLogout);
router.route('/user')
    .get(userController.getUserInfo);


router.route('/tables')
    .get(tableController.getTables);

module.exports = router;