const { Router } = require('express');
const express = require('express');
const authController = require('./authController');

const router = express.Router();

router.post('/admin', authController.loginAdmin);
router.post('/coach', authController.loginCoach);
router.post('/parent', authController.loginParent);
router.get('/logout', authController.logout);
router.get('/my_profil', authController.protect, authController.getMyProfilsInfo);


module.exports = router;