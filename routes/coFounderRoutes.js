<<<<<<< HEAD
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
=======
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
>>>>>>> ee7c4e0a3e33160cc4ec5e4b485aae5dce824f21
};