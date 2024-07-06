import mongoose from 'mongoose';

// Schema for individual attendance records
const AttendanceRecordSchema = new mongoose.Schema({
  student: {
    type: String,
    ref: 'Student',
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    required: true,
  },
}, {
  _id: false, // Prevents creation of an _id field for subdocuments
});

// Main schema for attendance
const AttendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now, // Sets default value to the current date
  },
  subject: {
    type: String,
    ref: 'Subject',
    required: true,
  },
  session: {
    type: Number,
    required: true
  },
  records: {
    type: [AttendanceRecordSchema],
    validate: {
      validator: function(records) {
        return records.length > 0;
      },
      message: 'At least one attendance record is required.',
    },
  },
}, {
  timestamps: true,
});

// Create a compound index for date, subject, and session to ensure uniqueness
AttendanceSchema.index({ date: 1, subject: 1, session: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);