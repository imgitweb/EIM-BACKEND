const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
    image: {
        type: String,
        default: "", // optional
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    designation: {
        type: String,
        required: true,
        trim: true
    },
    currentCompany: {
        type: String,
        default: "",
        trim: true
    },
    totalExp: {
        type: Number,
        default: 0
    },
    skills: {
        type: [String],
        default: []
    },
    languages: {
        type: [String],
        default: []
    },
    aboutUs: {
        type: String,
        default: "",
        trim: true
    },
    higherEducation: {
        type: String,
        default: "",
        trim: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    category: {
        type: String,
        required: true,
        enum: [
            "Tech Mentors", "Tech", "tech",
            "Non Technical", "Subject Expert",
            "Business Strategy", "Funding",
            "Legal", "Finance", "Marketing", "marketing",
            "Subject Matter Expert", "subject matter expert",
            "Leadership & Growth Mentors","Business & Strategy Mentors"
        ],
        trim: true
    },
    subCategory: {
        type: String,
        default: "",
        trim: true
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        default: "other"
    },
    institute: {
        type: String,
        default: "",
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        default: ""
    },
    mo_number: {
        type: String,
        trim: true,
        default: ""
    },
    contact: {
        type: String,
        trim: true,
        default: ""
    },
    country: {
        type: String,
        default: "",
        trim: true
    },
    city: {
        type: String,
        default: "",
        trim: true
    },
    linkedin: {
        type: String,
        default: "",
        trim: true
    },
    specializationIn: {
        type: String,
        default: "",
        trim: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Mentor', mentorSchema);
