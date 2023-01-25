const express = require('express');
const presenceontroller = require('./presenceController');

const router = express.Router();

router.route('/')
    .post(presenceontroller.createPresence);
router.route('/groupe/:id')
    .post(presenceontroller.createBulkPresence)

module.exports = router;