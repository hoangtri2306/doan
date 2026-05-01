const interactionRepository = require('../repositories/interaction.repo');
const notificationService = require('./notification.service');

class InteractionService {
  async interact(user_id, target_id, target_model, type) {
    const existing = await interactionRepository.findInteraction(user_id, target_id, type);
    
    if (existing) {
      // Toggle off (e.g. unlike)
      await interactionRepository.delete(user_id, target_id, type);
      return { success: true, action: 'removed' };
    } else {
      // Toggle on
      const interaction = await interactionRepository.create({
        user_id, target_id, target_model, type
      });

      // Notification logic can be triggered here if needed
      // await notificationService.sendNotification(...)

      return { success: true, action: 'added', interaction };
    }
  }

  async addBookmark(user_id, post_id) {
    const existing = await interactionRepository.findInteraction(user_id, post_id, 'BOOKMARK');
    if (existing) return { success: true, action: 'already_saved' };

    const interaction = await interactionRepository.create({
      user_id,
      target_id: post_id,
      target_model: 'Post',
      type: 'BOOKMARK'
    });
    return { success: true, action: 'added', interaction };
  }

  async removeBookmark(user_id, post_id) {
    await interactionRepository.delete(user_id, post_id, 'BOOKMARK');
    return { success: true, action: 'removed' };
  }
}

module.exports = new InteractionService();
