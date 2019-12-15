require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const appRouter = require('./routes/appRouter');

const server = express();

server.use(express.urlencoded({ extended: false }));
server.use(helmet());
server.use(cors());

server.use('/api/v1', appRouter);

server.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to Peng API' });
});

module.exports = server;
