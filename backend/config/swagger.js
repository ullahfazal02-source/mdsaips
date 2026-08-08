/**
 * Swagger API Documentation Setup
 * 
 * Configures swagger-jsdoc options for automatic OpenAPI documentation generation.
 */

import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MDSAIPS API Documentation',
      version: '1.0.0',
      description: 'Multi-Domain Service Aggregation & Intelligent Planning System API Specs',
      contact: {
        name: 'MDSAIPS Engineering Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Path to API docs containing JSDoc comments
  apis: ['./routes/*.js', './controllers/*.js'],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
export default swaggerSpec;
