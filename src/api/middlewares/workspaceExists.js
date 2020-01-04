const { Workspace } = require('../../models');
const logger = require('../../utils/logger');

function workspaceExists(req, res, next) {
  try {
    Workspace.findById(req.params.workspaceID, (err, workspace) => {
      if (workspace) {
        req.workspace = workspace;
        return next();
      }
      throw new Error('Workspace not found');
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
}

module.exports = workspaceExists;
