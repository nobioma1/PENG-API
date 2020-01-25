const { Workspace, User } = require('../../models');
const ErrorHandler = require('../../utils/ErrorHandler');

async function checkAlreadyMember(req, res, next) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      const member = await Workspace.findOne({
        _id: req.params.workspaceID,
        members: {
          $in: [user._id],
        },
      });

      if (member) {
        throw new ErrorHandler(
          `User with email ${email} is already a member of workspace.`,
          400,
        );
      }
    }
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = checkAlreadyMember;
