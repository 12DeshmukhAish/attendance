import mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema({
  _id:String,
  name: { type: String, required: true },
  class: { type:String },
  teacher: { type: String},
  department: {
    type: String
  },
  content: [String]
}, {
  timestamps: true, 
});

const Subject = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
export default Subject;