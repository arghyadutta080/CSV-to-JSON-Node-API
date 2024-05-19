const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    city: {
        type: String,
        default: 'N/A',
        trim: true
    },
    subscribed: {
        type: Boolean,
        default: true
    }
}, 
{
    timestamps: true
});

const UserData = mongoose.model('user_data', userDataSchema);

module.exports = UserData;
