async function getProfile(req, res) {
  const { user } = req;
  res.status(200).json({ user });
}

// async function getUser(req, res) {}

// async function updateProfile(req, res) {}

module.exports = {
  getProfile,
  // getUser,
  // updateProfile,
};
