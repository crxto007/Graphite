// Authentication service
const jwt = require('jsonwebtoken');
const { hash } = require('../utils/hash.js');

class AuthService {
  static generateToken(user) {
    return jwt.sign({ userId: user.id, hash: hash(user.password) }, 'secret');
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, 'secret');
    } catch (err) {
      return null;
    }
  }
}

module.exports = AuthService;
EOF