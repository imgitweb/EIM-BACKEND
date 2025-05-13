// coFounderRoutes.js
const express = require('express');
const router = express.Router();
const { addCoFounder, getAllCoFounders, updateCofounder, deleteCofounder } = require('../controller/coFounderController');

module.exports = (upload) => {
    router.post('/', upload.single('profilePhoto'), addCoFounder);
    router.get('/', getAllCoFounders);  
    router.put('/:id', updateCofounder);
    router.delete('/:id', deleteCofounder);
    return router;
};