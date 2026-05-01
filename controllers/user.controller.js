const userService = require('../services/user.service');

class UserController {
  async register(req, res, next) {
    try {
      const data = await userService.register(req.body);
      
      // Send refresh token as HTTP Only cookie
      res.cookie('refreshToken', data.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: data.user,
          accessToken: data.tokens.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const data = await userService.login(req.body);

      res.cookie('refreshToken', data.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: data.user,
          accessToken: data.tokens.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const token = req.cookies?.refreshToken || req.body.refreshToken;
      if (!token) {
        return res.status(401).json({ success: false, message: 'Refresh token required', data: null });
      }

      const data = await userService.refreshToken(token);

      res.cookie('refreshToken', data.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({
        success: true,
        message: 'Token refreshed',
        data: { accessToken: data.tokens.accessToken }
      });
    } catch (error) {
      next(error);
    }
  }

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
          bio: updatedUser.bio
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      res.status(200).json({ success: true, message: 'User retrieved', data: req.user });
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
