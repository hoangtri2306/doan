const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  async register(data) {
    // Lưu ý: KHÔNG đọc field `role` từ client (BUG-002)
    const { email, password, avatar, bio, username } = data;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user (role is ALWAYS 'USER' — never trust client input, see BUG-002)
    const newUser = new User({
      email,
      username: username || email.split('@')[0] + Math.floor(Math.random() * 10000),
      password: hashedPassword,
      role: 'USER',
      avatar,
      bio
    });

    await newUser.save();

    // Return user without password, in the same shape as login (BUG-012)
    const userToReturn = this._publicUser(newUser);
    const tokens = this._generateTokens(newUser);

    return { user: userToReturn, tokens };
  }

  async login(email, password) {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user has been soft-deleted
    if (user.isDeleted || user.deleted_at) {
      throw new Error('Account has been deleted');
    }

    // BUG-030: banned users must not be able to log in
    if (user.status === 'BANNED') {
      throw new Error('Tài khoản của bạn đã bị khóa.');
    }

    // Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const tokens = this._generateTokens(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this._publicUser(user)
    };
  }

  async refreshToken(token) {
    if (!token) throw new Error('Refresh token is required');

    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      
      // Verify user still exists and not deleted
      const user = await User.findById(decoded.userId);
      if (!user || user.isDeleted) {
        throw new Error('User not found or deleted');
      }

      // BUG-030: banned users must not be able to refresh tokens
      if (user.status === 'BANNED') {
        throw new Error('Tài khoản của bạn đã bị khóa.');
      }

      // Token rotation: issue a NEW refresh token each time (BUG-012)
      const tokens = this._generateTokens(user);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };
    } catch (error) {
      if (error.message === 'Tài khoản của bạn đã bị khóa.') {
        throw error;
      }
      throw new Error('Invalid or expired refresh token');
    }
  }

  _generateTokens(user) {
    const payload = {
      userId: user._id.toString(),
      role: user.role
    };

    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m'
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
    });

    return { accessToken, refreshToken };
  }

  _publicUser(user) {
    return {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio
    };
  }
}

module.exports = new AuthService();
