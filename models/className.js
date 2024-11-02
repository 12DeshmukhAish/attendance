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
    }]
}, { _id: false });

const classSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    year: {
        type: String,
    },
    department: {
        type: String,
    },

    subjects: {
        type: {
            sem1: [{
                type: String,
                ref: 'Subject' // Assuming you have a Subject model
            }],
            sem2: [{
                type: String,
                ref: 'Subject' // Assuming you have a Subject model
            }]
        },
        required: true // Ensure subjects are required
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
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const Classes = mongoose.models.Classes || mongoose.model('Classes', classSchema);
export default Classes;
