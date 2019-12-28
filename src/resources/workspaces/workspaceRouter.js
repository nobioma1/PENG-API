const workspaceRouter = require('express').Router();

const workspaceController = require('./workspaceController');
const workspaceMiddleware = require('./workspaceMiddleware');
const validate = require('../../utils/validate');
const { workspaceSchema, inviteSchema } = require('./workspaceSchema');

workspaceRouter.post(
  '/',
  validate(workspaceSchema),
  workspaceController.createWorkspace,
);
workspaceRouter.get(
  '/:workspaceID',
  workspaceMiddleware.workspaceExists,
  workspaceController.getWorkspace,
);
workspaceRouter.put(
  '/:workspaceID',
  workspaceMiddleware.workspaceExists,
  workspaceMiddleware.checkOwner,
  validate(workspaceSchema),
  workspaceController.updateWorkspace,
);
workspaceRouter.delete(
  '/:workspaceID',
  workspaceMiddleware.workspaceExists,
  workspaceMiddleware.checkOwner,
  workspaceController.deleteWorkspace,
);
workspaceRouter.post(
  '/:workspaceID/invite',
  workspaceMiddleware.workspaceExists,
  workspaceMiddleware.checkOwner,
  validate(inviteSchema),
  workspaceController.inviteMember,
);
workspaceRouter.get(
  '/:workspaceID/join/:token',
  workspaceMiddleware.workspaceExists,
  workspaceMiddleware.checkInvite,
  workspaceController.joinWorkspace,
);
workspaceRouter.delete(
  '/:workspaceID/remove/:userID',
  workspaceMiddleware.workspaceExists,
  workspaceMiddleware.checkOwner,
  workspaceMiddleware.checkMembership,
  workspaceController.removeMember,
);
workspaceRouter.delete(
  '/:workspaceID/leave',
  workspaceMiddleware.workspaceExists,
  workspaceMiddleware.checkMembership,
  workspaceController.leaveWorkspace,
);

module.exports = workspaceRouter;
