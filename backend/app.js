const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');

const { corsMiddleware } = require('./src/config/cors');
const { errorHandler, notFoundHandler } = require('./src/middlewares/error');
const routes = require('./src/routes');
const { logger } = require('./src/config/logger');

const app = express();

// Security headers
app.use(helmet());

// Basic logging
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat));
app.use(logger.requestId);

// CORS
app.use(corsMiddleware);

// Body parsers
app.use(express.json());

// API routes
app.use('/api', routes);

// OpenAPI docs
const openapiPath = path.join(__dirname, 'openapi.yaml');
if (fs.existsSync(openapiPath)) {
  const spec = yaml.load(fs.readFileSync(openapiPath, 'utf8'));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));
}

// 404 and error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

