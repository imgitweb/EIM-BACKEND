const express = require('express');
const router = express.Router();
const { handleContact } = require('../controller/contactController');

router.post('/', handleContact);

module.exports = router;
