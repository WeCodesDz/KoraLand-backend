const express = require('express');
const groupeController = require('./groupeController');

const router = express.Router();

router.route('/')
    .get(groupeController.getAllGroupes)
    .post(groupeController.createGroupe);

router.route('/:id')
    .get(groupeController.getGroupeById)
    .patch(groupeController.updateGroupe)
    .delete(groupeController.deleteGroupe);   

module.exports = router;