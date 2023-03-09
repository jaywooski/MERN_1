
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.

const typeDefs = `#graphql

type User {
    _id: ID
    name: String
    email: String
    password: String
    quote: String
    tasks: [Task]
}

type Task {
    _id: ID
    action: String
    deadline: String
    completed: Boolean
    createdAt: String
}

#   Query Type

type Query {
    users: [User]
    tasks: [Task]
}

`;

module.exports = { typeDefs }