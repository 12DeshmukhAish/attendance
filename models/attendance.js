
import mongoose from 'mongoose';

const AttendanceRecordSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  status: { type: String, enum: ['present', 'absent'], required: true },
}, {
  _id: false 
});

const AttendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  records: [AttendanceRecordSchema],
}, {
  timestamps: true,
});

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
