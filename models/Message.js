const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    trim: true,
    default: '',
    maxlength: 10000 // BUG-019
  },
  media: [{
    url: String,
    type: { type: String, enum: ['IMAGE', 'VIDEO'] }
  }],
  is_read: {
    type: Boolean,
    default: false
  },
  reactions: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    emoji: String
  }]
}, {
  timestamps: true
});

// BUG-026: phân trang tin nhắn theo conversation + thời gian
messageSchema.index({ conversation_id: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);


