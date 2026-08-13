const userRepository = require('../repositories/user.repo');
const { httpError } = require('../utils/httpError');

// BUG-018: register/login/refreshToken đã được gộp về services/auth.service.js.
// user.service chỉ xử lý profile/user data (không còn bcrypt/jwt ở đây).
class UserService {
  async getUserById(id) {
    return userRepository.findById(id);
  }

  async getUserByUsername(username) {
    return userRepository.findByUsername(username);
  }

  async updateProfile(user_id, data) {
    const updateData = {};
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.username !== undefined) {
      // BUG-036: validate username trước khi lưu (tránh rỗng / quá dài / ký tự đặc biệt)
      const username = String(data.username).trim();
      if (username.length < 3 || username.length > 30) {
        throw httpError(400, 'Username phải từ 3 đến 30 ký tự');
      }
      if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
        throw httpError(400, 'Username chỉ được chứa chữ, số, dấu chấm, gạch dưới, gạch ngang');
      }
      updateData.username = username;
    }
    
    return userRepository.update(user_id, updateData);
  }
  async getFollowSuggestions(userId, limit = 5) {
    const Follow = require('../models/Follow');
    const User = require('../models/User');
    
    // Get IDs of users already following
    const following = await Follow.find({ follower_id: userId }).select('following_id');
    const followingIds = following.map(f => f.following_id);
    followingIds.push(userId); // Don't suggest self

    return User.find({ _id: { $nin: followingIds } })
      .select('username avatar bio')
      .limit(limit);
  }
}

module.exports = new UserService();
