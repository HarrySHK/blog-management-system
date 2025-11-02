import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  excerpt: {
    type: String,
    trim: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  views: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,
    default: null,
  },
}, { timestamps: true });

postSchema.index({ title: 'text', content: 'text', tags: 'text' });

export const postModel = mongoose.models.posts || mongoose.model('posts', postSchema);

