const { connectMongoDB } = require("@/lib/connectDb");
const Student = require("@/models/student");
const Classes = require("@/models/className");
const mongoose = require("mongoose");

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  let session;
  try {
    await connectMongoDB();
    session = await mongoose.startSession();
    session.startTransaction();

    const { studentsToUpdate, classId } = req.body;

    const updateResults = await Promise.all(studentsToUpdate.map(async (student) => {
      const filter = { _id: student._id };
      const update = { $set: student };
      const options = { new: true, session };

      return Student.findOneAndUpdate(filter, update, options);
    }));

    // Update the class with updated students
    if (classId) {
      await Classes.findByIdAndUpdate(
        classId,
        { $addToSet: { students: { $each: updateResults.map(s => s._id) } } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    console.log("Students Updated Successfully");
    return res.status(200).json({ 
      message: "Students Updated Successfully",
      updatedStudents: updateResults
    });
  } catch (error) {
    console.error("Error updating students:", error);
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    return res.status(500).json({ error: "Failed to Update Students" });
  }
}

module.exports = handler;