const { WorkspaceInvite } = require('../../models');
const ErrorHandler = require('../../utils/ErrorHandler');
const { decrypt } = require('../../utils/encrypt-decrypt');

async function checkWorkspaceInvite(req, res, next) {
  try {
    const token = decrypt(req.params.token);
    const userInvite = await WorkspaceInvite.findOne({
      token,
      workspace: req.params.workspaceID,
    });
    if (userInvite) {
      req.userInvite = userInvite;
      return next();
    }
    throw new ErrorHandler('Invalid Invitation Token');
  } catch (error) {
    let err = error;
    if (error.message === 'Invalid IV length') {
      err = new ErrorHandler('Invalid Invitation Token');
    }
    return next(err);
  }
}

module.exports = checkWorkspaceInvite;
