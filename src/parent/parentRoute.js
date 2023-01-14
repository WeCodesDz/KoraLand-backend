const express = require('express');
const parentController = require('./parentController');

const router = express.Router();

router
    .route('/')
    .get(parentController.getAllParents)
    .post(parentController.createParent);

router
    .route('/:id')
    .get(parentController.getParentbyId)
    .patch(parentController.updateParent)
    .delete(parentController.deleteParent);    

module.exports = router;