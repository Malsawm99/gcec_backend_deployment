const express = require("express");
const {
  createAcademic,
  getAllAcademics,
  getSingleAcademics,
  updateAcademic,
  updateStudentAcademics,
  updateTeacherAcademics,
  academicGrade,
  getSingleRemoveAcademics,
  updateStudentRemoveAcademics,
  updateTeacherRemoveAcademics,
} = require("../controllers/academicControllers");

const router = express.Router();

router.post("/create", createAcademic);

router.get("/all", getAllAcademics);

router.get("/single/:slug", getSingleAcademics);

router.get("/singleRemove/:slug", getSingleRemoveAcademics);

router.put("/update/:slug", updateAcademic);

router.put("/updateStudent/:slug", updateStudentAcademics);

router.put("/updateRemoveStudent/:slug", updateStudentRemoveAcademics);

router.put("/updateTeacher/:slug", updateTeacherAcademics);

router.put("/updateRemoveTeacher/:slug", updateTeacherRemoveAcademics);

module.exports = router;
