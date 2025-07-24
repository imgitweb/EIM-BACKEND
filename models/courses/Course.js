import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: String,
  language: String,
  duration: String, 
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
  price: { type: Number, default: 0 },
  isFree: { type: Boolean, default: false },
  thumbnail: String, 
  instructor: String,
  description: String,
  objectives: [String],
  tags: [String],
  prerequisites: [String],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Course', CourseSchema);
