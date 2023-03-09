mongoose = require('mongoose');
require('dotenv').config()


const Connection = async () => {

    // Mongo DB Connections
    //  Can use async function here because 'mongoose.connect()' returns a promise
    const connection = await mongoose.connect(process.env.MONGO_DB_URL, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        // Not necessary ^^
    })

    console.log(`MongoDB connected at ${connection.connection.host} !! `);
    
    
    // .then(response=>{
    //     console.log('MongoDB Connection Succeeded.')
    // })
    // .catch(error=>{
    //     console.log('Error in DB connection: ' + error)
    // });
    //  not necessary ^^
}

module.exports =  { Connection }
