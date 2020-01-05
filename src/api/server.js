const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const routes = require('./routes');

const server = express();

server.use(cors());
server.use(express.json());
server.use(helmet());

server.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to PENG API',
  });
});

server.get('/status', (req, res) => {
  res.status(200).end();
});

server.head('/status', (req, res) => {
  res.status(200).end();
});

server.use('/api/v1', routes);

// eslint-disable-next-line no-unused-vars
server.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
    },
  });
});

module.exports = server;
