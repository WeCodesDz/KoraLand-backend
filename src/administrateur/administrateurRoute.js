const express = require('express');
const administrateurController = require('./administrateurController');
const authController = require('../auth/authController')

const router = express.Router();

router
    .route('/login')
    .post(authController.login)

router.route('/')
    .get(administrateurController.getAllAdmin)
    .post(administrateurController.createAdmin);

router.route('/:id')
    .get(administrateurController.getAdminById)
    .patch(administrateurController.updateAdmin)
    .delete(administrateurController.deleteAdmin);


module.exports = router;