const express = require("express");
const {
  createGrade,
  getAllGrades,
  updateGrade,
  getSingleGrade,
  getSingleGradeSlug,
  updateGradeSlug,
  updateGradeTeacher,
  getSingleGradePopulateSlug,
  getSingleGradeAddPopulateSlug,
  updateGradeStudentClass,
  clearGradeData,
} = require("../controllers/gradeControllers");

const router = express.Router();

router.post("/create", createGrade);

router.get("/all", getAllGrades);

router.get("/single/:id", getSingleGrade);

// Sluge
router.get("/singleSlug/:slug", getSingleGradeSlug);

router.get("/singlePopulateSlug/:slug", getSingleGradePopulateSlug);

router.get("/singleAddPopulateSlug/:slug", getSingleGradeAddPopulateSlug);

router.put("/update/:id", updateGrade);

router.put("/updateSlug/:slug", updateGradeSlug);

router.put("/updateTeacherSlug/:slug", updateGradeTeacher);

router.put("/updateClassStudent/:slug", updateGradeStudentClass);

router.put("/clearGradeData/:id", clearGradeData);

module.exports = router;
