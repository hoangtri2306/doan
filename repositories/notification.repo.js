const Notification = require('../models/Notification');

class NotificationRepository {
  async create(notificationData) {
    return Notification.create(notificationData);
  }

  async findByRecipientId(recipient, skip = 0, limit = 20) {
    return Notification.find({ recipient })
      .populate('sender', 'username avatar')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  // BUG-008: luôn kèm recipient để chống IDOR
  async markAsRead(id, recipient) {
    return Notification.findOneAndUpdate(
      { _id: id, recipient },
      { is_read: true },
      { new: true }
    );
  }

  async markAllAsRead(recipient) {
    return Notification.updateMany({ recipient }, { is_read: true });
  }

  async delete(id, recipient) {
    return Notification.findOneAndDelete({ _id: id, recipient });
  }
}

module.exports = new NotificationRepository();
