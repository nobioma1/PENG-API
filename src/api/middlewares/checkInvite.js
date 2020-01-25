const { WorkspaceInvite } = require('../../models');
const ErrorHandler = require('../../utils/ErrorHandler');

async function checkInvite(req, res, next) {
  try {
    const { email } = req.body;
    const invite = await WorkspaceInvite.findOne({
      email,
    });
    if (!invite) {
      return next();
    }
    throw new ErrorHandler(
      `User with email ${email} has been invited already`,
      400,
    );
  } catch (error) {
    return next(error);
  }
}

module.exports = checkInvite;
