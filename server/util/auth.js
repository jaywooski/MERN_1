const express = require('express')
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

// async function setAuthorizationHeader(req, res, next) {
//     // const token = await fetch(req.)
// }

function Auth(req, res, next) {
    
    const authorization = req.headers.authorization;
    // Check to see if you have a header
    if (!authorization) {
        console.log(req.headers)
        return res.status(401).json({
            message: 'No Authorization Header'
        })
    }
    try {
        // Split header 
        const token = authorization.split('Bearer ')[1];

        // Check to see if token is null or not
        if (!token) {
            return res.status(401).json({
                message: 'Invalid Token Format'
            })
        }
        /*****************************************************STOPPING POINT RIGHT HEREEEEEE */
        const decode = jwt.verify(token, SECRET_KEY);
        req.user = decode
        next()
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                message: 'Session Expired',
                error: error.message,
            })
        }
        if (error instanceof jwt.JsonWebTokenError || error instanceof TokenError) {
            return res.status(401).json({
                message: 'Invalid Token',
                error: error.message,
            })
        }
        res.status(500).json({
            message: 'Internal server Error',
            error: error.message,
            stack: error.stack
        });
    }
}

module.exports = Auth