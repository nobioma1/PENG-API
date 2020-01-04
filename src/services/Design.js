const { Design, Workspace, Client } = require('../models');
const logger = require('../utils/logger');

class DesignService {
  constructor() {
    this.designModel = Design;
    this.clientModel = Client;
    this.workspaceModel = Workspace;
    this.logger = logger;
  }

  async addDesign(designInput, workspace) {
    try {
      await this.designModel.create(
        {
          ...designInput,
          workspace: workspace._id,
        },
        async (err, design) => {
          await this.clientModel.findByIdAndUpdate(design.client, {
            $push: {
              clients: design._id,
            },
          });
        },
      );
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}

module.exports = DesignService;
