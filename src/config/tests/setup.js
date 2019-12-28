const mongoose = require('mongoose');
const sgMail = require('@sendgrid/mail');

// Load models since we will not be instantiating our express server.
require('../../models/PasswordReset');
require('../../models/User');
require('../../models/VerifyToken');
require('../../models/Workspace');
require('../../models/WorkspaceInvite');

jest.setTimeout(15000);
jest.mock('@sendgrid/mail');
const defaultMailOptions = { response: 'Okay' };

/*
  Define clearDB function that will loop through all 
  the collections in our mongoose connection and drop them.
*/
function clearDB(done) {
  Object.keys(mongoose.connection.collections).forEach(collection => {
    // eslint-disable-next-line func-names
    mongoose.connection.collections[collection].deleteOne(function() {});
  });
  return done();
}

// eslint-disable-next-line consistent-return
beforeEach(done => {
  /*
    If the mongoose connection is closed, 
    start it up using the test url and database name
    provided by the node runtime ENV
  */
  if (mongoose.connection.readyState === 0) {
    mongoose.connect(
      process.env.TEST_DATABASE_URL,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true, // Remove useCreateIndex deprecation error
      },
      err => {
        if (err) {
          throw err;
        }
        return clearDB(done);
      },
    );
  } else {
    return clearDB(done);
  }

  global.mockMailer = (options = defaultMailOptions) => {
    return sgMail.sendMultiple.mockImplementation(() =>
      Promise.resolve(options),
    );
  };
});

afterEach(done => {
  jest.clearAllMocks();
  return done();
});

beforeAll(done => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  done();
});

afterAll(done => {
  mongoose.disconnect();
  clearDB(done);
  done();
});
