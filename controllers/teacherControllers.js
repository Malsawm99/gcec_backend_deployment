const teacherModel = require("../models/teacherModel");
const academicModel = require("../models/academicModel");
const gradeModel = require("../models/gradeModel");
const cloudinary = require("../utils/cloudinary");
const slugify = require("slugify");
const JWT = require("jsonwebtoken");

// Login Teacher
exports.loginTeacher = async (req, res) => {
  try {
    const { teacherId, teacherPassword } = req.body;
    //validation
    if (!teacherId || !teacherPassword) {
      return res.status(404).send({
        success: false,
        message: "Invalid User",
      });
    }
    //check Id
    const user = await teacherModel
      .findOne({ teacherId })
      .populate("grade")
      .populate({
        path: "studentProperties.students",
        model: "Student",
        populate: {
          path: "grade", // Path to the grade field within the Student model
          model: "Grade", // The model to use for population
        }, // The model to use for population
      });

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
        image: user.image,
        teacherId: user.teacherId,
        name: user.name,
        birth: user.birth,
        gender: user.gender,
        grade: user.grade,
        nationality: user.nationality,
        religion: user.religion,
        fatherName: user.fatherName,
        fatherNRC: user.fatherNRC,
        address: user.address,
        contactOne: user.contactOne,
        contactTwo: user.contactTwo,
        studentProperties: user.studentProperties,
        financeProperties: user.financeProperties,
        subjectProperties: user.subjectProperties,
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

// Create Teacher
exports.createTeacher = async (req, res) => {
  const {
    teacherId,
    name,
    teacherPassword,
    birth,
    fatherName,
    fatherNRC,
    grade,
    gender,
    religion,
    nationality,
    address,
    contactOne,
    contactTwo,
  } = req.body;
  const { file } = req;

  let imageUrl; // Define imageUrl and publicId outside the try block
  let publicId;

  //check user
  const exisitingTeacher = await teacherModel.findOne({ teacherId });
  //exisiting user
  if (exisitingTeacher) {
    return res.status(404).send({
      success: false,
      message: "Already Register teacherId, please! use another",
    });
  }

  const newTeacher = new teacherModel({
    teacherId,
    name,
    teacherPassword,
    birth,
    slug: slugify(teacherId),
    fatherName,
    fatherNRC,
    grade,
    gender,
    religion,
    nationality,
    address,
    contactOne,
    contactTwo,
  });

  try {
    if (file) {
      const cloudinaryResponse = await cloudinary.uploader.upload(file.path, {
        folder: "teachers_preset", // Specify the folder where you want to store the image
      });
      imageUrl = cloudinaryResponse.secure_url;
      publicId = cloudinaryResponse.public_id;
      newTeacher.image = { url: imageUrl, public_id: publicId };
    }

    await newTeacher.save();

    res.json({
      message: "Teacher created successfully",
      teacher: {
        id: newTeacher._id,
        teacherId,
        name,
        teacherPassword,
        birth,
        fatherName,
        fatherNRC,
        grade,
        gender,
        religion,
        nationality,
        address,
        contactOne,
        contactTwo,
        image: imageUrl,
      },
    });
  } catch (error) {
    // If there was an error, delete the uploaded image from Cloudinary
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
    console.error("Error creating teacher:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get All Teachers By Paginate
exports.getAllTeachers = async (req, res) => {
  try {
    let query = teacherModel.find().populate("grade").sort({ createdAt: -1 });

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * pageSize;
    const total = await teacherModel.countDocuments();

    const pages = Math.ceil(total / pageSize);

    query = query.skip(skip).limit(pageSize);

    if (page > pages) {
      return res.status(404).json({
        status: "fail",
        message: "No page found",
      });
    }

    const result = await query;

    res.status(200).json({
      status: "success",
      count: result.length,
      page,
      pages,
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
};

// Get All Teachers
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await teacherModel.find({}).populate("grade");

    res.status(200).send({
      success: true,
      message: "Data fatched",
      teachers,
    });
  } catch (error) {
    console.log(error),
      res.status(500).send({
        success: false,
        message: "Error getting data",
        error,
      });
  }
};

// Get Single Teacher populate by studentProperties
exports.getPopulateTeachers = async (req, res) => {
  try {
    const teacher = await teacherModel
      .findOne({ teacherId: req.params.slug })
      .populate({
        path: "studentProperties.students",
        model: "Student",
        populate: {
          path: "grade",
          model: "Grade",
        },
      })
      .populate("grade");

    res.status(200).send({
      success: true,
      message: "Data fatched",
      teacher,
    });
  } catch (error) {
    console.log(error),
      res.status(500).send({
        success: false,
        message: "Error getting data",
        error,
      });
  }
};

// Get Single Teacher populate by studentProperties and classStudentProperties
exports.getSingleTecher = async (req, res) => {
  try {
    const teacher = await teacherModel
      .findOne({ teacherId: req.params.slug })
      .populate("grade")
      .populate({
        path: "homeClassStudents",
        populate: {
          path: "students",
          model: "Student", // Assuming 'Student' is the model name for students
        },
      })
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
      message: "Data fatched",
      teacher,
    });
  } catch (error) {
    console.log(error),
      res.status(500).send({
        success: false,
        message: "Error getting data",
        error,
      });
  }
};

// Get Single Teacher by Id
exports.getSingleIdTecher = async (req, res) => {
  try {
    const teacher = await teacherModel
      .findById({ _id: req.params.id })
      .populate("grade")
      .populate({
        path: "studentProperties.students",
        model: "Student",
        populate: {
          path: "grade",
          model: "Grade",
        },
      })
      .populate({
        path: "homeClassStudents",
        populate: {
          path: "students",
          model: "Student",
          populate: {
            path: "grade",
            model: "Grade",
          },
        },
      });

    res.status(200).send({
      success: true,
      message: "Data fatched",
      teacher,
    });
  } catch (error) {
    console.log(error),
      res.status(500).send({
        success: false,
        message: "Error getting data",
        error,
      });
  }
};

// Update Single Teacher Basic
exports.updateTeacher = async (req, res) => {
  const {
    teacherId,
    name,
    teacherPassword,
    birth,
    fatherName,
    fatherNRC,
    grade,
    gender,
    religion,
    nationality,
    address,
    contactOne,
    contactTwo,
    studentProperties,
    financeProperties,
    subjectProperties,
  } = req.body;

  const { file } = req;

  try {
    let teacher = await teacherModel.findOne({ teacherId: req.params.slug });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    if (teacherId) {
      teacher.teacherId = teacherId;
      teacher.slug = slugify(teacherId); // Update slug when name is updated
    }
    teacher.name = name;
    teacher.teacherPassword = teacherPassword;
    teacher.birth = birth;
    teacher.fatherName = fatherName;
    teacher.fatherNRC = fatherNRC;
    teacher.grade = grade;
    teacher.gender = gender;
    teacher.religion = religion;
    teacher.nationality = nationality;
    teacher.address = address;
    teacher.contactOne = contactOne;
    teacher.contactTwo = contactTwo;
    teacher.studentProperties = studentProperties;
    teacher.financeProperties = financeProperties;
    teacher.subjectProperties = subjectProperties;

    // Update image if file is provided
    if (file) {
      if (teacher.image && teacher.image.public_id) {
        // If there is a previous image, delete it from Cloudinary
        await cloudinary.uploader.destroy(teacher.image.public_id);
      }
      const { secure_url: url, public_id } = await cloudinary.uploader.upload(
        file.path,
        { folder: "teachers_preset" } // Specify the folder where you want to store the image
      );
      teacher.image = { url, public_id };
    }

    // Save the updated teacher
    await teacher.save();

    res.json({
      message: "Teacher updated successfully",
      teacher: {
        id: teacher._id,
        teacherId,
        name,
        teacherPassword,
        birth,
        fatherName,
        fatherNRC,
        grade,
        gender,
        religion,
        nationality,
        address,
        contactOne,
        contactTwo,
        image: teacher.image?.url,
        studentProperties,
        financeProperties,
        subjectProperties,
      },
    });
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Single Teacher Subject
exports.updateSubject = async (req, res) => {
  const { subjectProperties } = req.body; // expecting an array of subjects

  try {
    const teacher = await teacherModel.findOne({ teacherId: req.params.slug });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    teacher.subjectProperties = subjectProperties;

    await teacher.save();

    res.status(200).json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Single Teacher Finance or Salary
exports.updateFinanceTeacher = async (req, res) => {
  const { financeProperties } = req.body;

  try {
    // Find the teacher by slug
    let teacher = await teacherModel.findOne({ teacherId: req.params.slug });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Check if finance properties exist for the current academic year
    const existingFinance = teacher.financeProperties.find(
      (property) => property.year === financeProperties[0].year
    );

    if (existingFinance) {
      // If finance properties exist for the current year, update the salary entry for the current month
      const existingSalaryIndex = existingFinance.salary.findIndex(
        (salary) => salary.month === financeProperties[0].salary[0].month
      );

      if (existingSalaryIndex !== -1) {
        // If salary entry exists for the current month, update it
        existingFinance.salary[existingSalaryIndex] =
          financeProperties[0].salary[0];
      } else {
        // If salary entry doesn't exist for the current month, add it
        existingFinance.salary.push(financeProperties[0].salary[0]);
      }
    } else {
      // If finance properties don't exist for the current year, add them
      teacher.financeProperties.push(financeProperties[0]);
    }

    // Save the updated teacher object
    const updatedTeacher = await teacher.save();

    res.status(200).json({ teacher: updatedTeacher });
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Single Teacher teaching students
exports.updateStudentTeacher = async (req, res) => {
  let { studentProperties } = req.body;

  try {
    let teacher = await teacherModel.findOne({ teacherId: req.params.slug });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Get existing student properties
    const existingStudentProperties = teacher.studentProperties || [];

    // Ensure studentProperties is an array
    if (!Array.isArray(studentProperties)) {
      studentProperties = [studentProperties]; // Convert to array with single element
    }

    // Merge new studentProperties with existing properties by grade
    studentProperties.forEach((newProperty) => {
      const existingGradeIndex = existingStudentProperties.findIndex(
        (property) => property.grade === newProperty.grade
      );

      if (existingGradeIndex !== -1) {
        // Merge students lists without duplicates
        const existingStudents =
          existingStudentProperties[existingGradeIndex].students;
        const newStudents = newProperty.students;

        newStudents.forEach((newStudent) => {
          if (
            !existingStudents.some(
              (student) => student.toString() === newStudent.toString()
            )
          ) {
            existingStudents.push(newStudent);
          }
        });
      } else {
        // If grade does not exist, create a new entry
        existingStudentProperties.push(newProperty);
      }
    });

    // Update student properties
    teacher.studentProperties = existingStudentProperties;

    // Save the updated teacher
    await teacher.save();

    res.json({
      message: "Teacher updated successfully",
      teacher: {
        id: teacher._id,
        studentProperties: existingStudentProperties,
      },
    });
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Single Teacher Add homeclass students
exports.updateAddClassTeacher = async (req, res) => {
  const { homeClassStudents } = req.body;

  try {
    let teacher = await teacherModel.findOne({ teacherId: req.params.slug });

    if (!teacher) {
      return res.status(404).json({ message: "Academic not found" });
    }

    const teacherPropertiesArray = Array.isArray(homeClassStudents)
      ? homeClassStudents
      : [homeClassStudents];

    teacherPropertiesArray.forEach((newTeacherProperty) => {
      const existingGradeIndex = teacher.homeClassStudents.findIndex(
        (existingTeacherProperty) =>
          existingTeacherProperty.grade === newTeacherProperty.grade
      );

      if (existingGradeIndex !== -1) {
        // Merge new students with existing students
        const existingStudents =
          teacher.homeClassStudents[existingGradeIndex].students;
        const newStudents = newTeacherProperty.students.filter(
          (student) => !existingStudents.includes(student)
        );
        teacher.homeClassStudents[existingGradeIndex].students = [
          ...existingStudents,
          ...newStudents,
        ];
      } else {
        teacher.homeClassStudents.push(homeClassStudents);
      }
    });

    await teacher.save();

    res.json({
      message: "Academic updated successfully",
      teacher: {
        id: teacher._id,
        homeClassStudents: teacher.homeClassStudents,
      },
    });
  } catch (error) {
    console.error("Error updating Academic:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Single Teacher Remove homeclass students
exports.updateClassTeacher = async (req, res) => {
  try {
    const { homeClassStudents } = req.body;

    if (!homeClassStudents) {
      return res
        .status(400)
        .json({ error: "Please provide homeClassStudents data" });
    }

    let teacher = await teacherModel.findOne({ teacherId: req.params.slug });

    if (!teacher) {
      teacher = new teacherModel({ slug, homeClassStudents: [] });
    }

    const existingRoomIndex = teacher.homeClassStudents.findIndex(
      (entry) => entry.myClass === homeClassStudents.myClass
    );

    if (existingRoomIndex !== -1) {
      teacher.homeClassStudents[existingRoomIndex].students =
        homeClassStudents.students;
    } else {
      teacher.homeClassStudents.push(homeClassStudents);
    }

    await teacher.save();

    res.status(200).json(teacher);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// get student by catgory
exports.teacherGrade = async (req, res) => {
  try {
    const grade = await gradeModel.findOne({ slug: req.params.slug });
    const teachers = await teacherModel.find({ grade }).populate("grade");
    res.status(200).send({
      success: true,
      grade,
      teachers,
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

// Homework Post
exports.addHomework = async (req, res) => {
  const { grade, title, description } = req.body;
  const { file } = req;

  let imageUrl; // Define imageUrl and publicId outside the try block
  let publicId;

  try {
    // Find the teacher by teacherId
    const teacher = await teacherModel.findById({ _id: req.params.id });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    if (file) {
      // Upload image to Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(file.path, {
        folder: "teacherhHomework_preset", // Specify the folder where you want to store the image
      });
      imageUrl = cloudinaryResponse.secure_url;
      publicId = cloudinaryResponse.public_id;
    }

    const newHomework = {
      title,
      description,
      createdAt: Date.now(), // Assuming you want to set createdAt to the current date/time
    };

    if (imageUrl) {
      newHomework.image = {
        url: imageUrl,
        public_id: publicId,
      };
    }

    // Check if the grade already exists
    const gradeIndex = teacher.postProperties.findIndex(
      (post) => post.grade === grade
    );

    if (gradeIndex !== -1) {
      // Grade exists, add the new homework to the existing posts array
      teacher.postProperties[gradeIndex].posts.push(newHomework);
    } else {
      // Grade does not exist, create a new entry
      teacher.postProperties.push({ grade, posts: [newHomework] });
    }

    // Save the teacher document
    await teacher.save();

    // Return the updated teacher object
    res.json({
      message: "Homework added successfully",
      postProperties: teacher.postProperties,
    });
  } catch (error) {
    // If there was an error, delete the uploaded image from Cloudinary if it exists
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
    console.error("Error adding homework:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Homework Delete
exports.deleteHomework = async (req, res) => {
  try {
    const { gradeIndex, postIndex } = req.params;

    // Find the teacher by ID
    const teacher = await teacherModel.findById({ _id: req.params.id });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Check if the grade index and post index are valid
    if (
      gradeIndex < 0 ||
      gradeIndex >= teacher.postProperties.length ||
      postIndex < 0 ||
      postIndex >= teacher.postProperties[gradeIndex].posts.length
    ) {
      return res
        .status(404)
        .json({ message: "Invalid grade index or post index" });
    }

    // Remove the post from the specified grade index and post index
    teacher.postProperties[gradeIndex].posts.splice(postIndex, 1);

    // Save the updated teacher object
    await teacher.save();

    res.status(200).json({ message: "Homework post deleted successfully" });
  } catch (error) {
    console.error("Error deleting homework post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete All Teacher ref
exports.teacherSingleDelete = async (req, res) => {
  try {
    const deletedTeacher = await teacherModel.findByIdAndDelete(req.params.id);

    // If student was deleted, remove references from Academic collection
    if (deletedTeacher) {
      await Promise.all([
        academicModel.updateMany(
          {},
          { $pull: { "teacherProperties.$[].teachers": deletedTeacher._id } }
        ),
        gradeModel.updateMany(
          {},
          { $pull: { "teacherProperties.$[].teachers": deletedTeacher._id } }
        ),
      ]);

      // Respond with success message
      res.json({ message: "Student deleted successfully." });
    } else {
      // If student wasn't found, respond with not found status
      res.status(404).json({ message: "Student not found." });
    }
  } catch (error) {
    // Handle errors
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Search Teacher
exports.searchTeacher = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await teacherModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { teacherId: { $regex: keyword, $options: "i" } },
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

// All Clear Data
exports.clearTeacherData = async (req, res) => {
  try {
    // Find the teacher by its ID
    const teacher = await teacherModel.findOne({ teacherId: req.params.slug });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Clear the relevant properties
    teacher.studentProperties = [];
    teacher.homeClassStudents = [];
    teacher.subjectProperties = [];

    // Save the updated teacher
    await teacher.save();

    res
      .status(200)
      .json({ message: "Teacher data cleared successfully", teacher });
  } catch (error) {
    console.error("Error clearing teacher data:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// HomeClass Student Clear Data
exports.clearHomeClassTeacherData = async (req, res) => {
  try {
    // Find the teacher by its ID
    const teacher = await teacherModel.findOne({ teacherId: req.params.slug });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    teacher.homeClassStudents = [];

    // Save the updated teacher
    await teacher.save();

    res
      .status(200)
      .json({ message: "Teacher data cleared successfully", teacher });
  } catch (error) {
    console.error("Error clearing teacher data:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// StudentProperties Clear Data
exports.clearStudentPropertiesTeacherData = async (req, res) => {
  try {
    // Find the teacher by its ID
    const teacher = await teacherModel.findOne({ teacherId: req.params.slug });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    teacher.studentProperties = [];

    // Save the updated teacher
    await teacher.save();

    res
      .status(200)
      .json({ message: "Teacher data cleared successfully", teacher });
  } catch (error) {
    console.error("Error clearing teacher data:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
