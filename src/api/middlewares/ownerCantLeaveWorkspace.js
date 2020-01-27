const { Workspace } = require('../../models');
const ErrorHandler = require('../../utils/ErrorHandler');

async function ownerCantLeaveWorkspace(req, res, next) {
  try {
    const { authUser, workspace } = req;
    const ownerWorkspace = await Workspace.findOne({
      _id: workspace._id,
      owner: authUser.sub,
    }).lean();

    if (!ownerWorkspace) {
      return next();
    }

    throw new ErrorHandler('Workspace Admin can not leave Workspace', 400);
  } catch (error) {
    return next(error);
  }
}

module.exports = ownerCantLeaveWorkspace;
