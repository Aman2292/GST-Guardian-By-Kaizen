const jwt = require('jsonwebtoken');

const generateTokens = (user) => {
  const payload = {
    userId: user._id,
    firmId: user.firmId,
    role: user.role,
    isAdmin: user.caProfile ? user.caProfile.isAdmin : false
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

  return { accessToken, refreshToken };
};

const verifyToken = (token, isRefresh = false) => {
  try {
    const secret = isRefresh ? process.env.JWT_REFRESH_SECRET : process.env.JWT_SECRET;
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

module.exports = { generateTokens, verifyToken };
