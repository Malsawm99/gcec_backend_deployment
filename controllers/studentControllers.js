const studentModel = require("../models/studentModel");
const gradeModel = require("../models/gradeModel");
const teacherModel = require("../models/teacherModel");
const academicModel = require("../models/academicModel");
const slugify = require("slugify");
const JWT = require("jsonwebtoken");

// Login Student
exports.loginStudent = async (req, res) => {
  try {
    const { studentId, studentPassword } = req.body;
    //validation
    if (!studentId || !studentPassword) {
      return res.status(404).send({
        success: false,
        message: "Invalid User",
      });
    }

    //check Id
    const user = await studentModel.findOne({ studentId }).populate("grade");

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User is not registerd",
      });
    }

    //token
    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        _id: user._id,
        slug: user.slug,
        studentId: user.studentId,
        engName: user.engName,
        myanName: user.myanName,
        birth: user.birth,
        gender: user.gender,
        grade: user.grade,
        nationality: user.nationality,
        religion: user.religion,
        fatherName: user.fatherName,
        fatherNRC: user.fatherNRC,
        motherName: user.motherName,
        motherNRC: user.motherNRC,
        address: user.address,
        prevSchool: user.prevSchool,
        marks: user.marks,
        examProperties: user.examProperties,
        contactOne: user.contactOne,
        contactTwo: user.contactTwo,
        financeProperties: user.financeProperties,
      },

      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

// Create Student
exports.createStudent = async (req, res) => {
  try {
    const {
      studentId,
      engName,
      myanName,
      studentPassword,
      birth,
      gender,
      grade,
      nationality,
      religion,
      fatherName,
      fatherNRC,
      motherName,
      motherNRC,
      address,
      prevSchool,
      marks,
      contactOne,
      contactTwo,
      examProperties,
      financeProperties,
    } = req.body;
    //validations
    if (!studentId) {
      return res.send({ error: "studentId is Required" });
    }
    if (!engName) {
      return res.send({ message: "Name is Required" });
    }
    if (!studentPassword) {
      return res.send({ message: "Password no is Required" });
    }

    //check user
    const exisitingStudent = await studentModel.findOne({ studentId });
    //exisiting user
    if (exisitingStudent) {
      return res.status(404).send({
        success: false,
        message: "Already Register studentId, please! use another",
      });
    }

    //save
    const student = await new studentModel({
      studentId,
      engName,
      myanName,
      studentPassword,
      slug: slugify(studentId),
      birth,
      gender,
      grade,
      nationality,
      religion,
      fatherName,
      fatherNRC,
      motherName,
      motherNRC,
      address,
      prevSchool,
      marks,
      contactOne,
      contactTwo,
      examProperties,
      financeProperties,
    }).save();

    res.status(201).send({
      success: true,
      message: "Creating Student Successful",
      student,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Errro in Registeration",
      error,
    });
  }
};

// Get All Students By Paginate
exports.getAllStudents = async (req, res) => {
  try {
    // Validate and set default values for page and limit
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const skip = (page - 1) * limit;
    const total = await studentModel.countDocuments();
    const pages = Math.ceil(total / limit);

    // Check if the requested page is within range
    if (page > pages && pages !== 0) {
      return res.status(404).json({
        status: "fail",
        message: "No page found",
      });
    }

    // Query to fetch students with pagination
    let query = studentModel
      .find()
      .populate("grade")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const result = await query;

    res.status(200).json({
      status: "success",
      count: result.length,
      page,
      pages,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      status: "error",
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get All Students without paginate
exports.getStudents = async (req, res) => {
  try {
    // Fetch students and populate the grade field
    const students = await studentModel
      .find({})
      .sort({ createdAt: -1 })
      .populate("grade");

    // If no students are found, return a 404 status code
    if (!students || students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found",
      });
    }

    // Send the response with the students data
    res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);

    // Send a 500 status code for server errors
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to fetch students",
      error: error.message,
    });
  }
};

// Get Single Student By Slug
exports.getSingleStudent = async (req, res) => {
  try {
    // Fetch the student based on the provided ID
    const student = await studentModel
      .findOne({ studentId: req.params.slug }) // Change from slug to studentId
      .populate({
        path: "grade",
        model: "Grade",
        populate: {
          path: "teacherProperties.teachers",
          model: "Teacher",
        },
      });

    // Check if the student is found
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Send the student data
    res.status(200).json({
      success: true,
      message: "Student fetched successfully",
      student,
    });
  } catch (error) {
    console.error("Error fetching single student:", error);

    // Send a 500 status code for server errors
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to fetch student",
      error: error.message,
    });
  }
};

// Get Single Student By Id
exports.getSingleStudentId = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    // Fetch the student based on the provided ID
    const student = await studentModel.findById(id).populate("grade");

    // Check if the student is found
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Send the student data
    res.status(200).json({
      success: true,
      message: "Student fetched successfully",
      student,
    });
  } catch (error) {
    console.error("Error fetching single student by ID:", error);

    // Send a 500 status code for server errors
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to fetch student",
      error: error.message,
    });
  }
};

// Update Basic Student info
exports.singleUpdateStudent = async (req, res) => {
  try {
    const { slug } = req.params;

    // Check if slug is provided
    if (!slug) {
      return res.status(400).json({ message: "Slug is required" });
    }

    // Find the student by slug
    const student = await studentModel.findOne({ slug });

    // Check if student exists
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Destructure request body
    const {
      studentId,
      engName,
      myanName,
      studentPassword,
      birth,
      gender,
      grade,
      nationality,
      religion,
      fatherName,
      fatherNRC,
      motherName,
      motherNRC,
      address,
      prevSchool,
      marks,
      contactOne,
      contactTwo,
      examProperties,
      financeProperties,
    } = req.body;

    // Update student properties
    if (studentId) {
      student.studentId = studentId;
      student.slug = slugify(studentId); // Update slug when name is updated
    }
    student.engName = engName || student.engName;
    student.myanName = myanName || student.myanName;
    student.studentPassword = studentPassword || student.studentPassword;
    student.birth = birth || student.birth;
    student.gender = gender || student.gender;
    student.grade = grade || student.grade;
    student.nationality = nationality || student.nationality;
    student.religion = religion || student.religion;
    student.fatherName = fatherName || student.fatherName;
    student.fatherNRC = fatherNRC || student.fatherNRC;
    student.motherName = motherName || student.motherName;
    student.motherNRC = motherNRC || student.motherNRC;
    student.address = address || student.address;
    student.prevSchool = prevSchool || student.prevSchool;
    student.marks = marks || student.marks;
    student.contactOne = contactOne || student.contactOne;
    student.contactTwo = contactTwo || student.contactTwo;

    // Update financeProperties if provided
    if (financeProperties) {
      student.financeProperties = financeProperties;
    }

    // Update examProperties if provided
    if (examProperties) {
      student.examProperties = examProperties;
    }

    // Save the updated student
    const updatedStudent = await student.save();

    // Send success response
    res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Error updating student:", error);

    // Send error response
    res.status(500).json({
      message: "Error updating student",
      error: error.message,
    });
  }
};

// Update Student Finance only
exports.singleUpdateFinanceStudent = async (req, res) => {
  try {
    const { slug } = req.params;
    const { financeProperties } = req.body;

    // Check if slug is provided
    if (!slug) {
      return res.status(400).json({ message: "Slug is required" });
    }

    // Find the student by slug
    const student = await studentModel.findOne({ slug });

    // Check if student exists
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Update financeProperties if provided
    if (financeProperties) {
      financeProperties.forEach((newFinance) => {
        const existingFinanceIndex = student.financeProperties.findIndex(
          (finance) => finance.year === newFinance.year
        );

        if (existingFinanceIndex !== -1) {
          // Year exists, update or add fee
          newFinance.fee.forEach((newFee) => {
            const existingFeeIndex = student.financeProperties[
              existingFinanceIndex
            ].fee.findIndex((fee) => fee.month === newFee.month);
            if (existingFeeIndex !== -1) {
              // Fee for this month exists, update it
              student.financeProperties[existingFinanceIndex].fee[
                existingFeeIndex
              ] = newFee;
            } else {
              // Fee for this month doesn't exist, add it
              student.financeProperties[existingFinanceIndex].fee.push(newFee);
            }
          });
        } else {
          // Year doesn't exist, add it
          student.financeProperties.push(newFinance);
        }
      });
    }

    // Save the updated student to the database
    const updatedStudent = await student.save();

    // Send success response
    res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Error updating finance for student:", error);

    // Send error response
    res.status(500).json({
      message: "Error updating finance for student",
      error: error.message,
    });
  }
};

// Update Delete Student Finance
exports.deleteFinanceData = async (req, res) => {
  try {
    const { slug } = req.params;
    const { year, month } = req.body;

    // Check if slug is provided
    if (!slug) {
      return res.status(400).json({ message: "Slug is required" });
    }

    // Find the student by slug
    const student = await studentModel.findOne({ slug });

    // Check if student exists
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find the finance entry for the specified year
    const financeIndex = student.financeProperties.findIndex(
      (finance) => finance.year === year
    );

    if (financeIndex === -1) {
      return res.status(404).json({ message: "Finance year not found" });
    }

    // Find the fee entry for the specified month and remove it
    const feeIndex = student.financeProperties[financeIndex].fee.findIndex(
      (fee) => fee.month === month
    );

    if (feeIndex !== -1) {
      student.financeProperties[financeIndex].fee.splice(feeIndex, 1);
    } else {
      return res.status(404).json({ message: "Fee month not found" });
    }

    // Save the updated student to the database
    const updatedStudent = await student.save();

    // Send success response
    res.status(200).json({
      message: "Finance data deleted successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Error deleting finance data for student:", error);

    // Send error response
    res.status(500).json({
      message: "Error deleting finance data for student",
      error: error.message,
    });
  }
};

// Update Student Exam only
exports.singleUpdateExam = async (req, res) => {
  try {
    const { slug } = req.params;
    const { examProperties } = req.body;

    // Check if slug is provided
    if (!slug) {
      return res.status(400).json({ message: "Slug is required" });
    }

    // Find the student by slug
    const student = await studentModel.findOne({ slug });

    // Check if student exists
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Update exam properties
    examProperties.forEach(({ year, examData }) => {
      // Find if exam property with the same year exists
      const existingExam = student.examProperties.find(
        (exam) => exam.year === year
      );

      if (existingExam) {
        // Update existing year's exam data or add new data if month does not exist
        examData.forEach(({ month, total, exams }) => {
          const existingMonthIndex = existingExam.examData.findIndex(
            (data) => data.month === month
          );
          if (existingMonthIndex !== -1) {
            // Update existing month's exam data
            existingExam.examData[existingMonthIndex].total = total;
            existingExam.examData[existingMonthIndex].exams = exams;
          } else {
            // Add new exam data for the month
            existingExam.examData.push({ month, total, exams });
          }
        });
      } else {
        // Add new exam property for the year
        student.examProperties.push({ year, examData });
      }
    });

    // Save updated student document
    await student.save();

    // Send success response
    res
      .status(200)
      .json({ message: "Exam properties updated successfully", student });
  } catch (error) {
    console.error("Error updating exam properties for student:", error);

    // Send error response
    res.status(500).json({
      message: "Error updating exam properties for student",
      error: error.message,
    });
  }
};

// get student by catgory
exports.studentGrade = async (req, res) => {
  try {
    const grade = await gradeModel.findOne({ slug: req.params.slug });
    const students = await studentModel.find({ grade }).populate("grade");
    res.status(200).send({
      success: true,
      grade,
      students,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error While Getting products",
    });
  }
};

// Only for update student-grade
exports.studentGrade = async (req, res) => {
  try {
    const grade = await gradeModel.findOne({ slug: req.params.slug });

    // Get the teacher's student properties for the requested grade
    const teacher = await teacherModel.findOne({
      "studentProperties.grade": grade._id,
      slug: req.params.teacherSlug, // Assuming you have a parameter for teacher's slug
    });

    // If teacher is found, retrieve the IDs of students already added by the teacher
    const addedStudentIds = teacher
      ? teacher.studentProperties
          .find(
            (property) => property.grade.toString() === grade._id.toString()
          )
          .students.map((student) => student.toString())
      : [];

    // Find students for the requested grade excluding those already added by the teacher
    const students = await studentModel
      .find({ grade, _id: { $nin: addedStudentIds } })
      .populate("grade");

    res.status(200).send({
      success: true,
      grade,
      students,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error While Getting products",
    });
  }
};

// Get All Students by Grades and paginate
exports.getAllPaginateStudent = async (req, res) => {
  try {
    const grade = await gradeModel.findOne({ slug: req.params.slug });

    const page = parseInt(req.query.page) || 1;
    const pageSize = 5; // You can adjust the page size as needed
    const skip = (page - 1) * pageSize;

    const students = await studentModel
      .find({ grade })
      .populate("grade")
      .skip(skip)
      .limit(pageSize);

    const total = await studentModel.countDocuments({ grade });
    const pages = Math.ceil(total / pageSize);

    res.status(200).send({
      success: true,
      grade,
      students,
      pages,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error While Getting products",
    });
  }
};

// Search for Students
exports.searchStudent = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await studentModel
      .find({
        $or: [
          { engName: { $regex: keyword, $options: "i" } },
          { studentId: { $regex: keyword, $options: "i" } },
        ],
      })
      .populate("grade");
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: "Error Searching Data",
    });
  }
};

// Delete All Student ref
exports.studentSingleDelete = async (req, res) => {
  try {
    const deletedStudent = await studentModel.findOneAndDelete({
      studentId: req.params.slug,
    });

    if (deletedStudent) {
      const updateOperations = [];

      // Check if the fields exist before updating
      const academicFieldsExist = await academicModel.exists({
        "studentProperties.students": deletedStudent._id,
      });

      const teacherFieldsExist = await teacherModel.exists({
        "studentProperties.students": deletedStudent._id,
      });

      const gradeFieldsExist = await gradeModel.exists({
        "classStudentProperties.students": deletedStudent._id,
      });

      if (academicFieldsExist) {
        updateOperations.push(
          academicModel.updateMany(
            {},
            { $pull: { "studentProperties.$[].students": deletedStudent._id } }
          )
        );
      }

      if (teacherFieldsExist) {
        updateOperations.push(
          teacherModel.updateMany(
            {},
            { $pull: { "studentProperties.$[].students": deletedStudent._id } }
          )
        );
      }

      if (gradeFieldsExist) {
        updateOperations.push(
          gradeModel.updateMany(
            {},
            {
              $pull: {
                "classStudentProperties.$[].students": deletedStudent._id,
              },
            }
          )
        );
      }

      await Promise.all(updateOperations);

      res.json({ message: "Student deleted successfully." });
    } else {
      res.status(404).json({ message: "Student not found." });
    }
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
