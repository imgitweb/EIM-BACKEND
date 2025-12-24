const express = require('express');
const router = express.Router();
const { askEila } = require('../controller/EILACofounderController');

router.post('/', askEila);

module.exports = router;