// models/Student.js
import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema(
    {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    rollNumber: { type: String, required: true, unique: true },
    
    name: { type: String, required: true },
    
    currentYear: { type: Number, required: true },

}, {
    timestamps: true,
});

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
