/* eslint-disable no-useless-catch */
const Crypto = require('crypto');

const { Workspace, WorkspaceInvite, User } = require('../models');
const MailerService = require('./Mailer');
const { encrypt } = require('../utils/encrypt-decrypt');
const ErrorHandler = require('../utils/ErrorHandler');

class WorkspaceService {
  constructor() {
    this.workspaceModel = Workspace;
    this.workspaceInviteModel = WorkspaceInvite;
    this.userModel = User;
    this.encrypt = encrypt;
    this.mailer = new MailerService();
  }

  async createWorkspace(workspaceInput, owner) {
    try {
      const workspaceRecord = await this.workspaceModel.create({
        ...workspaceInput,
        owner,
        members: [owner],
      });

      if (!workspaceRecord) {
        throw new ErrorHandler('Workspace cannot be created');
      }

      await this.userModel.findByIdAndUpdate(owner, {
        $push: {
          workspaces: workspaceRecord._id,
        },
      });

      const workspace = workspaceRecord.toObject();
      return workspace;
    } catch (error) {
      throw error;
    }
  }

  async getUserWorkspaces(userId) {
    try {
      const workspaces = await this.workspaceModel
        .find({
          owner: userId,
        })
        .lean();

      return workspaces;
    } catch (error) {
      throw error;
    }
  }

  async updateWorkspace(updateInput, workspace) {
    try {
      const updatedWorkspace = await this.workspaceModel
        .findByIdAndUpdate(
          workspace.id,
          {
            ...updateInput,
          },
          {
            new: true,
          },
        )
        .lean();

      if (!updatedWorkspace) {
        throw new ErrorHandler('Workspace cannot be updated');
      }

      return updatedWorkspace;
    } catch (error) {
      throw error;
    }
  }

  async deleteWorkspace(workspace) {
    try {
      await this.workspaceModel.findByIdAndDelete(workspace._id);
      return;
    } catch (error) {
      throw error;
    }
  }

  async invite(email, workspace) {
    try {
      const iToken = Crypto.randomBytes(20).toString('hex');
      const inviteRecord = await this.workspaceInviteModel.create({
        email,
        token: iToken,
        workspace: workspace._id,
      });

      const inviteToken = encrypt(inviteRecord.token);
      await this.mailer.sendInvite(email, inviteToken, workspace);

      const invite = inviteRecord.toObject();

      return invite;
    } catch (error) {
      throw error;
    }
  }

  async join(userInvite, authUser) {
    try {
      const workspace = await this.workspaceModel.findByIdAndUpdate(
        userInvite.workspace,
        {
          $push: {
            members: authUser.sub,
          },
        },
        { new: true },
      );

      const user = await this.userModel.findByIdAndUpdate(
        authUser.sub,
        {
          $push: {
            workspaces: workspace._id,
          },
        },
        { new: true },
      );

      if (!user) {
        throw new ErrorHandler('User not Found', 404);
      }

      await this.workspaceInviteModel.findOneAndDelete({
        email: user.email,
      });

      return {
        user: {
          id: authUser.sub,
          name: user.name,
        },
        workspace: {
          id: workspace._id,
          name: workspace.name,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async removeMember(workspace, memberID) {
    try {
      const workspaceRecord = await this.workspaceModel.findByIdAndUpdate(
        workspace.id,
        {
          $pull: {
            members: memberID,
          },
        },
        { new: true },
      );

      if (!workspaceRecord) {
        throw new ErrorHandler('Workspace not Found', 404);
      }

      const user = await User.findByIdAndUpdate(
        memberID,
        {
          $pull: {
            workspaces: workspaceRecord._id,
          },
        },
        { new: true },
      );

      return {
        user: {
          id: user._id,
          name: user.name,
        },
        workspace: {
          id: workspaceRecord._id,
          name: workspaceRecord.name,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = WorkspaceService;
