const express = require("express");
const {
  createEvent,
  getAllEvents,
  deleteEvent,
  updateEvent,
} = require("../controllers/calendarControllers");
const router = express.Router();

// Create events
router.post("/create", createEvent);

router.get("/all", getAllEvents);

router.put("/update/:id", updateEvent);

router.delete("/delete/:id", deleteEvent);

module.exports = router;
