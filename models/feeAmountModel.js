const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
    amount: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fee", feeSchema);
