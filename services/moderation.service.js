const moderationRepository = require('../repositories/moderation.repo');

class ModerationService {
  async reportContent(reporter_id, data) {
    const { target_id, target_model, reason } = data;
    
    return moderationRepository.createReport({
      reporter_id,
      target_id,
      target_model,
      reason
    });
  }

  async logModerationAction(moderator_id, data) {
    const { target_id, target_model, action, reason } = data;

    return moderationRepository.createLog({
      moderator_id,
      target_id,
      target_model,
      action,
      reason
    });
  }

  async getQueue() {
    const queue = await moderationRepository.getPendingQueue();
    // Filter out items where the target content was deleted
    return queue.filter(item => item.target_id !== null);
  }

  // BUG-031: chỉ xử lý item PENDING và target còn tồn tại
  async _assertProcessable(item) {
    if (!item) throw new Error('Queue item not found');
    if (item.status !== 'PENDING') throw new Error('Queue item already reviewed');

    const model = item.target_model === 'Comment' ? require('../models/Comment') : require('../models/Post');
    const target = await model.findById(item.target_id);
    if (!target) throw new Error('Target content no longer exists');
  }

  async approve(queueId) {
    const item = await moderationRepository.findQueueItemById(queueId);
    await this._assertProcessable(item);

    if (item.target_model === 'Comment') {
      const Comment = require('../models/Comment');
      await Comment.findByIdAndUpdate(item.target_id, { is_hidden: false });
    } else if (item.target_model === 'Post') {
      const Post = require('../models/Post');
      await Post.findByIdAndUpdate(item.target_id, { visibility: 'PUBLIC' });
    }

    return moderationRepository.updateQueueItem(queueId, { status: 'REVIEWED' });
  }

  async hide(queueId) {
    const item = await moderationRepository.findQueueItemById(queueId);
    await this._assertProcessable(item);

    if (item.target_model === 'Comment') {
      const Comment = require('../models/Comment');
      await Comment.findByIdAndUpdate(item.target_id, { is_hidden: true });
    } else if (item.target_model === 'Post') {
      const Post = require('../models/Post');
      await Post.findByIdAndUpdate(item.target_id, { visibility: 'HIDDEN' });
    }

    return moderationRepository.updateQueueItem(queueId, { status: 'REVIEWED' });
  }
  async warn(queueId) {
    const item = await moderationRepository.findQueueItemById(queueId);
    await this._assertProcessable(item);

    if (item.target_model === 'Comment') {
      const Comment = require('../models/Comment');
      // Comment: đánh dấu nhạy cảm, vẫn hiện nhưng bị blur
      await Comment.findByIdAndUpdate(item.target_id, {
        is_sensitive: true,
        is_hidden: false   // không ẩn hoàn toàn
      });
    } else if (item.target_model === 'Post') {
      const Post = require('../models/Post');
      // Post: đánh dấu nhạy cảm, vẫn PUBLIC nhưng có overlay cảnh báo
      await Post.findByIdAndUpdate(item.target_id, {
        is_sensitive: true,
        visibility: 'PUBLIC'
      });
    }

    return moderationRepository.updateQueueItem(queueId, { status: 'REVIEWED' });
  }
}

module.exports = new ModerationService();
