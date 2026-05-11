const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: '' },
    slug: { type: String, required: true, unique: true },
    content_json: { type: Object, required: true },
    content_html: { type: String, required: true },
    status: { type: String, enum: ['DRAFT', 'PUBLISHED'], default: 'DRAFT' },
    visibility: { type: String, enum: ['PUBLIC', 'PRIVATE', 'HIDDEN'], default: 'PUBLIC' },
    reading_time: { type: Number, default: 0 },
    cover_image: { type: String, default: '' },
    is_locked: { type: Boolean, default: false },
    is_sensitive: { type: Boolean, default: false },
    tags: [{ type: String }],
    original_post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
    media: [{
      type: { type: String, enum: ['IMAGE', 'VIDEO'] },
      url: String,
      public_id: String,
      width: Number,
      height: Number,
      duration: Number,
      order_index: Number
    }]
  },
  { timestamps: true }
);

// Indexing slug for fast lookups and ensuring uniqueness
postSchema.index({ slug: 1 }, { unique: true });
// Indexing tags for fast filtering
postSchema.index({ tags: 1 });

module.exports = mongoose.model('Post', postSchema);
