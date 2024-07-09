import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    passOutYear: {
        type: String
    },
    year: {
        type: String
    },
    department: {
        type: String
    },
    subjects:{
        type:[String]
    },
    students: [{
        type: String,
        ref: 'Student',  // Ensure correct reference to Student model
    }],
    teacher: {
        type: String,
        ref: 'Faculty',  // Ensure correct reference to Faculty model
        required: true,
    }
}, { timestamps: true });

const Classes = mongoose.models.Classes || mongoose.model('Classes', classSchema);
export default Classes;
