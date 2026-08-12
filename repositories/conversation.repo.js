const Conversation = require('../models/Conversation');

class ConversationRepository {
  /**
   * BUG-024: dùng participant_key (unique index) chống race condition.
   * Khi 2 request đồng thời tạo conversation cùng 1 cặp user, một trong hai
   * sẽ vấp duplicate key (E11000) → bắt lại và trả conversation đã tồn tại.
   */
  _participantKey(participants) {
    // Sort string IDs để key ổn định bất kể thứ tự truyền vào
    return [...participants]
      .map(String)
      .sort()
      .join(':');
  }

  async findOrCreate(participants) {
    const sortedParticipants = [...participants].map(String).sort();
    const participant_key = this._participantKey(sortedParticipants);

    // Tìm theo key mới; fallback theo participants array cho conversation cũ (trước BUG-024)
    let conversation = await Conversation.findOne({ participant_key });
    if (!conversation) {
      conversation = await Conversation.findOne({
        participants: { $all: sortedParticipants, $size: sortedParticipants.length }
      });
      // Backfill participant_key cho conversation cũ để lần sau khớp nhanh.
      // Nếu môi trường còn 2 conversation cũ trùng (chưa dedupe), backfill thứ 2
      // sẽ vấp E11000 — bắt và trả conversation đã tồn tại thay vì 500 (review S4).
      if (conversation && !conversation.participant_key) {
        try {
          await Conversation.updateOne(
            { _id: conversation._id },
            { $set: { participant_key } }
          );
        } catch (err) {
          if (err.code === 11000) {
            conversation = await Conversation.findOne({ participant_key });
            if (conversation) return conversation;
          }
          throw err;
        }
      }
    }
    if (conversation) return conversation;

    try {
      conversation = await Conversation.create({
        participants: sortedParticipants,
        participant_key
      });
    } catch (err) {
      // Duplicate key (E11000): request khác vừa tạo xong → trả conversation đó
      if (err.code === 11000) {
        conversation = await Conversation.findOne({ participant_key });
        if (conversation) return conversation;
      }
      throw err;
    }

    return conversation;
  }

  async findByUser(userId) {
    return Conversation.find({ participants: userId })
      .populate('participants', 'username avatar')
      .populate('last_message')
      .sort({ updatedAt: -1 });
  }

  async findById(id) {
    return Conversation.findById(id).populate('participants', 'username avatar');
  }

  async updateLastMessage(id, messageId) {
    return Conversation.findByIdAndUpdate(id, { 
      last_message: messageId,
      updatedAt: new Date()
    }, { new: true });
  }
}

module.exports = new ConversationRepository();
