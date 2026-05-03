const notificationRepository = require('../repositories/notification.repo');

class NotificationService {
  async sendNotification(data) {
    const notification = await notificationRepository.create(data);
    const populatedNotif = await notification.populate('sender', 'username avatar');
    
    let message = 'Bạn có thông báo mới';
    if (data.type === 'LIKE') message = `${populatedNotif.sender.username} đã thích bài viết của bạn`;
    if (data.type === 'COMMENT') message = `${populatedNotif.sender.username} đã bình luận bài viết của bạn`;
    if (data.type === 'FOLLOW') message = `${populatedNotif.sender.username} đã bắt đầu theo dõi bạn`;
    if (data.type === 'REPOST') message = `${populatedNotif.sender.username} đã chia sẻ bài viết của bạn`;
    
    const socketService = require('./socket.service');
    socketService.sendNotification(data.recipient, {
      message,
      notification: populatedNotif
    });
    
    return notification;
  }

  async getUserNotifications(user_id, skip = 0, limit = 20) {
    return notificationRepository.findByRecipientId(user_id, skip, limit);
  }

  async markAsRead(notification_id) {
    return notificationRepository.markAsRead(notification_id);
  }

  async markAllAsRead(user_id) {
    return notificationRepository.markAllAsRead(user_id);
  }

  async deleteNotification(notification_id) {
    return notificationRepository.delete(notification_id);
  }
}

module.exports = new NotificationService();
