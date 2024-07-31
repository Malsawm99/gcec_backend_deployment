// Grade model
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const gradeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      unique: true,
    },

    timeProperties: [{ type: Object }],

    subjectProperties: [{ type: Object }],

    classProperties: [{ type: Object }],

    classStudentProperties: [
      {
        myClass: String,
        grade: String,
        students: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
          },
        ],
      },
    ],

    timeSubjectProperties: {
      grade: String,
      roomData: [
        {
          room: String,
          daySubject: [
            {
              day: String,
              timeSubject: [
                {
                  time: String,
                  subject: String,
                },
              ],
            },
          ],
        },
      ],
    },

    teacherProperties: [
      {
        grade: String,
        teachers: [
          {
            subject: String,
            teacher: { type: Schema.Types.ObjectId, ref: "Teacher" },
          },
        ],
      },
    ],

    examProperties: [
      {
        year: String,
        month: String,
        subjects: [
          {
            name: String,
          },
        ],
      },
    ],
  },

  { timestamps: true }
);

module.exports = mongoose.model("Grade", gradeSchema);
