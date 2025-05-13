const express = require('express');
const { addTemplate, getAllTemplates } = require('../controller/templateController');
const router = express.Router();
module.exports = (upload) =>{
    router.post('/add-template', upload.single('file'),addTemplate);
    router.get('/get-template',getAllTemplates);
    // router.post('/delete-template',deleteTemplate);
    return router;
}