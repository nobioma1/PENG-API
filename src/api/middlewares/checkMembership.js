const { Workspace } = require('../../models');
const logger = require('../../utils/logger');

function checkMembership(req, res, next) {
  try {
    const target = req.params.userID ? req.params.userID : req.authUser.sub;

    Workspace.findOne({
      _id: req.params.workspaceID,
      members: {
        $in: [target],
      },
    }).exec((err, member) => {
      if (member) {
        return next();
      }
      throw new Error('User is not a member of Workspace');
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
}

module.exports = checkMembership;
