import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['not_covered', 'covered', 'in_progress'],
    default: 'not_covered',
  },
});

const SubjectSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    unique: true,
  },
  content: [ContentSchema],
}, {
  timestamps: true,
});

const Subject = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
export default Subject;
