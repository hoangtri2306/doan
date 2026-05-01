const mongoose = require('mongoose');
const Report = require('./models/Report');
require('dotenv').config();

async function checkReports() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/blog-platform');
  const reports = await Report.find().populate('reporter_id');
  console.log('Total Reports:', reports.length);
  reports.forEach(r => {
    console.log(`- ID: ${r._id}, Target: ${r.target_id}, Status: ${r.status}, Reason: ${r.reason}`);
  });
  process.exit();
}

checkReports();
