const server = require('./api/server');
const mongooseLoader = require('./config/dbConnect');
const { PORT } = require('./config');
const Logger = require('./utils/logger');

async function startServer() {
  await mongooseLoader();
  server.listen(PORT, err => {
    if (err) {
      Logger.error(err);
      process.exit(1);
      return;
    }
    Logger.info(`####🚀 Server listening on port: ${PORT} 🚀 ####`);
  });
}

startServer();
