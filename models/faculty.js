import mongoose from 'mongoose';

const FacultySchema = new mongoose.Schema({

  _id: 
  { 
    type: String, 
    required: true, 
    unique: true 
  },

  name: 
  { 
    type: String, 
    required: true 
  },

  department: 
  { 
    type: [String], 
    required: true 
  },
  
  email: { 
    type: String,
    required: true, 
    unique: true },
}, 
{
  timestamps: true, 
});

export default mongoose.models.Faculty || mongoose.model('Faculty', FacultySchema);
