const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    user_id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },


    role: {
        type: String,
        enum: ['OWNER', 'VOLUNTEER', 'PARTICIPANT', 'JUDGE', 'GUEST'],
        default: 'PARTICIPANT'
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
        required: true
    },
    photo: {
        type: String, // URL to photo
        default: ''
    },
    has_entered: {
        type: Boolean,
        default: false
    },
    is_active: {
        type: Boolean,
        default: true
    },
    category: {
        type: String,
        enum: ['build', 'code', 'ship'],
    },
    is_selected: {
        type: Boolean,
        default: false
    },
    is_sent: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);