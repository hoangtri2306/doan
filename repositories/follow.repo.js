const Follow = require('../models/Follow');

class FollowRepository {
  async create(followData) {
    return Follow.create(followData);
  }

  async delete(follower_id, following_id) {
    return Follow.findOneAndDelete({ follower_id, following_id });
  }

  async findFollow(follower_id, following_id) {
    return Follow.findOne({ follower_id, following_id });
  }
}

module.exports = new FollowRepository();
