import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import Classes from './className';

const BatchStatusSchema = new mongoose.Schema({
    batchId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['covered', 'not_covered'],
        default: 'not_covered'
    },
    completedDate: {
        type: String
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
    completedDate: {
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
    status: {
        type: String,
        enum: ['covered', 'not_covered'],
        default: 'not_covered'
    },
    batchStatus: {
        type: [BatchStatusSchema],
        default: undefined,
        validate: {
            validator: function(v) {
                if (!this || !this.parent || !this.parent().parent) return true;
                const subject = this.parent().parent();
                return subject.subType !== 'practical' || Array.isArray(v);
            },
            message: 'Batch status is required for practical subjects'
        }
    }
}, {
    _id: true,
});

const TGSessionSchema = new mongoose.Schema({
    date: {
        type: String,
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
            validator: function(v) {
                if (!this || typeof this.subType === 'undefined') return true;
                return this.subType !== 'tg' || (v === undefined || v.length === 0);
            },
            message: 'Content should be empty for TG subjects'
        }
    },

    tgSessions: {
        type: [TGSessionSchema],
        default: undefined,
        validate: {
            validator: function(v) {
                if (!this || typeof this.subType === 'undefined') return true;
                return this.subType === 'tg' || (v === undefined || v.length === 0);
            },
            message: 'TG sessions should only be present for TG subjects'
        }
    },
    
    sem: {
        type: String,
        enum: ['sem1', 'sem2'],
        required: true
    },
    academicYear: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
});

const Subject = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
export default Subject;