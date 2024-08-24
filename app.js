const express = require('express');
const authenticateToken = require('./src/middleware/auth');
app = express();

require('dotenv').config()

const port = process.env.PORT || 5000;
require('./src/models/videoModel');

// MiddleWare 
app.use(authenticateToken);
app.use(express.json());


app.use('/upload', require('./src/controllers/videoController').router)


app.listen(port , () =>{
    console.log(`Server is running on ${port}`);
});