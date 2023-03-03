const express = require('express');
const adminController = require('./adminController');
const authController = require('../auth/authController')

const router = express.Router();

router.use(authController.protect , authController.role('admin'));  

router.
    route('/statistics')
    .get(adminController.getAdminStatistcs);

router.patch('/update_my_password', adminController.updatePassword);

router.route('/')
    .get(adminController.getAllAdmin)
    .post(adminController.createAdmin);

router.route('/:id')
    .get(adminController.getAdminById)
    .patch(adminController.updateAdmin)
    .delete(adminController.deleteAdmin);


module.exports = router;