const express = require("express");
const {
  createFee,
  getAllFee,
  getSingleFeeUpdate,
  getSingleFeeDelete,
} = require("../controllers/feeControllers");

const router = express.Router();

// Create
router.post("/create", createFee);

router.get("/all", getAllFee);

router.put("/update/:id", getSingleFeeUpdate);

router.delete("/delete/:id", getSingleFeeDelete);

module.exports = router;
