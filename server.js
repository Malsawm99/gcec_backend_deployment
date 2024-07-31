const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const path = require("path");

const userRoutes = require("./routes/userRoutes");
const userPostRoutes = require("./routes/userPostRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const academicRoutes = require("./routes/academicRoutes");
const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const feeRoutes = require("./routes/feeRoutes");

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/userPost", userPostRoutes);
app.use("/api/v1/grade", gradeRoutes);
app.use("/api/v1/academic", academicRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/teacher", teacherRoutes);
app.use("/api/v1/calendar", calendarRoutes);
app.use("/api/v1/fee", feeRoutes);

// Static file
app.use(express.static(path.join(__dirname, "./client/build")));

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}, Database connected`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
