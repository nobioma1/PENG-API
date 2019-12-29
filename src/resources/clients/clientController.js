const { Client, Workspace } = require('../../models');

async function addClient(req, res) {
  const { body, workspace } = req;
  try {
    await Client.create(
      {
        ...body,
        workspace: workspace._id,
      },
      async (err, client) => {
        await Workspace.findByIdAndUpdate(workspace._id, {
          $push: {
            clients: client._id,
          },
        });
        res.status(201).json({
          client,
        });
      },
    );
  } catch (error) {
    res.status(500).json({ error: 'Error Adding Client' });
  }
}

module.exports = {
  addClient,
};
