const Event = require("../models/calendarModel");

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const { title, start, end } = req.body;

    const event = await new Event({
      title,
      start,
      end,
    }).save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get All Event
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({});
    res.status(201).json(events);
  } catch (error) {
    res.status(400).json({ message: err.message });
  }
};

// Update Single Event
exports.updateEvent = async (req, res) => {
  try {
    const { title, start, end } = req.body;

    const event = await Event.findByIdAndUpdate({ _id: req.params.id });

    // Update the student's information
    event.title = title || event.title;
    event.start = start || event.start;
    event.end = end || event.end;

    // Save the updated student to the database
    await event.save();

    res.status(200).json({ message: "Event updated successfully", event });
  } catch (error) {
    res.status(500).json({ message: err.message });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete({ _id: req.params.id });
    res.status(201).json({ message: "Event Delete", event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
