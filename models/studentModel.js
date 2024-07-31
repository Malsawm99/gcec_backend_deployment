const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
    },

    engName: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      unique: true,
    },

    myanName: {
      type: String,
    },

    studentPassword: {
      type: String,
      required: true,
    },

    birth: {
      type: String,
    },

    gender: {
      type: String,
    },

    grade: {
      type: mongoose.ObjectId,
      ref: "Grade",
    },

    nationality: {
      type: String,
    },

    religion: {
      type: String,
    },

    fatherName: {
      type: String,
    },

    fatherNRC: {
      type: String,
    },

    motherName: {
      type: String,
    },

    motherNRC: {
      type: String,
    },

    address: {
      type: String,
    },

    prevSchool: {
      type: String,
    },

    marks: {
      type: String,
    },

    contactOne: {
      type: String,
    },

    contactTwo: {
      type: String,
    },

    examProperties: [
      {
        year: String,
        examData: [
          {
            month: String,
            total: Number,
            exams: [
              {
                name: String,
                value: Number,
              },
            ],
          },
        ],
      },
    ],

    financeProperties: [
      {
        year: String,
        fee: [
          {
            month: String,
            value: Number,
            remain: Number,
            date: String,
            status: String,
            paidBy: String,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
