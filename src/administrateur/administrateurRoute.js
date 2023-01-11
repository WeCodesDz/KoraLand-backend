const express = require('express');
const administrateurController = require('./administrateurController');

const router = express.Router();

// here we add the protect function 
router.route('/')
    .get(administrateurController.getAllAdmin)
    .post(administrateurController.createAdmin);

router.route('/:id')
    .get(administrateurController.getAdminById)
    .patch(administrateurController.updateAdmin)
    .delete(administrateurController.deleteAdmin);


module.exports = router;