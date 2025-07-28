import mongoose from 'mongoose';

const ModuleSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course', 
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  order: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Module', ModuleSchema);
