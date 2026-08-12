const Comment = require('../models/Comment');

class CommentRepository {
  async create(commentData) {
    return Comment.create(commentData);
  }

  async findById(id) {
    return Comment.findById(id);
  }

  async findByPostId(post_id, skip = 0, limit = 20) {
    // BUG-022: KHÔNG filter is_hidden — comment bị ẩn vẫn phải trả về để giữ cây
    // comment (reply của comment ẩn nếu không có cha sẽ bị đẩy lên root, cây vỡ).
    // Comment ẩn được đánh dấu và content bị che để không leak nội dung SPAM/TOXIC.
    const comments = await Comment.find({ post_id })
      .populate('author', 'username avatar')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 1 })
      .lean();

    return comments.map(c => ({
      ...c,
      // Comment bị ẩn: che nội dung, frontend sẽ hiển thị placeholder "Bình luận đã bị ẩn"
      content: c.is_hidden ? null : c.content,
      // Báo cho frontend biết comment ẩn do admin/AI (để không hiện nút trả lời)
      hiddenByModeration: c.is_hidden
    }));
  }

  async update(id, updateData) {
    return Comment.findByIdAndUpdate(id, updateData, { new: true });
  }
}

module.exports = new CommentRepository();
