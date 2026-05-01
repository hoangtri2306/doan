const postService = require('../services/post.service');

class PostController {
  async createPost(req, res, next) {
    try {
      const post = await postService.createPost(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: post
      });
    } catch (error) {
      next(error);
    }
  }

  async getPost(req, res, next) {
    try {
      const post = await postService.getPost(req.params.id, req.user?.id);
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found', data: null });
      }
      res.status(200).json({ success: true, message: 'Post retrieved', data: post });
    } catch (error) {
      next(error);
    }
  }

  async getPostBySlug(req, res, next) {
    try {
      const post = await postService.getPostBySlug(req.params.slug, req.user?.id);
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found', data: null });
      }
      res.status(200).json({ success: true, message: 'Post retrieved', data: post });
    } catch (error) {
      next(error);
    }
  }

  async listPosts(req, res, next) {
    try {
      const { skip, limit, tag } = req.query;
      const query = { visibility: 'PUBLIC' };
      if (tag) {
        query.tags = tag;
      }
      const posts = await postService.listPosts(query, Number(skip) || 0, Number(limit) || 10, req.user?.id);
      res.status(200).json({ success: true, message: 'Posts retrieved', data: posts });
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req, res, next) {
    try {
      await postService.deletePost(req.params.id, req.user.id);
      res.status(200).json({ success: true, message: 'Post deleted successfully', data: null });
    } catch (error) {
      next(error);
    }
  }

  async updatePost(req, res, next) {
    try {
      const post = await postService.updatePost(req.params.id, req.body, req.user.id);
      res.status(200).json({ success: true, message: 'Post updated successfully', data: post });
    } catch (error) {
      next(error);
    }
  }

  async getMyPosts(req, res, next) {
    try {
      const posts = await postService.getMyPosts(req.user.id);
      res.status(200).json({ success: true, message: 'User posts retrieved', data: posts });
    } catch (error) {
      next(error);
    }
  }

  async getBookmarkedPosts(req, res, next) {
    try {
      const posts = await postService.getBookmarkedPosts(req.user.id);
      res.status(200).json({ success: true, message: 'Bookmarked posts retrieved', data: posts });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PostController();
