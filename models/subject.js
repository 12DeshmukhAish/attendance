import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import Classes from './className';

const BatchContentSchema = new mongoose.Schema({
    batchId: {
        type: String,
        required: true
    },
    completedDate: {
        type: String
    },
    status: {
        type: String,
        enum: ['covered', 'not_covered'],
        default: 'not_covered'
    }
}, { _id: false });

const ContentSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    proposedDate: {
        type: String,
    },
    references: {
        type: String,
    },
    courseOutcomes: {
        type: String,
    },
    programOutcomes: {
        type: String,
    },
    batchStatus: {
        type: [BatchContentSchema],
        default: undefined
    }
}, {
    _id: true,
});

const TGSessionSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    pointsDiscussed: {
        type: [String],
        default: undefined
    },
}, {
    _id: true
});

const SubjectSchema = new mongoose.Schema({
    _id: String,
    name: {
        type: String,
        required: true
    },
    subType: {
        type: String,
        enum: ['theory', 'practical', 'tg'],
        required: true
    },
    class: {
        type: String,
        ref: 'Classes'
    },
    teacher: {
        type: String,
        ref: 'Faculty'
    },
    batch: {
        type: [String]
    },
    department: {
        type: String
    },
    reports: {
        type: [ObjectId],
        ref: 'Attendance'
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    content: {
        type: [ContentSchema],
        default: undefined,
        validate: {
            validator: function (v) {
                return this.subType !== 'tg' || (v === undefined || v.length === 0);
            },
            message: props => 'Content should be empty for TG subjects'
        }
    },
    tgSessions: {
        type: [TGSessionSchema],
        default: undefined,
        validate: {
            validator: function (v) {
                return this.subType === 'tg' || (v === undefined || v.length === 0);
            },
            message: props => 'TG sessions should only be present for TG subjects'
        }
    }
}, {
    timestamps: true,
});

const Subject = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
export default Subject;