import mongoose from 'mongoose';
const { Schema } = mongoose;

const classSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },
  passOutYear: {
    type: String
  },
  department: {
    type: String
  },
  students: [{
    type: String,
    ref: 'Student',
  }],
  teacher: {
    type: String,
    ref: 'Teacher',
    required: true,
  }
}, { timestamps: true });

const Classes = mongoose.models.Classes || mongoose.model('Classes', classSchema);

export default Classes;
