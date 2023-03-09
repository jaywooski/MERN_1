const express = require('express');
const { Connection }  = require('./database/db.js');
const app = express();
const cors = require('cors');
const User = require('./models/User')
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')
const apiRoutes = require('./routes/api/apiRoutes')
const { typeDefs, resolvers } = require('./schemas/index')

dotenv.config();



// const httpServer = http.createServer(app);

// Routes
app.get('/home', (req, res) => {
    res.send('JayWoo says Hello World!')
})


// Middleware Connections
app.use(cors())
app.use(express.json())

app.use('/api', apiRoutes)



// Connection

Connection(); 

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log('App running in port: '+PORT)
})