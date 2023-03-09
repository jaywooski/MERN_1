const { User, Task } = require("../models/index");

// Resolvers define how to fetch the types defined in your schema.
// 
const resolvers = {
    Query: {
            tasks: async () => {
                return Task.find()
            },
            users: async () => {
                return User.find()
                .populate('tasks')
            } 
    },
};

module.exports = resolvers;