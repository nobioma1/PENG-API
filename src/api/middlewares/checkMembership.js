const { Workspace } = require('../../models');
const ErrorHandler = require('../../utils/ErrorHandler');

async function checkMembership(req, res, next) {
  try {
    const target = req.params.userID ? req.params.userID : req.authUser.sub;

    const member = await Workspace.findOne({
      _id: req.params.workspaceID,
      members: {
        $in: [target],
      },
    });
    if (member) {
      return next();
    }
    throw new ErrorHandler('User is not a member of Workspace', 404);
  } catch (error) {
    return next(error);
  }
}

module.exports = checkMembership;
