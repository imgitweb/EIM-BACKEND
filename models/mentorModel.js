const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
    image :{
        type : String,
        required : true, 
    },
    name : {
        type : String,
        required : true,
        trim : true
    },
    designation :{
        type : String,
        required : true,
        trim : true
    },
    totalExp : {
        type : Number,
        required : true
    },
    skills :{
        type : [String],
        required : true,
        // trim : true
    },
    languages :{
        type : [String],
        required : true,
        // trim : true
    },
    aboutUs :{
        type : String,
        required : true,
        trim : true
    },
    higherEducation : {
        type : String,
        required : true,
        trim : true
    },
    rating : {
        type : Number,
        required : true,
        min : 1,
        max : 5
    },
    category :{
        type : String,
        required : true,
        enum :['technical','non technical','subject expert']
    },
    gender : {
        type : String,
        required : true,
        enum : ['male', 'female','other'],
    },
    institute :{
        type : String,
        required : true,
        trim : true
    },
    email : {
        type : String,
        required : true,
        trim : true,
        lowercase: true,
        unique: true
    },
    mo_number : {
        type : String,
        required : true,
        trim : true
    },
    country : {
        type : String,
        required : true,
        trim : true
    },
    city : {
        type : String,
        required : true,
        trim : true
    },
    linkedin : {   
        type : String,
        required : true,
        trim : true
    },
    specializationIn : {
        type : String,
        required : true,
        trim : true
    },
    isDeleted : {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Mentor', mentorSchema);