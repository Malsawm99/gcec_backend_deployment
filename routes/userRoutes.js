const express = require("express");
const {
  createUser,
  loginUser,
  getAllUsers,
  getSingleUser,
  singleUpdateUser,
  deleteUser,
} = require("../controllers/userControllers");

const router = express.Router();

router.post("/create", createUser);

router.post("/login", loginUser);

router.get("/all", getAllUsers);

router.get("/single/:slug", getSingleUser);

router.put("/update/:slug", singleUpdateUser);

router.delete("/delete/:slug", deleteUser);

module.exports = router;
