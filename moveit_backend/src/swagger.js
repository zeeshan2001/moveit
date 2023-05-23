const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const config = require('./config');


const options = {
    swaggerDefinition: {
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'REST API Documentation'
        },
        basePath: "/" + config.url + "/"
    },
    apis: [
        path.resolve(__dirname, './routes/*.js'),
        path.resolve(__dirname, './models/*.js'),
        path.resolve(__dirname, './utils/*.js')
    ]
};
const specs = swaggerJsdoc(options);


module.exports = function(app) {
    app.use('/doc', swaggerUi.serve, swaggerUi.setup(specs, options));
};