const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/userSchema')

const jwt = require('jsonwebtoken');


require('dotenv').config()

// Mongo DB Connections
mongoose.connect(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(response=>{
    console.log('MongoDB Connection Succeeded.')
}).catch(error=>{
    console.log('Error in DB connection: ' + error)
});


// Middleware Connections
app.use(cors())
app.use(express.json())


// Routes
app.get('/home', (req, res) => {
    res.send('JayWoo says Hello World!')
})

app.post('/api/register', async (req, res) => {
    try {
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        })

        console.log(req.body);
        // res.json({ status: 'ok'})

        
        // return (
        //     res.send(user)
        // )
        
    } catch (error) {
        console.log(error);
        return res.json({ status: 'error', error: 'Duplicate email, that email belongs to a user already!' })
    }
})

app.post('/api/login', async (req, res) => { 
    try {
        const user = await User.findOne({
            email: req.body.email,
            password: req.body.password /* Bad practice but will be updated later */
        })
        
        if(user) {
            // return (res.send(user)); 
            /*When I try to send multiple times, it stops
            my server and I have to restart it */
            const token = jwt.sign(
                {
                    name: user.name,
                    email: user.email,
                },
                'secret123'
                // Create better secret token and refresh token using node's built in 
                // require('crypto').randomBytes(64).toString('hex')
                // command in terminal.
                //
            )
                
            return res.json({ status: 'ok', user: token })

        }else {
            return res.json({ status: 'error', user: false })
        }
        

    } catch (error) {

        console.log(error)
        return res.json({ status: 'error', error: 'Username or Password is incorrect! '})
    }
})

// Connection
const PORT = process.env.PORT || 5000
app.listen(PORT, ()=>{
    console.log('App running in port: '+PORT)
})