const { Workspace } = require('../../models');
const ErrorHandler = require('../../utils/ErrorHandler');

async function checkWorkspaceOwner(req, res, next) {
  try {
    const { authUser, workspace } = req;
    const ownerWorkspace = await Workspace.findOne({
      _id: workspace._id,
      owner: authUser.sub,
    }).lean();

    if (ownerWorkspace) {
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
