import mongoose from 'mongoose';
const { Schema } = mongoose;

const classSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  passOutYear: {
    type: String
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  }
}, { timestamps: true });

const Classes = mongoose.models.Classes || mongoose.model('Classes', classSchema);

export default Classes;
