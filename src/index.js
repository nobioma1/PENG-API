/* eslint-disable no-console */
const server = require('./api/server');
const { connectDb } = require('./config/dbConnect');
const { port } = require('./config');

connectDb()
  .then(connected => {
    if (connected) {
      server.listen(port, () => console.log(`Server Live @ Port ${port} 🚀`));
    } else {
      throw new Error('Error Starting Server');
    }
  })
  .catch(error => console.log(error));
