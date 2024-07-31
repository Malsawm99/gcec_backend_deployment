const gradeModel = require("../models/gradeModel");
const slugify = require("slugify");

// Create Grade
exports.createGrade = async (req, res) => {
  try {
    const { name, subjectProperties, timeProperties } = req.body;
    //validations
    if (!name) {
      return res.send({ error: "Name is Required" });
    }

    //check user
    const exisitingGradeName = await gradeModel.findOne({ name });
    //exisiting user
    if (exisitingGradeName) {
      return res.status(404).send({
        success: false,
        message: "Already Register the name, please! use another",
      });
    }

    //save
    const grade = await new gradeModel({
      name,
      slug: slugify(name),
      subjectProperties,
      timeProperties,
    }).save();

    res.status(201).send({
      success: true,
      message: "Creating Grade Successful",
      grade,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Errro in Adding Grade",
      error,
    });
  }
};

exports.getAllGrades = async (req, res) => {
  try {
    const grades = await gradeModel.find({});
    res.status(200).send({
      success: true,
      message: "All Grade List",
      grades,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting all Grades",
    });
  }
};

exports.getSingleGrade = async (req, res) => {
  try {
    const grade = await gradeModel.findById({ _id: req.params.id });
    res.status(200).send({
      success: true,
      message: "Get Single Grade",
      grade,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting Grade",
    });
  }
};

// Get Timetable
exports.getSingleGradeSlug = async (req, res) => {
  try {
    const grade = await gradeModel
      .findOne({ slug: req.params.slug })
      .populate({
        path: "teacherProperties.teachers.teacher",
        model: "Teacher",
      })
      .populate({
        path: "classStudentProperties.students",
        model: "Student",
      });
    res.status(200).send({
      success: true,
      message: "Single Grade",
      grade,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting all users",
    });
  }
};

exports.getSingleGradePopulateSlug = async (req, res) => {
  try {
    const grade = await gradeModel.findOne({ slug: req.params.slug }).populate({
      path: "teacherProperties.teachers",
      model: "Teacher",
      populate: {
        path: "grade",
        model: "Grade",
      },
    });
    res.status(200).send({
      success: true,
      message: "Single Grade",
      grade,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting all users",
    });
  }
};

exports.getSingleGradeAddPopulateSlug = async (req, res) => {
  try {
    const grade = await gradeModel.findOne({ slug: req.params.slug }).populate({
      path: "teacherProperties.teachers.teacher",
      model: "Teacher",
      populate: {
        path: "grade",
        model: "Grade",
      },
    });
    res.status(200).send({
      success: true,
      message: "Single Grade",
      grade,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting all users",
    });
  }
};

// Update By Id
exports.updateGrade = async (req, res) => {
  try {
    const {
      name,
      timeProperties,
      timeSubjectProperties,
      subjectProperties,
      examProperties,
      classProperties,
    } = req.body;

    // Find the grade by its ID
    const grade = await gradeModel.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({ message: "Grade not found" });
    }

    // Update the grade's information
    if (name) {
      grade.name = name;
      grade.slug = slugify(name); // Update slug when name is updated
    }
    grade.subjectProperties = subjectProperties || grade.subjectProperties;
    grade.timeProperties = timeProperties || grade.timeProperties;
    grade.classProperties = classProperties || grade.classProperties;

    if (examProperties) {
      grade.examProperties = examProperties;
    }

    if (timeSubjectProperties) {
      // If timeSubjectProperties exists, merge the new data with the existing one
      timeSubjectProperties.roomData.forEach((newRoomData) => {
        const existingRoomDataIndex =
          grade.timeSubjectProperties.roomData.findIndex(
            (existingRoomData) => existingRoomData.room === newRoomData.room
          );
        if (existingRoomDataIndex !== -1) {
          grade.timeSubjectProperties.roomData[existingRoomDataIndex] =
            newRoomData;
        } else {
          grade.timeSubjectProperties.roomData.push(newRoomData);
        }
      });
    }

    // Save the updated grade to the database
    await grade.save();

    res.status(200).json({ message: "Grade updated successfully", grade });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating grade", error });
  }
};

// Update By Slug
exports.updateGradeSlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const {
      name,
      timeProperties,
      timeSubjectProperties, // Updated timeSubjectProperties data
      subjectProperties,
      examProperties,
      teacherProperties,
      classProperties,
    } = req.body;

    // Find the grade by its ID
    const grade = await gradeModel.findOne({ slug });

    if (!grade) {
      return res.status(404).json({ message: "Grade not found" });
    }

    // Update the grade's information
    grade.name = name || grade.name;
    grade.subjectProperties = subjectProperties || grade.subjectProperties;
    grade.timeProperties = timeProperties || grade.timeProperties;
    grade.teacherProperties = teacherProperties || grade.teacherProperties;
    grade.classProperties = classProperties || grade.classProperties;

    if (examProperties) {
      grade.examProperties = examProperties;
    }

    if (timeSubjectProperties) {
      // If timeSubjectProperties exists, merge the new data with the existing one
      grade.timeSubjectProperties = {
        ...grade.timeSubjectProperties,
        ...timeSubjectProperties,
      };
    }

    // Save the updated grade to the database
    await grade.save();

    res.status(200).json({ message: "Grade updated successfully", grade });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating grade", error });
  }
};

exports.updateGradeTeacher = async (req, res) => {
  const { slug } = req.params;
  let { teacherProperties } = req.body;

  try {
    let grade = await gradeModel.findOne({ slug });

    if (!grade) {
      return res.status(404).json({ message: "Grade not found" });
    }

    // Update teacherProperties for the grade
    grade.teacherProperties = teacherProperties;

    // Save the updated grade
    await grade.save();

    res
      .status(200)
      .json({ message: "Teacher properties updated successfully" });
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// controllers/gradeController.js

exports.updateGradeStudentClass = async (req, res) => {
  const { slug } = req.params;
  const { classStudentProperties } = req.body;

  try {
    let grade = await gradeModel.findOne({ slug });

    if (!grade) {
      return res.status(404).json({ message: "Grade not found" });
    }

    // Merge new class properties with existing ones
    classStudentProperties.forEach((newClass) => {
      const existingClassIndex = grade.classStudentProperties.findIndex(
        (existingClass) => existingClass.myClass === newClass.myClass
      );
      if (existingClassIndex !== -1) {
        // If the class already exists, update students list
        const existingClass = grade.classStudentProperties[existingClassIndex];
        // Replace the existing students with the new list
        existingClass.students = newClass.students;
      } else {
        // If the class does not exist, add it
        grade.classStudentProperties.push(newClass);
      }
    });

    await grade.save();

    res.status(200).json({
      message: "Class student properties updated successfully",
      grade,
    });
  } catch (error) {
    console.error("Error updating Grade:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.clearGradeData = async (req, res) => {
  try {
    const gradeId = req.params.id;

    // Find the grade by its ID
    const grade = await gradeModel.findById(gradeId);

    if (!grade) {
      return res.status(404).json({ message: "Grade not found" });
    }

    // Clear the relevant properties
    grade.timeProperties = [];
    grade.subjectProperties = [];
    grade.classProperties = [];
    grade.classStudentProperties = [];
    grade.teacherProperties = [];
    grade.examProperties = [];

    // Save the updated grade
    await grade.save();

    res.status(200).json({ message: "Grade data cleared successfully", grade });
  } catch (error) {
    console.error("Error clearing grade data:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
