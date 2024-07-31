const mongoose = require("mongoose");
const slugify = require("slugify");

const userPostSchema = new mongoose.Schema(
  {
    userPostTitle: {
      type: String,
      required: true,
    },
    userPostDescription: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    images: [
      {
        url: {
          type: String,
        },
        public_id: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

userPostSchema.pre("save", function (next) {
  this.slug = slugify(this.userPostTitle, { lower: true });
  next();
});

module.exports = mongoose.model("UserPost", userPostSchema);
