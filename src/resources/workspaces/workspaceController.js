/* eslint-disable no-underscore-dangle */
const Crypto = require('crypto');

const { Workspace, WorkspaceInvite, User } = require('../../models');
const sendMail = require('../../utils/sendMail');
const { encrypt } = require('../../utils/encrypt-decrypt');

async function createWorkspace(req, res) {
  const { body, authUser } = req;
  try {
    const newWorkspace = {
      ...body,
      owner: authUser.sub,
    };
    const workspace = await Workspace.create(newWorkspace);

    return res.status(201).json({
      workspace,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error Creating Workspace' });
  }
}

function getWorkspace(req, res) {
  const { workspace } = req;
  return res.status(200).json({ workspace });
}

async function updateWorkspace(req, res) {
  const { workspace, body } = req;
  try {
    const newWorkspace = await Workspace.findByIdAndUpdate(
      workspace.id,
      { ...body },
      { new: true },
    ).lean();

    return res.status(200).json({
      workspace: {
        ...newWorkspace,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error Updating Workspace' });
  }
}

async function deleteWorkspace(req, res) {
  const { workspace } = req;
  try {
    await Workspace.findByIdAndDelete(workspace.id);
    return res.status(204).end();
  } catch (error) {
    return res.status(500).json({ error: 'Error deleting workspace' });
  }
}

async function inviteMember(req, res) {
  const { body, workspace } = req;
  try {
    const iToken = Crypto.randomBytes(20).toString('hex');
    const invite = await WorkspaceInvite.create({
      email: body.email,
      token: iToken,
      workspace: workspace._id,
    });

    const inviteToken = encrypt(invite.token);
    await sendMail(body.email, 'Invitation to Join a Workspace', {
      name: body.email,
      subject: `Invite to ${workspace.name}`,
      intro: `Hurray, 🎉🎉 You have been invited to join ${workspace.name} Workspace on PENG`,
      buttonText: `Join ${workspace.name}`,
      link: `/invite/${inviteToken}`,
    });

    return res.status(200).json({
      message: `Invite has been sent to ${invite.email}`,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error Inviting User' });
  }
}

async function joinWorkspace(req, res) {
  const {
    authUser,
    userInvite: { workspace: workspaceID },
    workspace,
  } = req;

  try {
    await Workspace.findByIdAndUpdate(workspaceID, {
      $push: {
        members: authUser.sub,
      },
    }).exec(async (workspaceErr, workspaceDoc) => {
      if (workspaceErr) {
        throw new Error();
      }
      await User.findByIdAndUpdate(authUser.sub, {
        $push: {
          workspaces: workspaceDoc.id,
        },
      }).exec(async (userErr, userDoc) => {
        if (userErr) {
          throw new Error();
        }
        await WorkspaceInvite.findOneAndDelete({
          workspace: workspaceDoc.id,
        });
        res.status(200).json({
          message: `User "${userDoc.name}" has been added to ${workspace.name}`,
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error Joining Workspace' });
  }
}

async function removeMember(req, res) {
  const {
    workspace,
    params: { userID },
  } = req;
  try {
    await Workspace.findByIdAndUpdate(workspace.id, {
      $pull: {
        members: req.params.userID,
      },
    }).exec(async (workspaceErr, workspaceDoc) => {
      if (workspaceErr) {
        throw new Error();
      }
      await User.findByIdAndUpdate(userID, {
        $pull: {
          workspaces: workspaceDoc.id,
        },
      }).exec((userErr, userDoc) => {
        if (userErr) {
          throw new Error();
        }
        res.status(200).json({
          message: `User "${userDoc.name}" has been removed from ${workspace.name}`,
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error Removing Member from Workspace' });
  }
}

async function leaveWorkspace(req, res) {
  const { workspace, authUser } = req;
  try {
    await Workspace.findByIdAndUpdate(workspace.id, {
      $pull: {
        members: authUser.sub,
      },
    }).exec(async (workspaceErr, workspaceDoc) => {
      if (workspaceErr) {
        throw new Error();
      }
      await User.findByIdAndUpdate(authUser.sub, {
        $pull: {
          workspaces: workspaceDoc.id,
        },
      }).exec((userErr, userDoc) => {
        if (userErr) {
          throw new Error();
        }
        res.status(200).json({
          message: `${userDoc.name}, You have left ${workspace.name} workspace`,
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error Leaving Workspace' });
  }
}

module.exports = {
  createWorkspace,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  joinWorkspace,
  removeMember,
  leaveWorkspace,
};
