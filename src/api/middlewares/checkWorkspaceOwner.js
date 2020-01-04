const { User } = require('../../models');
const logger = require('../../utils/logger');

function checkWorkspaceOwner(req, res, next) {
  try {
    const { authUser, workspace } = req;
    User.findById(authUser.sub, (err, user) => {
      /* 
      Cast to string because 'workspace.owner' and 
      'user.id' is a typeof 'Object' and returns 
      false when compared if not cast to String 
      */
      if (user && String(workspace.owner) === String(user.id)) {
        return next();
      }

      throw new Error('You are not authorized to perform this operation');
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
}

module.exports = checkWorkspaceOwner;
