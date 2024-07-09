import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true
    },
    rollNumber: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    passOutYear: {
        type: Number,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    department: {
        type: String
    },
    class: {
        type: String,
        ref: 'Classes'  
    },
    subjects: [{
        type: String,
        ref: 'Subject' 
    }]
}, {
    timestamps: true,
});

const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
export default Student;
