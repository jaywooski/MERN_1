const express = require('express')
const router = express.Router();

router.route('/')
.get((req, res) => {
    res.send('Hey yall localhost 5000 is working!')
})

module.exports = router;