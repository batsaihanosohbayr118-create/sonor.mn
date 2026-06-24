import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema({
  id: Number,
  cat: String,
  featured: Boolean,
  title: String,
  excerpt: String,
  author: String,
  time: String,
  image: String,
  body: [String],
  src: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Article || mongoose.model('Article', ArticleSchema);