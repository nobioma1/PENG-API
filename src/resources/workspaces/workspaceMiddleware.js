const { Workspace, User, WorkspaceInvite } = require('../../models');
const { decrypt } = require('../../utils/encrypt-decrypt');

/**
 * Checks if the workspace exists
 * If exists, adds the workspace object to the 'req' object
 * @param {params.workspaceID} req
 * @param {*} res
 * @param {*} next
 * @returns 'next()' or res(404) - { error: 'Workspace not found' }
 */
function workspaceExists(req, res, next) {
  Workspace.findById(req.params.workspaceID, (err, workspace) => {
    if (workspace) {
      req.workspace = workspace;
      return next();
    }
    return res.status(404).json({ error: 'Workspace not found' });
  });
}

/**
 * Checks if authenticated user ('authToken') is the owner of workspace
 * @param {authUser, workspace} req
 * @param {*} res
 * @param {*} next
 * @returns 'next()' or res(401) - { error: 'You are not authorized to perform this operation' }
 */
function checkOwner(req, res, next) {
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
    return res
      .status(401)
      .json({ error: 'You are not authorized to perform this operation' });
  });
}

function checkInvite(req, res, next) {
  try {
    const token = decrypt(req.params.token);
    WorkspaceInvite.findOne(
      { token, workspace: req.params.workspaceID },
      (err, userInvite) => {
        if (userInvite) {
          req.userInvite = userInvite;
          return next();
        }
        throw new Error(err);
      },
    );
  } catch (error) {
    res.status(400).json({ error: 'Invalid Invitation Token' });
  }
}

function checkMembership(req, res, next) {
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
    return res.status(404).json({ error: 'User is not a member of Workspace' });
  });
}

module.exports = {
  workspaceExists,
  checkOwner,
  checkInvite,
  checkMembership,
};
