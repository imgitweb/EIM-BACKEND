const express = require('express');
const router = express.Router();
const { askEila } = require('../controller/EILACofounderController');

router.post('/ask', askEila);

module.exports = router;