const userRepository = require('../repositories/user.repo');
const User = require('../models/User');
const { invalidateStatus } = require('../utils/statusCache'); // BUG-027

// BUG-040: pagination — nhận ?page=&limit=, trả thêm meta pagination.
// Không truyền page/limit → trả toàn bộ (dashboard cần tổng số để tính stats).
// LƯU Ý: phải là function ngoài class — Express gọi handler như function thường nên `this` undefined
// (lỗi tương tự BUG-047: method extraction làm `this._paginationParams` crash 500).
function getPaginationParams(req, defaultLimit = 20, maxLimit = 100) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

class AdminController {
  async getViolations(req, res, next) {
    try {
      // Fetch all users using repository
      const users = await userRepository.findAll();
      
      // Sort by violation score descending
      users.sort((a, b) => (b.violationScore || 0) - (a.violationScore || 0));

      // Map to desired response format
      const data = users.map(u => ({
        userId: u._id.toString(),
        email: u.email,
        spamCount: u.spamCount || 0,
        toxicCount: u.toxicCount || 0,
        violationScore: u.violationScore || 0,
        status: u.status || 'ACTIVE'
      }));

      res.status(200).json({ success: true, message: 'Violations retrieved', data });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      const query = req.query.page || req.query.limit ? getPaginationParams(req) : null;
      const baseQuery = User.find().select('-password').sort({ createdAt: -1 });
      const users = query ? await baseQuery.skip(query.skip).limit(query.limit) : await baseQuery;
      const total = query ? await User.countDocuments() : undefined;
      res.status(200).json({
        success: true,
        message: 'Users retrieved',
        data: users,
        pagination: query ? { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) } : undefined
      });
    } catch (error) {
      next(error);
    }
  }

  async changeRole(req, res, next) {
    try {
      const { role } = req.body;
      // BUG-038: validate role hợp lệ trước khi đổi
      if (!['USER', 'MODERATOR', 'ADMIN'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }

      const target = await User.findById(req.params.id);
      if (!target) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // BUG-038: chặn hạ quyền admin cuối cùng (tránh mất quyền quản trị hệ thống)
      if (target.role === 'ADMIN' && role !== 'ADMIN') {
        const adminCount = await User.countDocuments({ role: 'ADMIN', isDeleted: false });
        if (adminCount <= 1) {
          return res.status(400).json({
            success: false,
            message: 'Không thể hạ quyền admin cuối cùng của hệ thống'
          });
        }
      }

      const user = await userRepository.update(req.params.id, { role });
      res.status(200).json({ success: true, message: 'Role updated', data: user });
    } catch (error) {
      next(error);
    }
  }

  async getPosts(req, res, next) {
    try {
      const Post = require('../models/Post');
      const query = req.query.page || req.query.limit ? getPaginationParams(req) : null;
      const baseQuery = Post.find()
        .populate('author', 'username email avatar')
        .sort({ createdAt: -1 });
      const posts = query ? await baseQuery.skip(query.skip).limit(query.limit) : await baseQuery;
      const total = query ? await Post.countDocuments() : undefined;
      res.status(200).json({
        success: true,
        message: 'All posts retrieved',
        data: posts,
        pagination: query ? { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) } : undefined
      });
    } catch (error) {
      next(error);
    }
  }

  async hidePost(req, res, next) {
    try {
      const Post = require('../models/Post');
      const post = await Post.findByIdAndUpdate(req.params.id, { visibility: 'HIDDEN' }, { new: true });
      res.status(200).json({ success: true, message: 'Post hidden', data: post });
    } catch (error) {
      next(error);
    }
  }

  async unhidePost(req, res, next) {
    try {
      const Post = require('../models/Post');
      const post = await Post.findByIdAndUpdate(req.params.id, { visibility: 'PUBLIC' }, { new: true });
      res.status(200).json({ success: true, message: 'Post restored', data: post });
    } catch (error) {
      next(error);
    }
  }

  async markSensitive(req, res, next) {
    try {
      const Post = require('../models/Post');
      const post = await Post.findByIdAndUpdate(req.params.id, { is_sensitive: true }, { new: true });
      res.status(200).json({ success: true, message: 'Post marked as sensitive', data: post });
    } catch (error) {
      next(error);
    }
  }

  async unmarkSensitive(req, res, next) {
    try {
      const Post = require('../models/Post');
      const post = await Post.findByIdAndUpdate(req.params.id, { is_sensitive: false }, { new: true });
      res.status(200).json({ success: true, message: 'Sensitive mark removed', data: post });
    } catch (error) {
      next(error);
    }
  }

  async getReports(req, res, next) {
    try {
      const Report = require('../models/Report');
      const Post = require('../models/Post');
      const Comment = require('../models/Comment');
      const query = req.query.page || req.query.limit ? getPaginationParams(req) : null;

      const baseQuery = Report.find({ status: 'PENDING' })
        .populate('reporter_id', 'username email')
        .sort({ createdAt: -1 });
      const reports = query ? await baseQuery.skip(query.skip).limit(query.limit) : await baseQuery;
      const total = query ? await Report.countDocuments({ status: 'PENDING' }) : undefined;

      const enrichedReports = await Promise.all(reports.map(async (report) => {
        const reportObj = report.toObject();
        if (report.target_model === 'Post') {
          const post = await Post.findById(report.target_id).select('content_html slug');
          reportObj.target_data = post;
        } else if (report.target_model === 'Comment') {
          const comment = await Comment.findById(report.target_id).select('content');
          reportObj.target_data = comment;
        }
        return reportObj;
      }));

      res.status(200).json({
        success: true,
        message: 'Reports retrieved',
        data: enrichedReports,
        pagination: query ? { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) } : undefined
      });
    } catch (error) {
      next(error);
    }
  }

  async resolveReport(req, res, next) {
    try {
      const { action } = req.body; // 'HIDE' or 'DISMISS'
      const Report = require('../models/Report');
      const Post = require('../models/Post');
      const Comment = require('../models/Comment');
      
      const report = await Report.findById(req.params.id);
      if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

      if (action === 'HIDE') {
        if (report.target_model === 'Post') {
          await Post.findByIdAndUpdate(report.target_id, { visibility: 'HIDDEN' });
        } else if (report.target_model === 'Comment') {
          // BUG-025: ẩn thay vì xóa vĩnh viễn (có thể khôi phục, không mất dữ liệu)
          await Comment.findByIdAndUpdate(report.target_id, { is_hidden: true });
        }
      } else if (action === 'MARK_SENSITIVE') {
        if (report.target_model === 'Post') {
          await Post.findByIdAndUpdate(report.target_id, { is_sensitive: true });
        } else if (report.target_model === 'Comment') {
          await Comment.findByIdAndUpdate(report.target_id, { is_sensitive: true });
        }
      }

      // Ghi audit log cho hành động kiểm duyệt
      const ModerationLog = require('../models/ModerationLog');
      await ModerationLog.create({
        moderator_id: req.user.id,
        target_id: report.target_id,
        target_model: report.target_model,
        action: action === 'HIDE' ? 'HIDE' : 'WARN',
        reason: `Resolved report ${report._id} with action ${action}`
      });

      report.status = 'RESOLVED';
      await report.save();

      res.status(200).json({ 
        success: true, 
        message: action === 'HIDE' ? 'Content hidden and report resolved' : 'Report resolved', 
        data: report 
      });
    } catch (error) {
      next(error);
    }
  }

  async muteUser(req, res, next) {
    try {
      const user = await userRepository.update(req.params.id, { status: 'MUTED' });
      invalidateStatus(req.params.id); // BUG-027: xóa cache status
      res.status(200).json({ success: true, message: 'User muted', data: user });
    } catch (error) {
      next(error);
    }
  }

  async banUser(req, res, next) {
    try {
      const user = await userRepository.update(req.params.id, { status: 'BANNED' });
      invalidateStatus(req.params.id); // BUG-027: xóa cache status
      res.status(200).json({ success: true, message: 'User banned', data: user });
    } catch (error) {
      next(error);
    }
  }

  async resetScore(req, res, next) {
    try {
      const user = await userRepository.update(req.params.id, {
        spamCount: 0,
        toxicCount: 0,
        violationScore: 0,
        status: 'ACTIVE'
      });
      invalidateStatus(req.params.id); // BUG-027: xóa cache status
      res.status(200).json({ success: true, message: 'Score reset', data: user });
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req, res, next) {
    try {
      const Post = require('../models/Post');
      const post = await Post.findByIdAndDelete(req.params.id);
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
      res.status(200).json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
