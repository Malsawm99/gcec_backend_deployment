const express = require("express");
const {
  createTeacher,
  getAllTeachers,
  getSingleTecher,
  updateTeacher,
  loginTeacher,
  getTeachers,
  updateStudentTeacher,
  getSingleIdTecher,
  teacherGrade,
  updateFinanceTeacher,
  getPopulateTeachers,
  updateSubject,
  addHomework,
  deleteHomework,
  teacherSingleDelete,
  updateClassTeacher,
  searchTeacher,
  clearTeacherData,
  clearHomeClassTeacherData,
  clearStudentPropertiesTeacherData,
  updateAddClassTeacher,
} = require("../controllers/teacherControllers");
const multer = require("../middlewares/multer");

const router = express.Router();

router.post("/loginTeacher", loginTeacher);

router.post("/create", multer.single("image"), createTeacher);

router.get("/all", getAllTeachers);

router.get("/allData", getTeachers);

router.get("/singlePopulateData/:slug", getPopulateTeachers);

router.get("/single/:slug", getSingleTecher);

router.get("/teacher-grade/:slug", teacherGrade);

router.get("/singleId/:id", getSingleIdTecher);

router.put("/updateSubject/:slug", updateSubject);

router.put("/update/:slug", multer.single("image"), updateTeacher);

router.post("/postHomework/:id", multer.single("image"), addHomework);

router.delete("/homework/:id/homework/:gradeIndex/:postIndex", deleteHomework);

router.put("/updateStudent/:slug", updateStudentTeacher);

router.put("/update-finance/:slug", updateFinanceTeacher);

// Add Class Students
router.put("/update-class-add-students/:slug", updateAddClassTeacher);

// Remove Class Students
router.put("/update-class-students/:slug", updateClassTeacher);

router.delete("/delete/:id", teacherSingleDelete);

router.get("/search/:keyword", searchTeacher);

router.put("/clear/:slug", clearTeacherData);

router.put("/clearHomeclass/:slug", clearHomeClassTeacherData);

router.put("/clearStudentProperties/:slug", clearStudentPropertiesTeacherData);

module.exports = router;
