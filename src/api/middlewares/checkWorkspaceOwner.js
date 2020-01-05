const { User } = require('../../models');
const ErrorHandler = require('../../utils/ErrorHandler');

async function checkWorkspaceOwner(req, res, next) {
  try {
    const { authUser, workspace } = req;
    const owner = await User.findOne({
      _id: authUser.sub,
      workspaces: {
        $in: [workspace._id],
      },
    }).lean();

    if (owner) {
      return next();
    }

    throw new ErrorHandler(
      'You are not authorized to perform this operation',
      401,
    );
  } catch (error) {
    return next(error);
  }
}

module.exports = checkWorkspaceOwner;
