const express = require('express');

const app = express();
const swaggerDocs = require('./swagger');
require('dotenv').config()

const port = process.env.PORT || 5000;
require('./src/models/videoModel');

// MiddleWare 

app.use(express.json());

swaggerDocs(app);

app.use('/upload', require('./src/controllers/videoController').router);

    app.listen(port, () => {
        console.log(`Server is running on ${port}`);
    });

module.exports = app;