const Post = require('../models/Post');

class PostRepository {
  async create(postData) {
    return Post.create(postData);
  }

  async findById(id) {
    return Post.findById(id).populate('author', 'username avatar');
  }

  async findBySlug(slug) {
    return Post.findOne({ slug }).populate('author', 'username avatar');
  }

  async update(id, updateData) {
    return Post.findByIdAndUpdate(id, updateData, { new: true });
  }

  async findAll(query = {}, skip = 0, limit = 10) {
    return Post.find(query)
      .populate('author', 'username avatar')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async delete(id) {
    return Post.findByIdAndDelete(id);
  }

  async update(id, data) {
    return Post.findByIdAndUpdate(id, data, { new: true });
  }

  async findByAuthor(authorId) {
    return Post.find({ author: authorId })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });
  }
}

module.exports = new PostRepository();
