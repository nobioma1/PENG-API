const { Client, Workspace } = require('../models');
const logger = require('../utils/logger');

class ClientService {
  constructor() {
    this.clientModel = Client;
    this.workspaceModel = Workspace;
    this.logger = logger;
  }

  async addClient(clientInput, workspace) {
    try {
      const clientRecord = await this.clientModel.create(
        {
          ...clientInput,
          workspace: workspace._id,
        },
        async (err, client) => {
          await this.workspaceModel.findByIdAndUpdate(workspace._id, {
            $push: {
              clients: client._id,
            },
          });
        },
      );

      if (!clientRecord) {
        throw new Error('Client cannot be added');
      }

      const client = clientRecord.toObject();
      return client;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}

module.exports = ClientService;
