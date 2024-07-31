const mongoose = require("mongoose");

const academicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      unique: true,
    },

    studentProperties: [
      {
        grade: String,
        students: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
          },
        ],
      },
    ],

    teacherProperties: [
      {
        grade: String,
        teachers: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Academic", academicSchema);
