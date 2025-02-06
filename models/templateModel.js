const mongoose = require('mongoose');
const templateSchema = new mongoose.Schema({
    category_id :{
        type : mongoose.Schema.Types.ObjectId,
        required : true, 
        trim : true,
        ref : "categoryList"
    },
    category_name : {
        type : String,
        required : true,
        trim : true,
        ref : "categoryList"
    },
    template_description : {
        type : String,
        required : true,
        trim : true
    },
    template_name :{
        type : String,
        required : true,
        trim : true,
    },
    template_file :{
        type : String,
        required : true,
        trim : true,
    },
    isDeleted : {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Template', templateSchema);