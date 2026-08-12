const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  async register(data) {
    // Lưu ý: KHÔNG đọc field `role` từ client (BUG-002)
    const { email, password, avatar, bio, username } = data;

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // BUG-037: trả message chung (không tiết lộ email đã tồn tại → chống user enumeration)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Registration failed');
    }

    // BUG-035: username random dễ trùng → retry với suffix khác tối đa 3 lần
    // (nếu username user tự chọn bị trùng, giữ username đó + thêm suffix thay vì bỏ hẳn)
    let newUser = null;
    for (let attempt = 0; attempt < 3 && !newUser; attempt++) {
      const base = username || email.split('@')[0];
      const suffix = Math.random().toString(36).slice(2, 8);
      const candidateUsername = attempt === 0 ? base : `${base}_${suffix}`;

      newUser = new User({
        email,
        username: candidateUsername,
        password: hashedPassword,
        role: 'USER', // luôn 'USER' — xem BUG-002
        avatar,
        bio
      });

      try {
        await newUser.save();
      } catch (err) {
        newUser = null;
        // E11000: email/username trùng (race) → thử lại với suffix khác
        if (err.code !== 11000) throw err;
      }
    }

    if (!newUser) {
      throw new Error('Registration failed');
    }

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
