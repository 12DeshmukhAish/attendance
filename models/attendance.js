import mongoose from 'mongoose';

// Schema for individual attendance records
const AttendanceRecordSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  records: {
    type: [AttendanceRecordSchema],
    validate: {
      validator: function(records) {
        // Ensure that at least one attendance record is provided
        return records.length > 0;
      },
      message: 'At least one attendance record is required.',
    },
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
