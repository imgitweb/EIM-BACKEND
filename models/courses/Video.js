import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String, 
    required: true,
    enum: ['youtube', 'upload'],
  },
  videoUrl: String, 
 vimeoId: String, // For Vimeo uploads
  videoFile: String, // Path to the uploaded video file
  transcript: String,
  generateAssessment: {
    type: Boolean,
    default: false,
  },
  duration: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Video', VideoSchema);
