const userModel = require("../models/userModel");
const slugify = require("slugify");
const JWT = require("jsonwebtoken");

// Create User
exports.createUser = async (req, res) => {
  try {
    const { userId, name, password, status } = req.body;
    //validations
    if (!userId) {
      return res.send({ error: "UserId is Required" });
    }
    if (!name) {
      return res.send({ message: "Name is Required" });
    }
    if (!password) {
      return res.send({ message: "Password no is Required" });
    }

    if (!status) {
      return res.send({ message: "Status is Required" });
    }

    //check user
    const exisitingUser = await userModel.findOne({ userId });
    //exisiting user
    if (exisitingUser) {
      return res.status(404).send({
        success: false,
        message: "Already Register userId, please! use another",
      });
    }

    //save
    const user = await new userModel({
      userId,
      name,
      password,
      slug: slugify(name),
      status,
    }).save();

    res.status(201).send({
      success: true,
      message: "Creating User Successful",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Errro in Registeration",
      error,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { userId, password } = req.body;
    //validation
    if (!userId || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }
    //check user
    const user = await userModel.findOne({ userId });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "UserId is not registered",
      });
    }

    const userPassword = await userModel.findOne({ password });
    if (!userPassword) {
      return res.status(404).send({
        success: false,
        message: "User Password is incorrect",
      });
    }

    //token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        _id: user._id,
        userId: user.userId,
        name: user.name,
        password: user.password,
        status: user.status,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    let query = userModel.find().sort({ createdAt: -1 });

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * pageSize;
    const total = await userModel.countDocuments();

    const pages = Math.ceil(total / pageSize);

    query = query.skip(skip).limit(pageSize);

    if (page > pages) {
      return res.status(404).json({
        status: "fail",
        message: "No page found",
      });
    }

    const result = await query;

    res.status(200).json({
      status: "success",
      count: result.length,
      page,
      pages,
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
};

exports.getSingleUser = async (req, res) => {
  try {
    const getUser = await userModel.findOne({ slug: req.params.slug });
    res.status(200).send({
      success: true,
      message: "Single User",
      getUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting all users",
    });
  }
};

exports.singleUpdateUser = async (req, res) => {
  try {
    const { slug } = req.params;
    const { userId, name, password, status } = req.body;

    // Find the student by slug
    const user = await userModel.findOne({ slug });

    if (!user) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (name) {
      user.name = name;
      user.slug = slugify(name); // Update slug when name is updated
    }

    // Update the student's information
    user.userId = userId || user.userId;
    user.name = name || user.name;
    user.password = password || user.password;
    user.status = status || user.status;

    // Save the updated student to the database
    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await userModel.findOneAndDelete({ slug: req.params.slug });
    res.status(200).send({
      success: true,
      message: "Single User",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting all users",
    });
  }
};
