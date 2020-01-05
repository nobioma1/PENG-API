/* eslint-disable no-useless-catch */
const { Design, Workspace, Client } = require('../models');
const ErrorHandler = require('../utils/ErrorHandler');

class DesignService {
  constructor() {
    this.designModel = Design;
    this.clientModel = Client;
    this.workspaceModel = Workspace;
  }

  async addDesign(designInput, workspace) {
    try {
      const designRecord = await this.designModel.create({
        ...designInput,
        workspace: workspace._id,
      });

      if (!designRecord) {
        throw new ErrorHandler('Error adding design');
      }

      const clientRecord = await this.clientModel.findByIdAndUpdate(
        designRecord.client,
        {
          $push: {
            designs: designRecord._id,
          },
        },
        { new: true },
      );

      return {
        client: clientRecord.toObject(),
        design: designRecord.toObject(),
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DesignService;
