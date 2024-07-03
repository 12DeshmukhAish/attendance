import mongoose from 'mongoose';
const { Schema } = mongoose;

const classSchema = new Schema({
  name: {
    type: String,
    required: true,
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

const ClassName = mongoose.models.ClassName || mongoose.model('ClassName', classSchema);

export default ClassName;
