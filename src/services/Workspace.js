const { Workspace, WorkspaceInvite, User } = require('../models');
const MailerService = require('./Mailer');
const { encrypt } = require('../utils/encrypt-decrypt');
const logger = require('../utils/logger');

class WorkspaceService {
  constructor() {
    this.workspaceModel = Workspace;
    this.workspaceInviteModel = WorkspaceInvite;
    this.userModel = User;
    this.encrypt = encrypt;
    this.mailer = new MailerService();
    this.logger = logger;
  }

  async createWorkspace(workspaceInput, owner) {
    try {
      const workspaceRecord = await this.workspaceModel.create({
        ...workspaceInput,
        owner,
      });

      if (!workspaceRecord) {
        throw new Error('Workspace cannot be created');
      }

      const workspace = workspaceRecord.toObject();
      return workspace;
    } catch (error) {
      this.logger.error(error);
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
        throw new Error('Workspace cannot be updated');
      }

      return updatedWorkspace;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async deleteWorkspace(workspace) {
    try {
      await this.workspaceModel.findByIdAndDelete(workspace.id);
      return;
    } catch (error) {
      this.logger.error(error);
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
      this.logger.error(error);
      throw error;
    }
  }

  async join(workspace, authUser) {
    try {
      await this.workspaceModel
        .findByIdAndUpdate(workspace.id, {
          $push: {
            members: authUser.sub,
          },
        })
        .exec(async (workspaceErr, workspaceDoc) => {
          await this.userModel
            .findByIdAndUpdate(authUser.sub, {
              $push: {
                workspaces: workspaceDoc.id,
              },
            })
            .exec(async (userErr, userDoc) => {
              await this.workspaceInviteModel.findOneAndDelete({
                email: userDoc.email,
              });
              return { member: userDoc.toObject() };
            });
        });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async removeMember(workspace, memberID) {
    try {
      await this.workspaceModel
        .findByIdAndUpdate(workspace.id, {
          $pull: {
            members: memberID,
          },
        })
        .exec(async (workspaceErr, workspaceDoc) => {
          await User.findByIdAndUpdate(memberID, {
            $pull: {
              workspaces: workspaceDoc.id,
            },
          }).exec((userErr, userDoc) => {
            return { member: userDoc.toObject() };
          });
        });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}

module.exports = WorkspaceService;
