
import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema(
    {
        _id: 
        { 
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
    password:{
        type:String
      },
      department: {
        type: String
      },

}, {
    timestamps: true,
});
const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
export default Student;