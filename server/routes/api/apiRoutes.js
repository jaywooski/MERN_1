const express = require('express')
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../../models/User')



// middleware to log time of server action
// router.use((req, res, next) => {
//     console.log('Time: ', Date.now());
//     next();
// })

router.post('/register', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        // console.log(salt);
        // console.log(hashedPassword);
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })

        res.status(201).json(user)
        // res.json({ status: 'ok'})

        
        // return (
        //     res.send(user)
        // )
        
    } catch (error) {
        // console.log(error);
        return res.json({ status: 'error', error: 'Duplicate email, that email belongs to a user already!' })
    }
})

router.post('/login', async (req, res) => { 
    
    
    const user = await User.findOne({
        email: req.body.email,
        // password: req.body.password 
    })
    // res.json(user);
    if(!user) {
        return res.status(400).json('Invalid login credentials')
    }
    try {
        if(await bcrypt.compare(req.body.password, user.password)) {
            return res.status(201).json( /* message: 'Success!' */ user )
        } else {
            return res.status(404).json({ error: 'Login failed!' })
        }
    } catch (error) {
        res.status(500).send(error)
    }
    /* Original code below for login method */
    // try {
        // const user = await User.findOne({
        //     email: req.body.email,
        //     password: req.body.password /* Bad practice but will be updated later */
        // })

        // bcrypt.compare(req.body.password, user.password)
        // if(user) {
            // return (res.send(user)); 
            /*When I try to send multiple times, it stops
            my server and I have to restart it */
            // const token = jwt.sign(
            //     {
            //         name: user.name,
            //         email: user.email,
            //     },
                // 'secret123'
                // Create better secret token and refresh token using node's built in 
                // require('crypto').randomBytes(64).toString('hex')
                // command in terminal.
                //
            // )
                
    //         return res.json({ status: 'ok', user: token })

    //     }else {
    //         return res.json({ status: 'error', user: false })
    //     }
        

    // } catch (error) {

    //     console.log(error)
    //     return res.json({ status: 'error', error: 'Username or Password is incorrect! '})
    // }
})

// to clear database in easier one command for dev purposes only
//  will delete later
router.delete('/deleteAll', async (res, req) => {
    const user = await User.deleteMany()
})

module.exports = router;