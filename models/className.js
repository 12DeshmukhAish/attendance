import mongoose from 'mongoose';

const BatchSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['practical', 'TG'],
        required: true,
    },
    students: [{
        type: String,
        ref: 'Student',
    }],
}, { _id: false });

const classSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    passOutYear: {
        type: String,
    },
    year: {
        type: String,
    },
    department: {
        type: String,
    },
    subjects: {
        type: [String],
    },
    students: [{
        type: String,
        ref: 'Student',
    }],
    teacher: {
        type: String,
        ref: 'Faculty',
        required: true,
    },
    batches: {
        type: [BatchSchema],
    },
}, { timestamps: true });

const Classes = mongoose.models.Classes || mongoose.model('Classes', classSchema);
export default Classes;
