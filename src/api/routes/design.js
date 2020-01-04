const designRoute = require('express').Router();

const clientExists = require('../middlewares/clientExists');
const DesignService = require('../../services/Design');

designRoute.post('/', clientExists, async function(req, res, next) {
  const { body, workspace } = req;
  try {
    const DesignServiceInstance = new DesignService();
    const design = await DesignServiceInstance.addClient(body, workspace);
    res.status(201).json({
      design,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = designRoute;
