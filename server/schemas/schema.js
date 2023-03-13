const { User, Task } = require("../models");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const SECRET_KEY = process.env.SECRET_KEY;

dotenv.config()

const { 
    GraphQLObjectType, 
    GraphQLID, 
    GraphQLString, 
    GraphQLSchema, 
    GraphQLBoolean, 
    GraphQLList,
    GraphQLNonNull,
    GraphQLScalarType,
    GraphQLInputObjectType,
    GraphQLError, 
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

const LoginResponse = new GraphQLObjectType({
    name: 'LoginResponse',
    fields: () => ({
      accessToken: { type: GraphQLString },
      message: { type: GraphQLString}
    })
});


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
            async resolve(parent, args) {
                try {
                    const salt = await bcrypt.genSalt()
                    const hashedPassword = await bcrypt.hash(args.password, salt)
                    const user = new User({
                        name: args.name,
                        email: args.email,
                        password: hashedPassword
                    });

                    return user.save();

                } catch (error) {
                    return res.status(500).json({
                        message: 'Something went wrong!',
                        error: error.message
                    })
                }

            }
        },

        login: {
            type: LoginResponse,
            args: {
                email: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) },

            },
            async resolve(parent, args /* destructuring username and password for args param */) {
                    try {
                        const { email, password } = args;
                        const user = await User.findOne({ email });
        
                        if (!user) {
                            throw new Error('Invalid login credentials')
                        }
        
                        const isPasswordMatch = await bcrypt.compare(password, user.password);
                        if (!isPasswordMatch) {
                            throw new GraphQLError('Invalid email or password!');
                        }
                        
                        const accessToken = jwt.sign({ username: user.email }, SECRET_KEY/* secret key */, { expiresIn: '1d'});
        
                        const hashedToken = bcrypt.hashSync(accessToken, 10)
                        
                        // user.cookie('accessToken', hashedToken, { httpOnly: true }) 
                        /* Save accessToken as cookie when come back */

                        return {
                            accessToken: hashedToken,
                            message: "Login Successful!"
                        };
                        // return { accessToken };
                    }
                    catch (error) {
                        return new GraphQLError(error.message)
                    }
                },

        logout: {
            type: GraphQLString,
            args: {
                userID: { type: GraphQLString }
            },
            async resolve(parent, args, context) {

                try {
                    const user = await User.findById(args.userID);
                    
                    if (!user.accessToken) {
                    throw new Error('User not found');
                    }
                    user.accessToken = null;
                    await user.save();
                    return 'Logout Successful';
                } 
                catch (error) {
                    console.error(error);
                    throw new Error('Failed to clear token from database');
                }
                
                
                // context.res.cookie('jwt', '', { httpOnly: true });
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
            resolve(parent, args) { /*doesn't have to be asynchronous here */
                try {
                    const task = new Task({
    
                        action: args.action,
                        deadline: args.deadline,
                        completed: args.completed,
                        createdAt: args.createdAt,
                        userID: args.userID
                    })
                    
                    return task.save()
                    
                } catch (error) {
                    throw new Error('Something went wrong, trying to create your new task!')
                }
                
            }
        },

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
        },

        deleteAllTasks: {
            type: GraphQLString, /* Using string type because I want to return a message(string) instead of a data type */
            args: { 
                userID: { type: GraphQLNonNull(GraphQLString) }
            },
            async resolve(parent, {userID}/*args destructured to use just userID attribute */) {
                try {

                    if (!userID) {
                        throw new Error('User ID must be provided');
                    }
                    
                                        
                    const result = await Task.deleteMany({ userID });

                    if (result.deletedCount > 0 ) {
                        /*deletedCount is a built in method/property on mongoose object using deleteMany() */

                        return "All tasks deleted successfully!" 
                    } else {
                        return 'There are no tasks to delete!'
                    }
                    
                } catch (error) {
                    throw new Error('Something went wrong..')
                }
            }
        }
    }
}
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation /* same as --> mutation: 'variable name' <--; 
    my 'variable name' is 'mutation' so it works just as fine */
})