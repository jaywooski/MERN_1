const express = require('express');
const { Connection }  = require('./database/db.js');
const app = express();
const cors = require('cors');
const User = require('./models/User')
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')
const apiRoutes = require('./routes/api/apiRoutes')
const userRoutes = require('./routes/client/userRoutes')
const { schema } = require('./schemas/index');
const { graphqlHTTP } = require('express-graphql');
const authMiddleware = require('./util/auth')

dotenv.config();




// Routes
app.get('/home', (req, res) => {
    res.send('JayWoo says Hello World!')
})


// Middleware Connections
app.use(cors())
app.use(express.json())
// app.use('/', userRoutes)
app.use('/graphql', /* authMiddleware,  passing in jwt authentication middleware */ graphqlHTTP({
    schema,
    context: { authMiddleware } ,
    graphiql: process.env.NODE_ENV === 'development'
}))

app.use('/api', apiRoutes)



// Connection

Connection(); 

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log('App running in port: '+PORT)
})