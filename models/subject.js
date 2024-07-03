
import mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
}, {
  timestamps: true, 
});

export default mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
