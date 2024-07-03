import mongoose from 'mongoose';

const FacultySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  facultyId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  email: { type: String, required: true, unique: true },
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

export default mongoose.models.Faculty || mongoose.model('Faculty', FacultySchema);
