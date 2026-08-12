const userService = require('../services/user.service');
const followService = require('../services/follow.service');

// BUG-018: register/login/refreshToken đã được gộp về controllers/auth.controller.js + services/auth.service.js
// (xem routes/auth.routes.js). user.controller chỉ xử lý profile/user data.
class UserController {
  async logout(req, res, next) {
    try {
      res.clearCookie('refreshToken');
      res.status(200).json({ success: true, message: 'Logout successful', data: null });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const updatedUser = await userService.updateProfile(req.user.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          avatar: updatedUser.avatar,
          bio: updatedUser.bio,
          violationScore: updatedUser.violationScore || 0,
          status: updatedUser.status || 'ACTIVE'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await userService.getUserById(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found', data: null });
      res.status(200).json({
        success: true,
        message: 'User retrieved',
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
          violationScore: user.violationScore || 0,
          status: user.status || 'ACTIVE'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getPublicProfile(req, res, next) {
    try {
      const { username } = req.params;
      const user = await userService.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const postService = require('../services/post.service');
      const isAuthenticated = !!req.user;
      let isLimited = false;
      let finalPosts = await postService.getPostsByUser(user._id, req.user?.id);

      if (!isAuthenticated && finalPosts.length > 3) {
        finalPosts = finalPosts.slice(0, 3);
        isLimited = true;
      }

      const [followStats, isFollowing] = await Promise.all([
        followService.getFollowStats(user._id),
        followService.isFollowing(req.user?.id, user._id)
      ]);

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            avatar: user.avatar,
            bio: user.bio,
            createdAt: user.createdAt,
            followersCount: followStats.followersCount,
            followingCount: followStats.followingCount,
            isFollowing: isFollowing
          },
          posts: finalPosts,
          meta: { isLimited }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookmarks(req, res, next) {
    try {
      const postService = require('../services/post.service');
      const posts = await postService.getBookmarkedPosts(req.user.id);
      res.status(200).json({ success: true, message: 'Bookmarks retrieved', data: posts });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
