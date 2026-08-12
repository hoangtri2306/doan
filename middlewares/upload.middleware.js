const multer = require('multer');

// Use memory storage to upload buffer directly to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const isImage = file.mimetype.startsWith('image/');
  const isVideo = file.mimetype.startsWith('video/');
  if (!isImage && !isVideo) {
    return cb(new Error('Invalid file type. Only images and videos are allowed!'), false);
  }
  // BUG-013: chặn SVG (vector chứa script → stored XSS khi serve từ /uploads)
  if (file.mimetype === 'image/svg+xml') {
    return cb(new Error('SVG files are not allowed'), false);
  }
  cb(null, true);
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max limit
  }
});

module.exports = upload;
