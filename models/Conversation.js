const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  // BUG-024: key duy nhất cho bộ participants (đã sort) — chống race tạo 2 conversation cùng 1 cặp user
  // LƯU Ý: không khai unique ở field schema — dùng partial index bên dưới,
  // vì các conversation cũ (trước BUG-024) có participant_key = null, unique thường sẽ fail khi build.
  participant_key: {
    type: String
  },
  last_message: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, {
  timestamps: true
});

// Ensure we don't have multiple conversations for the same pair of users
conversationSchema.index({ participants: 1 });

// BUG-024: partial unique index — chỉ áp dụng cho doc CÓ participant_key (doc cũ null bỏ qua),
// vẫn đảm bảo không tạo 2 conversation cùng key mới.
conversationSchema.index(
  { participant_key: 1 },
  { unique: true, partialFilterExpression: { participant_key: { $exists: true } } }
);

module.exports = mongoose.model('Conversation', conversationSchema);
