const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    accessToken: {
        type: String
    },
    quote: {
        type: String
    },
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TasksData'
        }
    ]
})

const user = mongoose.model('UserData', UserSchema);

module.exports = user;