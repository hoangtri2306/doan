const ModerationQueue = require('../models/ModerationQueue');
const ModerationLog = require('../models/ModerationLog');
const Report = require('../models/Report');

class ModerationRepository {
  async addToQueue(queueData) {
    return ModerationQueue.create(queueData);
  }

  async createLog(logData) {
    return ModerationLog.create(logData);
  }

  async getPendingQueue() {
    return ModerationQueue.find({ status: 'PENDING' })
      .populate('target_id')
      .sort({ createdAt: -1 });
  }

  async updateQueueItem(id, data) {
    return ModerationQueue.findByIdAndUpdate(id, data, { new: true });
  }

  async findQueueItemById(id) {
    return ModerationQueue.findById(id);
  }

  async createReport(reportData) {
    return Report.create(reportData);
  }
}

module.exports = new ModerationRepository();
