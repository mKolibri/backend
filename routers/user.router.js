const express = require('express');
const router = express.Router();
const controller = require('../controllers/user.controller');
const { check } = require('express-validator');

router.route('/registration')
    .post([check('name').matches(/^[A-Z]{1}[a-z]{1,}$/)
        .withMessage('Names first simbol must upper'),
        check('mail').isEmail(),
        check('password').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
        .withMessage('Password must be contain at least one uppercase character, and lowercase character, and one symbol')],
        controller.userRegistration
    );

router.route('/login')
    .post(controller.loginUser);

router.route('/logout')
    .post(controller.userLogout);

module.exports = router;