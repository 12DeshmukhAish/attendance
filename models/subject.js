import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
    class: {
        type: String
    },
    teacher: {
        type: String
    },
    department: {
        type: String
    },
    subType: {
        type: String
    },
    content: [ContentSchema]
}, {
    timestamps: true,
});

const Subject = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
export default Subject;
