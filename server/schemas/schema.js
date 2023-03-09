const { User, Task } = require("../models");
const { 
    GraphQLObjectType, 
    GraphQLID, 
    GraphQLString, 
    GraphQLSchema, 
    graphqlSync, 
    GraphQLBoolean, 
    GraphQLList
} = require("graphql");

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        tasks: {
            type: TaskType,
            resolve(parent, args) {
                return Task.findById(parent.taskId)
            }
        }

    })
})

const TaskType = new GraphQLObjectType({
    name: 'Task',
    fields: () => ({
        id: { type: GraphQLID },
        action: { type: GraphQLString },
        deadline: { type: GraphQLString },
        completed: { type: GraphQLBoolean },
        createdAt: { type: GraphQLString }
    })
})


// root query object
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    // these 'fields' will be the queries, thus the name
    fields: {
        // think of this like a '/users' route
        users: {
            type: new GraphQLList(UserType), //List here to return the entire list of users
            resolve(parent, args) {
                return User.find();
            } 
        },
        // think of this like a single '/user' route
        user: {
            type: UserType,
            // for getting a particular user, you would need an arg of 'id' to fetch 
            // the user data by their 'id'
            args: { id: { type: GraphQLID } },
            // followed by resolver
            resolve(parent, args) { 
                // use mongoose function to get a single client as resolver 
                return User.findById(args.id)
            }
        },
    /*    tasks : { // not really necessary -- just playing w/graphql
            type: new GraphQLList(TaskType),  // list to return tasks
            args: { id: { type: GraphQLID } },

            // resolver to find all tasks belonging to one user by Id
        }
        */
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery
})