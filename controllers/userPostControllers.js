const UserPost = require("../models/userPostModel");
const cloudinary = require("../utils/cloudinary");

exports.createUserPost = async (req, res) => {
  const { userPostTitle, userPostDescription } = req.body;
  const files = req.files;
  const imageUrls = [];
  const publicIds = [];

  try {
    if (files && files.length > 0) {
      // Upload images to Cloudinary concurrently
      const uploadPromises = files.map((file) =>
        cloudinary.uploader.upload(file.path, {
          folder: "users_preset",
        })
      );

      const cloudinaryResponses = await Promise.all(uploadPromises);

      cloudinaryResponses.forEach((response) => {
        imageUrls.push(response.secure_url);
        publicIds.push(response.public_id);
      });
    }

    const newUserPost = new UserPost({
      userPostTitle,
      userPostDescription,
      images: imageUrls.map((url, index) => ({
        url,
        public_id: publicIds[index],
      })),
    });

    await newUserPost.save();

    res.status(201).json({
      message: "User post created successfully",
      userPost: {
        id: newUserPost._id,
        userPostTitle,
        userPostDescription,
        images: imageUrls,
      },
    });
  } catch (error) {
    // If there was an error, delete the uploaded images from Cloudinary
    for (const publicId of publicIds) {
      await cloudinary.uploader.destroy(publicId);
    }
    console.error("Error creating user post:", error);
    res.status(500).json({ message: "Failed to create user post" });
  }
};

exports.getAllUserPost = async (req, res) => {
  try {
    let query = UserPost.find().sort({ createdAt: -1 });

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * pageSize;
    const total = await UserPost.countDocuments();

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

// Mobile Posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await UserPost.find({}).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.getSinglePost = async (req, res) => {
  try {
    const post = await UserPost.findById({ _id: req.params.id });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.deleteSinglePost = async (req, res) => {
  try {
    const post = await UserPost.findByIdAndDelete({ _id: req.params.id });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
};
