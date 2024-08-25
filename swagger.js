const swaggerUi = require('swagger-ui-express');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

// Load YAML file from swaggerDoc directory
const swaggerDocument = yaml.load(fs.readFileSync(path.join(__dirname, 'swaggerDoc', 'videoService.yaml'), 'utf8'));

module.exports = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}