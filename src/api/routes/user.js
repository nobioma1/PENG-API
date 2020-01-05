const userRoute = require('express').Router();

const userExists = require('../middlewares/userExists');

userRoute.get('/profile', userExists, async function(req, res) {
  const { user } = req;
  res.status(200).json({ user });
});

module.exports = userRoute;
