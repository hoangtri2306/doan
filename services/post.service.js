const postRepository = require('../repositories/post.repo');
const interactionRepository = require('../repositories/interaction.repo');

class PostService {
  async createPost(user_id, data) {
    // Calculate reading time (avg 200 words per minute)
    const text = data.content_html ? data.content_html.replace(/<[^>]+>/g, ' ') : '';
    const wordCount = text.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const postData = {
      ...data,
      author: user_id,
      slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
      content_json: data.content_json,
      content_html: data.content_html,
      tags: data.tags || [],
      reading_time: readingTime
    };
    return postRepository.create(postData);
  }

  async getPost(id, current_user_id = null) {
    const post = await postRepository.findById(id);
    if (!post) return null;
    
    const postObj = post.toObject();
    postObj.likesCount = await interactionRepository.countInteractions(id, 'LIKE');
    postObj.bookmarksCount = await interactionRepository.countInteractions(id, 'BOOKMARK');
    
    if (current_user_id) {
      postObj.isLiked = !!(await interactionRepository.findInteraction(current_user_id, id, 'LIKE'));
      postObj.isBookmarked = !!(await interactionRepository.findInteraction(current_user_id, id, 'BOOKMARK'));
    }
    
    return postObj;
  }

  async getPostBySlug(slug, current_user_id = null) {
    const post = await postRepository.findBySlug(slug);
    if (!post) return null;
    
    const postObj = post.toObject();
    postObj.likesCount = await interactionRepository.countInteractions(post._id, 'LIKE');
    postObj.bookmarksCount = await interactionRepository.countInteractions(post._id, 'BOOKMARK');
    
    if (current_user_id) {
      postObj.isLiked = !!(await interactionRepository.findInteraction(current_user_id, post._id, 'LIKE'));
      postObj.isBookmarked = !!(await interactionRepository.findInteraction(current_user_id, post._id, 'BOOKMARK'));
    }
    
    return postObj;
  }

  async updatePost(id, data, user_id) {
    const post = await postRepository.findById(id);
    if (!post) throw new Error('Post not found');
    if (post.author._id.toString() !== user_id.toString()) {
      throw new Error('Unauthorized to edit this post');
    }
    
    const updateData = {};
    if (data.title) updateData.title = data.title;
    if (data.content_json) updateData.content_json = data.content_json;
    if (data.content_html) {
      updateData.content_html = data.content_html;
      // Recalculate reading time
      const text = data.content_html.replace(/<[^>]+>/g, ' ');
      const wordCount = text.trim().split(/\s+/).length;
      updateData.reading_time = Math.max(1, Math.ceil(wordCount / 200));
    }
    if (data.tags) updateData.tags = data.tags;

    return postRepository.update(id, updateData);
  }

  async listPosts(query = {}, skip = 0, limit = 10, current_user_id = null) {
    const posts = await postRepository.findAll(query, skip, limit);
    return this._enrichPosts(posts, current_user_id);
  }

  async deletePost(id, user_id) {
    const post = await postRepository.findById(id);
    if (!post) throw new Error('Post not found');
    if (post.author._id.toString() !== user_id.toString()) {
      throw new Error('Unauthorized to delete this post');
    }
    return postRepository.delete(id);
  }

  async getMyPosts(user_id) {
    const posts = await postRepository.findByAuthor(user_id);
    return this._enrichPosts(posts, user_id);
  }

  async getBookmarkedPosts(user_id) {
    const Interaction = require('../models/Interaction');
    const Post = require('../models/Post');
    
    const interactions = await Interaction.find({ user_id, type: 'BOOKMARK', target_model: 'Post' }).sort({ createdAt: -1 });
    const postIds = interactions.map(i => i.target_id);
    
    const posts = await Post.find({ _id: { $in: postIds } }).populate('author', 'username avatar');
    
    // Maintain the order of bookmarks
    const postMap = posts.reduce((acc, post) => {
      acc[post._id.toString()] = post;
      return acc;
    }, {});
    
    const orderedPosts = postIds.map(id => postMap[id.toString()]).filter(Boolean);
    return this._enrichPosts(orderedPosts, user_id);
  }

  async _enrichPosts(posts, current_user_id) {
    const postIds = posts.map(p => p._id);
    const likedPostIds = current_user_id ? await interactionRepository.findUserInteractions(current_user_id, postIds, 'LIKE') : [];
    const bookmarkedPostIds = current_user_id ? await interactionRepository.findUserInteractions(current_user_id, postIds, 'BOOKMARK') : [];

    return Promise.all(posts.map(async (p) => {
      const pObj = p.toObject();
      pObj.likesCount = await interactionRepository.countInteractions(p._id, 'LIKE');
      pObj.bookmarksCount = await interactionRepository.countInteractions(p._id, 'BOOKMARK');
      pObj.isLiked = likedPostIds.includes(p._id.toString());
      pObj.isBookmarked = bookmarkedPostIds.includes(p._id.toString());
      return pObj;
    }));
  }
}

module.exports = new PostService();
