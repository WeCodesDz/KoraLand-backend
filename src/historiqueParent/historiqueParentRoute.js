const express = require('express');
const router = express.Router();
const historiqueParentController = require('./historiqueParentController');
const authController = require('../auth/authController');

router.get('/',authController.protect, authController.role('admin') ,historiqueParentController.getAllHistoriqueParent);

module.exports = router;