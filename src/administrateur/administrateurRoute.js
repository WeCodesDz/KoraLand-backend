const express = require('express');
const administrateurController = require('./administrateurController');
const authController = require('../auth/authController')

const router = express.Router();

router.use(authController.protect , authController.role('admin'));   
router.
    route('/statistics')
    .get(administrateurController.getAdminStatistcs)
router.route('/')
    .get(administrateurController.getAllAdmin)
    .post(administrateurController.createAdmin);

router.route('/:id')
    .get(administrateurController.getAdminById)
    .patch(administrateurController.updateAdmin)
    .delete(administrateurController.deleteAdmin);


module.exports = router;