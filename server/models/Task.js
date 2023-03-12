const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    // what to do
    action: {
        type: String,
        required: true
    },
    // deadline, if neccessary
    deadline: {
        type: String,
        required: false
    },
    // isCompleted... true or false?
    completed: {
        type: Boolean,
        required: true
    },
    // time created
    createdAt: {
        type: String,
        required: true
    },
    // References user that tasks belong to based on ID
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserData',
        required: true
    }

})

const task = mongoose.model('TasksData', TaskSchema);

module.exports = task;