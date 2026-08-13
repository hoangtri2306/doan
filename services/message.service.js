const conversationRepo = require('../repositories/conversation.repo');
const messageRepo = require('../repositories/message.repo');
const socketService = require('./socket.service');
const { httpError } = require('../utils/httpError');

class MessageService {
  async sendMessage(senderId, recipientId, content, media = []) {
    const conversation = await conversationRepo.findOrCreate([senderId, recipientId]);
    
    const message = await messageRepo.create({
      conversation_id: conversation._id,
      sender_id: senderId,
      content,
      media
    });

    await conversationRepo.updateLastMessage(conversation._id, message._id);

    // Socket emit to recipient
    socketService.sendToUser(recipientId, 'new_message', {
      conversation_id: conversation._id,
      message
    });

    return message;
  }

  async getConversations(userId) {
    return conversationRepo.findByUser(userId);
  }

  async getMessages(conversationId, userId) {
    // Check if user is part of conversation
    const conversation = await conversationRepo.findById(conversationId);
    if (!conversation) throw httpError(404, 'Conversation not found');
    
    const isParticipant = conversation.participants.some(p => p._id.toString() === userId.toString());
    if (!isParticipant) throw httpError(403, 'Unauthorized');

    await messageRepo.markAsRead(conversationId, userId);
    return messageRepo.findByConversation(conversationId);
  }

  async deleteConversation(conversationId, userId) {
    const Message = require('../models/Message');
    const Conversation = require('../models/Conversation');

    // BUG-004: chỉ chủ hội thoại mới được xóa
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw httpError(404, 'Conversation not found');
    const isParticipant = conversation.participants.some(
      p => p.toString() === userId.toString()
    );
    if (!isParticipant) throw httpError(403, 'Unauthorized');

    await Message.deleteMany({ conversation_id: conversationId });
    await Conversation.findByIdAndDelete(conversationId);
    return true;
  }

  async reactToMessage(messageId, userId, emoji) {
    const Message = require('../models/Message');
    const Conversation = require('../models/Conversation');
    const message = await Message.findById(messageId);
    if (!message) throw httpError(404, 'Message not found');

    // BUG-009: chỉ participant của hội thoại mới được react
    const conversation = await Conversation.findById(message.conversation_id);
    if (!conversation) throw httpError(404, 'Conversation not found');
    const isParticipant = conversation.participants.some(
      p => p.toString() === userId.toString()
    );
    if (!isParticipant) throw httpError(403, 'Unauthorized');

    const existingReactionIndex = message.reactions.findIndex(r => r.user_id.toString() === userId.toString());
    
    if (existingReactionIndex > -1) {
      if (message.reactions[existingReactionIndex].emoji === emoji) {
        message.reactions.splice(existingReactionIndex, 1);
      } else {
        message.reactions[existingReactionIndex].emoji = emoji;
      }
    } else {
      message.reactions.push({ user_id: userId, emoji });
    }

    await message.save();
    return message;
  }
}

module.exports = new MessageService();
