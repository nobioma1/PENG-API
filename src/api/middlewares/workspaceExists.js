const { Workspace } = require('../../models');
const ErrorHandler = require('../../utils/ErrorHandler');

async function workspaceExists(req, res, next) {
  try {
    const workspace = await Workspace.findById(req.params.workspaceID)
      .populate('clients')
      .lean();
    if (workspace) {
      req.workspace = workspace;
      return next();
    }
    throw new ErrorHandler('Workspace not found', 404);
  } catch (error) {
    return next(error);
  }
}

module.exports = workspaceExists;
