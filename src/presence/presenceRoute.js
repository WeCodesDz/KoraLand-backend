const express = require('express');
const presenceontroller = require('./presenceController');
const authController = require('../auth/authController');

const router = express.Router();
router.use(authController.protect , authController.role('coach'));   
router.route('/')
    .post(presenceontroller.createPresence);
router.route('/groupe/:id')
    .post(presenceontroller.createBulkPresence)

module.exports = router;