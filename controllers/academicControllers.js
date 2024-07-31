const academicModel = require("../models/academicModel");
const slugify = require("slugify");

// Creat Academic
exports.createAcademic = async (req, res) => {
  try {
    const { name } = req.body;
    //validations
    if (!name) {
      return res.send({ error: "Name is Required" });
    }

    //check user
    const exisitingAcademic = await academicModel.findOne({ name });
    //exisiting user
    if (exisitingAcademic) {
      return res.status(404).send({
        success: false,
        message: "Already Register the name, please! use another",
      });
    }

    //save
    const academic = await new academicModel({
      name,
      slug: slugify(name),
    }).save();

    res.status(201).send({
      success: true,
      message: "Creating Grade Successful",
      academic,
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

exports.getAllAcademics = async (req, res) => {
  try {
    const academics = await academicModel
      .find({})
      .sort({ createdAt: -1 })
      .populate({
        path: "studentProperties.students",
        model: "Student",
        populate: {
          path: "grade",
          model: "Grade",
        },
      });
    res.status(200).send({
      success: true,
      message: "All Academic List",
      academics,
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

exports.getSingleAcademics = async (req, res) => {
  try {
    const academic = await academicModel.findOne({ slug: req.params.slug });
    res.status(200).send({
      success: true,
      message: "Single Academic",
      academic,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting all Academics",
    });
  }
};

// Remove Single Student
exports.getSingleRemoveAcademics = async (req, res) => {
  try {
    const academic = await academicModel
      .findOne({ slug: req.params.slug })
      .populate({
        path: "studentProperties.students",
        model: "Student",
        populate: {
          path: "grade",
          model: "Grade",
        },
      })
      .populate({
        path: "teacherProperties.teachers",
        model: "Teacher",
        populate: {
          path: "grade",
          model: "Grade",
        },
      });
    res.status(200).send({
      success: true,
      message: "Single Academic",
      academic,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting all Academics",
    });
  }
};

exports.updateAcademic = async (req, res) => {
  const { slug } = req.params;
  const { name, studentProperties } = req.body;

  try {
    let academic = await academicModel.findOne({ slug });

    if (!academic) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    if (name) {
      academic.name = name;
      academic.slug = slugify(name); // Update slug when name is updated
    }
    academic.studentProperties =
      studentProperties || academic.studentProperties;

    // Save the updated teacher
    await academic.save();

    res.json({
      message: "Academic updated successfully",
      academic: {
        id: academic._id,
        name,
        studentProperties,
      },
    });
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add For Students
exports.updateStudentAcademics = async (req, res) => {
  const { slug } = req.params;
  const { studentProperties } = req.body;

  try {
    let academic = await academicModel.findOne({ slug });

    if (!academic) {
      return res.status(404).json({ message: "Academic not found" });
    }

    const studentPropertiesArray = Array.isArray(studentProperties)
      ? studentProperties
      : [studentProperties];

    studentPropertiesArray.forEach((newStudentProperty) => {
      const existingGradeIndex = academic.studentProperties.findIndex(
        (existingStudentProperty) =>
          existingStudentProperty.grade === newStudentProperty.grade
      );

      if (existingGradeIndex !== -1) {
        // Merge new students with existing students
        const existingStudents =
          academic.studentProperties[existingGradeIndex].students;
        const newStudents = newStudentProperty.students.filter(
          (student) => !existingStudents.includes(student)
        );
        academic.studentProperties[existingGradeIndex].students = [
          ...existingStudents,
          ...newStudents,
        ];
      } else {
        academic.studentProperties.push(newStudentProperty);
      }
    });

    await academic.save();

    res.json({
      message: "Academic updated successfully",
      academic: {
        id: academic._id,
        studentProperties: academic.studentProperties,
      },
    });
  } catch (error) {
    console.error("Error updating Academic:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove for Students
exports.updateStudentRemoveAcademics = async (req, res) => {
  const { slug } = req.params;
  const { studentProperties } = req.body;

  try {
    let academic = await academicModel.findOne({ slug });

    if (!academic) {
      return res.status(404).json({ message: "Academic not found" });
    }

    const studentPropertiesArray = Array.isArray(studentProperties)
      ? studentProperties
      : [studentProperties];

    studentPropertiesArray.forEach((newStudentProperty) => {
      const existingGradeIndex = academic.studentProperties.findIndex(
        (existingStudentProperty) =>
          existingStudentProperty.grade === newStudentProperty.grade
      );

      if (existingGradeIndex !== -1) {
        // Update the students for the existing grade
        academic.studentProperties[existingGradeIndex].students =
          newStudentProperty.students;
      } else {
        // If the grade does not exist, add it
        academic.studentProperties.push(newStudentProperty);
      }
    });

    await academic.save();

    res.json({
      message: "Academic updated successfully",
      academic: {
        id: academic._id,
        studentProperties: academic.studentProperties,
      },
    });
  } catch (error) {
    console.error("Error updating Academic:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add For Teachers
exports.updateTeacherAcademics = async (req, res) => {
  const { slug } = req.params;
  const { teacherProperties } = req.body;

  try {
    let academic = await academicModel.findOne({ slug });

    if (!academic) {
      return res.status(404).json({ message: "Academic not found" });
    }

    const teacherPropertiesArray = Array.isArray(teacherProperties)
      ? teacherProperties
      : [teacherProperties];

    teacherPropertiesArray.forEach((newTeacherProperty) => {
      const existingGradeIndex = academic.teacherProperties.findIndex(
        (existingTeacherProperty) =>
          existingTeacherProperty.grade === newTeacherProperty.grade
      );

      if (existingGradeIndex !== -1) {
        // Merge new students with existing students
        const existingTeachers =
          academic.teacherProperties[existingGradeIndex].teachers;
        const newTeachers = newTeacherProperty.teachers.filter(
          (teacher) => !existingTeachers.includes(teacher)
        );
        academic.teacherProperties[existingGradeIndex].teachers = [
          ...existingTeachers,
          ...newTeachers,
        ];
      } else {
        academic.teacherProperties.push(newTeacherProperty);
      }
    });

    await academic.save();

    res.json({
      message: "Academic updated successfully",
      academic: {
        id: academic._id,
        teacherProperties: academic.teacherProperties,
      },
    });
  } catch (error) {
    console.error("Error updating Academic:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove for Teachers
exports.updateTeacherRemoveAcademics = async (req, res) => {
  const { slug } = req.params;
  const { teacherProperties } = req.body;

  try {
    let academic = await academicModel.findOne({ slug });

    if (!academic) {
      return res.status(404).json({ message: "Academic not found" });
    }

    const teacherPropertiesArray = Array.isArray(teacherProperties)
      ? teacherProperties
      : [teacherProperties];

    teacherPropertiesArray.forEach((newTeacherProperty) => {
      const existingGradeIndex = academic.teacherProperties.findIndex(
        (existingTeacherProperty) =>
          existingTeacherProperty.grade === newTeacherProperty.grade
      );

      if (existingGradeIndex !== -1) {
        // Update the students for the existing grade
        academic.teacherProperties[existingGradeIndex].teachers =
          newTeacherProperty.teachers;
      } else {
        // If the grade does not exist, add it
        academic.teacherProperties.push(newTeacherProperty);
      }
    });

    await academic.save();

    res.json({
      message: "Academic updated successfully",
      academic: {
        id: academic._id,
        teacherProperties: academic.teacherProperties,
      },
    });
  } catch (error) {
    console.error("Error updating Academic:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
