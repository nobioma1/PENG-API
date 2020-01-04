const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const routes = require('./routes');

const server = express();

// Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// It shows the real origin IP in the heroku or Cloudwatch logs
server.enable('trust proxy');

server.use(express.json());
server.use(helmet());
server.use(cors());

server.use('/api/v1', routes);

/**
 * Health Check endpoints
 * @TODO Explain why they are here
 */
server.get('/status', (req, res) => {
  res.status(200).end();
});

server.head('/status', (req, res) => {
  res.status(200).end();
});

server.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to Peng API' });
});

//  catch 404 and forward to error handler
server.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//  error handlers
server.use((err, req, res, next) => {
  /**
   * Handle 401 thrown by express-jwt library
   */
  if (err.name === 'UnauthorizedError') {
    return res
      .status(err.status)
      .send({ message: err.message })
      .end();
  }
  return next(err);
});

server.use((err, req, res) => {
  res.status(err.status || 500);
  res.json({
    errors: {
      message: err.message,
    },
  });
});

module.exports = server;
