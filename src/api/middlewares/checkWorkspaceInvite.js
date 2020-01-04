const { WorkspaceInvite } = require('../../models');
const logger = require('../../utils/logger');
const { decrypt } = require('../../utils/encrypt-decrypt');

function checkWorkspaceInvite(req, res, next) {
  try {
    const token = decrypt(req.params.token);
    WorkspaceInvite.findOne(
      { token, workspace: req.params.workspaceID },
      (err, userInvite) => {
        if (userInvite) {
          req.userInvite = userInvite;
          return next();
        }
        throw new Error('Invalid Invitation Token');
      },
    );
  } catch (error) {
    logger.error(error);
    next(error);
  }
}

module.exports = checkWorkspaceInvite;
