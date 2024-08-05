import mongoose from 'mongoose';
import Classes from '@/models/className';
import Subject from '@/models/subject';
import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/connectDb';

async function toggleClassActiveStatus(classId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find the current class
        const currentClass = await Classes.findById(classId).session(session);

        if (!currentClass) {
            throw new Error("Class not found");
        }

        // Toggle the isActive status
        const newActiveStatus = !currentClass.isActive;

        // Update the class
        const updatedClass = await Classes.findByIdAndUpdate(
            classId,
            { isActive: newActiveStatus },
            { session, new: true }
        );

        // Update related subjects
        await Subject.updateMany(
            { class: classId },
            { isActive: newActiveStatus },
            { session }
        );

        if (!newActiveStatus) {
            // If deactivating, remove inactive subjects from the class
            const inactiveSubjects = await Subject.find({ class: classId }, '_id', { session });
            const inactiveSubjectIds = inactiveSubjects.map(subject => subject._id);

            await Classes.findByIdAndUpdate(
                classId,
                { $pull: { subjects: { $in: inactiveSubjectIds } } },
                { session }
            );
        } else {
            // If activating, add all subjects back to the class
            const allSubjects = await Subject.find({ class: classId }, '_id', { session });
            const allSubjectIds = allSubjects.map(subject => subject._id);

            await Classes.findByIdAndUpdate(
                classId,
                { $addToSet: { subjects: { $each: allSubjectIds } } },
                { session }
            );
        }

        await session.commitTransaction();
        session.endSession();

        return updatedClass;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
}

export async function POST(req) {
    try {
        const { classId } = await req.json();
        await connectMongoDB();
        const updatedClass = await toggleClassActiveStatus(classId);
        console.log('Class status toggled successfully:', updatedClass);
        return NextResponse.json({
            message: `Class ${updatedClass.isActive ? 'activated' : 'deactivated'} successfully`,
            updatedClass
        });
    } catch (error) {
        console.error('Error toggling class status:', error);
        return NextResponse.json({ error: 'Error toggling class status', details: error.message }, { status: 500 });
    }
}