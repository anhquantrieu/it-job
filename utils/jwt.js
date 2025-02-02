const jwt = require('jsonwebtoken');

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE });
};

const verifyToken = (token, secret) => {
  try {
      return jwt.verify(token, secret);
  } catch (error) {
      return null;
  }
};

module.exports = { generateAccessToken, generateRefreshToken, verifyToken };
