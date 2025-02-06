const mongoose = require('mongoose');

const categoryList = new mongoose.Schema({
    category_name : {
        type : String,
        required : true,
        trim : true,
    },
    category_description : {
        type : String,
        required : true,
        trim : true,
    },
    category_logo : {
        type : String,
        required : true,
        trim : true,
    },
    isDeleted : {
        type: Boolean,
        default: false
    }

});

module.exports = mongoose.model('CategoryList', categoryList);