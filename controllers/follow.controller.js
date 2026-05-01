const followService = require('../services/follow.service');

class FollowController {
  async toggleFollow(req, res, next) {
    try {
      const { following_id } = req.body;
      const result = await followService.toggleFollow(req.user.id, following_id);
      
      res.status(200).json({
        success: true,
        message: `User ${result.action}`,
        data: result.follow || null
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FollowController();
