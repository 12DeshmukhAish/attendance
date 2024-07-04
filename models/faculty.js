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
  password:{
    type:String
  },
  isAdmin:{
    type:Boolean
  },
  email: { 
    type: String,
    required: true, 
    unique: true },
}, 
  
{
  timestamps: true, 
});

const Faculty= mongoose.models.Faculty || mongoose.model('Faculty', FacultySchema);
export default Faculty;