
import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema(
    {
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

}, {
    timestamps: true,
});
export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
