const authService = require('../services/auth.service');

// BUG-012: refresh token chỉ qua httpOnly cookie (sameSite lax), không trả trong body
// LƯU Ý: phải là function ngoài class — Express gọi handler như function thường nên `this` undefined
function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

class AuthController {
  async register(req, res) {
    try {
      const { user, tokens } = await authService.register(req.body);
      setRefreshCookie(res, tokens.refreshToken);
      res.status(201).json({
        success: true,
        data: {
          user,
          accessToken: tokens.accessToken
        },
        message: 'User registered successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'Email and password are required'
        });
      }

      const data = await authService.login(email, password);
      setRefreshCookie(res, data.refreshToken);
      
      res.status(200).json({
        success: true,
        data: {
          user: data.user,
          accessToken: data.accessToken
        },
        message: 'Login successful'
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async refresh(req, res) {
    try {
      // Ưu tiên cookie; giữ body làm fallback cho client cũ (sẽ bỏ sau khi chuyển đổi xong)
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ success: false, message: 'Refresh token required' });
      }

      const data = await authService.refreshToken(refreshToken);
      setRefreshCookie(res, data.refreshToken); // rotation: set cookie mới

      res.status(200).json({
        success: true,
        data: { accessToken: data.accessToken },
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();
