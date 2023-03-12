const { User, Task } = require("../models");
const { 
    GraphQLObjectType, 
    GraphQLID, 
    GraphQLString, 
    GraphQLSchema, 
    GraphQLBoolean, 
    GraphQLList,
    GraphQLNonNull,
    GraphQLScalarType,
    GraphQLInputObjectType
} = require("graphql");

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        tasks: {
            
            type: new GraphQLList(TaskType),
            resolve(parent /*arguments */, { id } /* parent*/ ) {
                return Task.find({ userId: parent.id})
                // return [...parent.tasks, userID]

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
        createdAt: { type: GraphQLString },
        userID: {
            type: GraphQLNonNull(UserType),
            resolve(parent, args) {
                const user = User.findById(parent.objectId)
                return user._id
            }
        }
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
                // console.log(parent);
                // console.log(args);
                return User.find();
            } 
        },
        // think of this like a single '/user' route
        user: {
            type: UserType,
            // for getting a particular user, you would need an arg of 'id' to fetch 
            // the user data by their 'id'
            args: { id: { type: GraphQLString } },
            // followed by resolver
            resolve(parent, args) { 
                // use mongoose function to get a single client as resolver 
                return User.findById(args.id)
            }
        },
        /* tasks : { // not really necessary -- just playing w/graphql
            type: new GraphQLList(UserType),  // list to return tasks
            args: { id: { type: GraphQLID } },

            // resolver to find all tasks belonging to one user by Id
            resolve(parent, args) {
                return User.findById(args.userID)
            }
        } */
        task: {
            type: TaskType,
            args: { id: { type: GraphQLString } },
            resolve(parent, args) {
                return Task.findById(args.id);
            }
        }
        
    }
})

// Mutations
const mutation /* <-- variable name */= new GraphQLObjectType({
    name: 'Mutation', // These will be like the apiRoutes in a way
    /* These will perform my Creations, Updates, and Deletes */
    fields: {

        // ***** User mutations *******

        registerUser: {
            type: UserType,
            args: {
                /* Use of 'GraphQlNonNull is equivalent to having field set to required */
                name: { type: GraphQLNonNull(GraphQLString) },
                email: { type: GraphQLNonNull(GraphQLString) },
                password: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve(parent, args) {
                const user = new User({
                    name: args.name,
                    email: args.email,
                    password: args.password
                });

                return user.save();
            }
        },
        deleteUser: {
            type: UserType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                return User.findByIdAndRemove(args.id)
            }
        },
        updateUser: {
            type: UserType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) }, 
            /* We want id to be ^not null^ so we 
                can find by ID to update */

                name: { type: GraphQLString },
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            resolve(parent, args) {
                return User.findByIdAndUpdate(
                    args.id,
                    // '$set' is a  built in prop where you set the properties 
                    // to their corresponding arguments
                    {
                        $set: {
                            name: args.name,
                            email: args.email,
                            password: args.password
                        }
                    },
                    // This 'new' is set to true in case the 
                    // property doesn't exist it will create
                    //  a new one
                    { new: true }
                )
            }
        },

        // ********* Task Mutations *********
        addTask: {
            type: TaskType,
            args: {
                action: { type: new GraphQLNonNull(GraphQLString) },
                deadline: { type: GraphQLString },
                completed: { type: GraphQLBoolean },
                createdAt: { 
                    type: GraphQLString,
                    defaultValue: Date.now()

                },
                userID: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve(parent, args) {
                const task = new Task({

                    action: args.action,
                    deadline: args.deadline,
                    completed: args.completed,
                    createdAt: args.createdAt,
                    userID: args.userID
                })
                
                // parent.tasks.push(task);
                return task.save()
                // return task
            }
        },

        // addTask trial #2
        // addTasktoUser: {
        //     type: GraphQLInputObjectType( TaskType ),
        //     args: {
        //         id: { type: GraphQLNonNull(GraphQLID) }, 
        //     /* We want id to be ^not null^ so we 
        //         can find by ID to update */

        //         name: { type: GraphQLString },
        //         email: { type: GraphQLString },
        //         password: { type: GraphQLString },
        //         tasks: { 
        //             type: GraphQLList(UserType),
        //             // defaultValue: [...tasks]
        //         }
        //     },
        //     resolve(parent, args) {
        //         return User.findByIdAndUpdate(
        //             args.id,
        //             {
        //                 $set: {
        //                     tasks: [...tasks, args.tasks]
        //                 }
        //             },
        //             // This 'new' is set to true in case the 
        //             // property doesn't exist it will create
        //             //  a new one
        //             { new: true }
        //         )
        //     }
        // },


        deleteTask: {
            type: TaskType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                return Task.findByIdAndRemove(args.id)
            }
        },
        updateTask: {
            type: TaskType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) }, 
            
                action: { type: GraphQLString },
                deadline: { type: GraphQLString },
                completed: { type: GraphQLBoolean }
            },
            resolve(parent, args) {
                return Task.findByIdAndUpdate(
                    args.id,
                    {
                        $set: {
                            action: args.action,
                            deadline: args.deadline,
                            completed: args.completed
                        }
                    },
                    { new: true }
                )
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation /* same as --> mutation: 'variable name' <--; 
    my 'variable name' is 'mutation' so it works just as fine */
})