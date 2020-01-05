/* eslint-disable no-useless-catch */
const { Client, Workspace } = require('../models');
const ErrorHandler = require('../utils/ErrorHandler');

class ClientService {
  constructor() {
    this.clientModel = Client;
    this.workspaceModel = Workspace;
  }

  async addClient(clientInput, workspace) {
    try {
      // Create Client record
      const clientRecord = await this.clientModel.create({
        ...clientInput,
        workspace: workspace._id,
      });

      if (!clientRecord) {
        throw new ErrorHandler('Client cannot be added');
      }

      // Then, add client to workspace
      await this.workspaceModel.findByIdAndUpdate(workspace._id, {
        $push: {
          clients: clientRecord._id,
        },
      });

      const client = clientRecord.toObject();
      return client;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ClientService;
