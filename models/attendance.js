import mongoose from 'mongoose';

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
    _id: false,
});

const AttendanceSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now,
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

AttendanceSchema.index({ date: 1, subject: 1, session: 1 }, { unique: true });

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
export default Attendance;
