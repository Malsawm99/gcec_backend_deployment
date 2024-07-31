const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    teacherId: {
      type: String,
    },

    name: {
      type: String,
    },

    slug: {
      type: String,
    },

    teacherPassword: {
      type: String,
    },

    birth: {
      type: String,
    },

    fatherName: {
      type: String,
    },

    fatherNRC: {
      type: String,
    },

    grade: {
      type: mongoose.ObjectId,
      ref: "Grade",
    },

    gender: {
      type: String,
    },

    religion: {
      type: String,
    },

    nationality: {
      type: String,
    },

    address: {
      type: String,
    },

    contactOne: {
      type: String,
    },

    contactTwo: {
      type: String,
    },

    financeProperties: [
      {
        year: String,
        salary: [
          {
            month: String,
            value: Number,
            bonus: Number,
            total: Number,
          },
        ],
      },
    ],

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

    homeClassStudents: [
      {
        myClass: String,
        students: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
          },
        ],
      },
    ],

    subjectProperties: [{ type: Object }],

    postProperties: [
      {
        grade: String,
        posts: [
          {
            image: {
              type: Object,
              url: {
                type: URL,
              },
              public_id: {
                type: String,
              },
            },
            title: String,
            description: String,
            createdAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],

    image: {
      type: Object,
      url: {
        type: URL,
      },

      public_id: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Teacher", teacherSchema);
