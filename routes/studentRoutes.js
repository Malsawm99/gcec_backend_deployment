const express = require("express");
const {
  createStudent,
  getAllStudents,
  getSingleStudent,
  singleUpdateStudent,
  loginStudent,
  studentGrade,
  searchStudent,
  getAllPaginateStudent,
  getStudents,
  getSingleStudentId,
  singleUpdateExam,
  studentSingleDelete,
  singleUpdateFinanceStudent,
  deleteFinanceData,
} = require("../controllers/studentControllers");

const router = express.Router();

router.post("/loginStudent", loginStudent);

router.post("/create", createStudent);

router.get("/all", getAllStudents);

router.get("/allData", getStudents);

router.get("/single/:slug", getSingleStudent);

router.get("/singleId/:id", getSingleStudentId);

router.put("/update/:slug", singleUpdateStudent);

router.put("/updateFinance/:slug", singleUpdateFinanceStudent);

router.delete("/deleteFinance/:slug", deleteFinanceData);

router.put("/examUpdate/:slug", singleUpdateExam);

router.get("/student-grade/:slug", studentGrade);

router.get("/student-grade-paginate/:slug", getAllPaginateStudent);

router.get("/search/:keyword", searchStudent);

// Single Delet for all ref
router.delete("/delete/:slug", studentSingleDelete);

module.exports = router;
