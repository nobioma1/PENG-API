/* eslint-disable no-console */
const server = require('./api/server');
const { connectDb } = require('./config/dbConnect');
const { PORT } = require('./config');

connectDb()
  .then(connected => {
    if (connected) {
      server.listen(PORT, () => console.log(`Server Live @ Port ${PORT} 🚀`));
    } else {
      throw new Error('Error Starting Server');
    }
  })
  .catch(error => console.log(error));
