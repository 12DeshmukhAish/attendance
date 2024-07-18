import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

const ContentSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    proposedDate: {
        type: String,
    },
    completedDate: {
        type: String,
    },
    references: {
        type: String,
    },
    status: {
        type: String,
        enum: ['covered', 'not_covered'],
        default: 'not_covered'
    },
}, {
    _id: false,
});

const SubjectSchema = new mongoose.Schema({
    _id: String,
    name: {
        type: String,
        required: true
    },
    subType: {
        type: String,
        enum: ['theory', 'practical'],
        required: true
    },
    class: {
        type: String,
        ref: 'Classes'  
    },
    teacher: {
        type: String,
        ref: 'Faculty'  
    },
    department: {
        type: String
    },
    reports: {
        type: [ObjectId],
        ref: 'Attendance'
    },
    content: [ContentSchema]
}, {
    timestamps: true,
});

const Subject = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
export default Subject;
