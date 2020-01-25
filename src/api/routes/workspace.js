const workspaceRoute = require('express').Router();

const validate = require('../middlewares/validate');
const { workspaceSchema, inviteSchema } = require('../schema/workspaceSchema');
const WorkspaceService = require('../../services/Workspace');
const workspaceExists = require('../middlewares/workspaceExists');
const checkWorkspaceOwner = require('../middlewares/checkWorkspaceOwner');
const checkWorkspaceInvite = require('../middlewares/checkWorkspaceInvite');
const checkMembership = require('../middlewares/checkMembership');

workspaceRoute.post('/', validate(workspaceSchema), async function(
  req,
  res,
  next,
) {
  try {
    const WorkspaceServiceInstance = new WorkspaceService();
    const workspace = await WorkspaceServiceInstance.createWorkspace(
      req.body,
      req.authUser.sub,
    );
    res.status(201).json({
      workspace,
    });
  } catch (error) {
    next(error);
  }
});

workspaceRoute.get('/:workspaceID', workspaceExists, async function(req, res) {
  const { workspace } = req;
  res.status(200).json({ workspace });
});

workspaceRoute.get('/', async function(req, res, next) {
  try {
    const WorkspaceServiceInstance = new WorkspaceService();
    const workspaces = await WorkspaceServiceInstance.getUserWorkspaces(
      req.authUser.sub,
    );
    res.status(200).json({
      workspaces,
    });
  } catch (error) {
    next(error);
  }
});

workspaceRoute.put(
  '/:workspaceID',
  workspaceExists,
  checkWorkspaceOwner,
  validate(workspaceSchema),
  async function(req, res, next) {
    try {
      const WorkspaceServiceInstance = new WorkspaceService();
      const workspace = await WorkspaceServiceInstance.updateWorkspace(
        req.body,
        req.workspace,
      );
      res.status(200).json({
        workspace,
      });
    } catch (error) {
      next(error);
    }
  },
);

workspaceRoute.delete(
  '/:workspaceID',
  workspaceExists,
  checkWorkspaceOwner,
  async function(req, res, next) {
    try {
      const WorkspaceServiceInstance = new WorkspaceService();
      await WorkspaceServiceInstance.deleteWorkspace(req.workspace);
      res.status(204).json();
    } catch (error) {
      next(error);
    }
  },
);

workspaceRoute.post(
  '/:workspaceID/invite',
  workspaceExists,
  checkWorkspaceOwner,
  validate(inviteSchema),
  async function(req, res, next) {
    try {
      const WorkspaceServiceInstance = new WorkspaceService();
      const { email } = await WorkspaceServiceInstance.invite(
        req.body.email,
        req.workspace,
      );
      res.status(200).json({
        message: `Invite has been sent to ${email}`,
      });
    } catch (error) {
      next(error);
    }
  },
);

workspaceRoute.get(
  '/:workspaceID/join/:token',
  workspaceExists,
  checkWorkspaceInvite,
  async function(req, res, next) {
    const { authUser, userInvite } = req;

    try {
      const WorkspaceServiceInstance = new WorkspaceService();
      const { user, workspace } = await WorkspaceServiceInstance.join(
        userInvite,
        authUser,
      );
      res.status(200).json({
        message: `User "${user.name}" has been added to "${workspace.name}"`,
      });
    } catch (error) {
      next(error);
    }
  },
);

workspaceRoute.delete(
  '/:workspaceID/remove/:userID',
  workspaceExists,
  checkWorkspaceOwner,
  checkMembership,
  async function(req, res, next) {
    try {
      const WorkspaceServiceInstance = new WorkspaceService();
      const { user, workspace } = await WorkspaceServiceInstance.removeMember(
        req.workspace,
        req.params.userID,
      );
      res.status(200).json({
        message: `User "${user.name}" has been removed from "${workspace.name}"`,
      });
    } catch (error) {
      next(error);
    }
  },
);

workspaceRoute.delete(
  '/:workspaceID/leave',
  workspaceExists,
  checkMembership,
  async function(req, res, next) {
    try {
      const WorkspaceServiceInstance = new WorkspaceService();
      const { user, workspace } = await WorkspaceServiceInstance.removeMember(
        req.workspace,
        req.authUser.sub,
      );
      res.status(200).json({
        message: `${user.name}, You have left ${workspace.name} workspace`,
      });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = workspaceRoute;
