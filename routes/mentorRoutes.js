const express = require('express');
const router = express.Router();

const {addMentor, getAllMentors, deleteMentor} = require("../controller/mentorController");

// POST - Add a new mentor
module.exports = (upload) =>{
    router.post('/add-mentor', upload.single('image'),addMentor);
    router.get('/get-mentor',getAllMentors);
    router.post('/delete-mentor',deleteMentor);
    return router;
}