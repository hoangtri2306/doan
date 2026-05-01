const notificationService = require('../services/notification.service');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const { skip, limit } = req.query;
      const notifications = await notificationService.getUserNotifications(req.user.id, Number(skip) || 0, Number(limit) || 20);
      
      res.status(200).json({
        success: true,
        message: 'Notifications retrieved',
        data: notifications
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: notification
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
