const express = require("express");
const multer = require("multer");
const {
  createUserPost,
  getAllUserPost,
  getAllPosts,
  deleteSinglePost,
  getSinglePost,
} = require("../controllers/userPostControllers");

const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({}),
});

router.post("/create", upload.array("images", 5), createUserPost);

router.get("/all", getAllUserPost);

router.get("/allMobile", getAllPosts);

router.get("/single/:id", getSinglePost);

router.delete("/delete/:id", deleteSinglePost);

module.exports = router;
