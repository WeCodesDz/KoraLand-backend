const { Router } = require('express');
const express = require('express');
const authController = require('./authController');

const router = express.Router();

router.post('/admin/login', authController.loginAdmin);
router.post('/coach/login', authController.loginCoach);
router.post('/parent/login', authController.loginParent);
router.post('/logout', authController.logout);



module.exports = router;