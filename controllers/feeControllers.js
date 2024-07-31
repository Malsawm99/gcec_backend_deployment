const feeModel = require("../models/feeAmountModel");

// Create
exports.createFee = async (req, res) => {
  try {
    const { amount } = req.body;
    const fee = new feeModel({ amount });

    if (!amount) {
      return res.send({ error: "Name is required" });
    }

    await fee.save();

    res.status(200).json(fee);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Get All
exports.getAllFee = async (req, res) => {
  try {
    const fees = await feeModel.find({});
    res.status(200).json(fees);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Update
exports.getSingleFeeUpdate = async (req, res) => {
  try {
    const { amount } = req.body;
    const fee = await feeModel.findByIdAndUpdate(
      { _id: req.params.id },
      { amount }
    );

    res.status(200).json(fee);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Delete
exports.getSingleFeeDelete = async (req, res) => {
  try {
    const fee = await feeModel.findByIdAndDelete({ _id: req.params.id });
    res.status(200).json(fee);
  } catch (error) {
    res.status(500).json(error);
  }
};
