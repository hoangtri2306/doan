const notificationRepository = require('../repositories/notification.repo');

class NotificationService {
  async sendNotification(data) {
    return notificationRepository.create(data);
  }

  async getUserNotifications(user_id, skip = 0, limit = 20) {
    return notificationRepository.findByRecipientId(user_id, skip, limit);
  }

  async markAsRead(notification_id) {
    return notificationRepository.markAsRead(notification_id);
  }
}

module.exports = new NotificationService();
