const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Tài liệu API cho project Rental House',
            version: '1.0.0',
            description: 'API application made with Express and documented with Swagger',
        },
        servers: [
            {
                url: 'http://localhost:5000',
            },
            {
                url: 'https://be-android-project.onrender.com',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js'], 
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;