const express = require('express');
const parentController = require('./parentController');
const authController = require('../auth/authController');

const router = express.Router();

router
    .route('/')
    .get(
          authController.protect,
          parentController.getAllParents)
    .post(parentController.createParent);

router
    .route('/:id')
    .get(parentController.getParentbyId)
    .patch(parentController.updateParent)
    .delete(parentController.deleteParent);    

module.exports = router;