const designRoute = require('express').Router();

const validate = require('../middlewares/validate');
const { designSchema } = require('../schema/designSchema');
const clientExists = require('../middlewares/clientExists');
const DesignService = require('../../services/Design');

designRoute.post('/', validate(designSchema), clientExists, async function(
  req,
  res,
  next,
) {
  const { body, workspace } = req;
  try {
    const DesignServiceInstance = new DesignService();
    const { design } = await DesignServiceInstance.addDesign(body, workspace);
    res.status(201).json({
      design,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = designRoute;
