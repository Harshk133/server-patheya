// const express = require("express");
// const Blog = require("../models/Blog.model");
const upload = require("../utils/multer");
// const router = express.Router();
// const fs = require("fs");
// const path = require("path");
const express = require("express");
const Blog = require("../models/Blog.model");
const { aggregateByMonth } = require("../utils/helper");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
})

router.get("/analysis", async (req, res) => {
  try {
    const blogs = await Blog.find(); // Fetch all blogs
    const chartData = aggregateByMonth(blogs, "createdAt");
    res.json({
      total: blogs.length,
      chartData
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch blog metrics" });
  }
});

router.post("/new", async (req, res) => {
  try {
    const { title, description, content } = req.body;
    const file = req.files.blog_cover_image;

    // upload to cloudinary
    const result = cloudinary.uploader.upload(file.tempFilePath, (error, result) => {
      console.log("Result from cloudinary", result);
    });

    console.log("the image secured url is ", (await result).secure_url);

     // Upload to Cloudinary
    //  const result = await cloudinary.uploader.upload_stream(
    //   (error, result) => {
    //     if (error) {
    //       console.error("Cloudinary Upload Error:", error);
    //       return res.status(500).json({ error: "Image upload failed" });
    //     }
    //     res.status(200).json({
    //       imageUrl: result.secure_url, // Cloudinary image URL
    //       message: "Image uploaded successfully",
    //     });
    //   }
    // ).end(file.buffer);

    // Validate input
    if (!title || !description || !content) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create a new blog (MongoDB will automatically generate `_id`)
    const newBlog = new Blog({
      title,
      description,
      content,
      coverImage: (await result).secure_url
    });

    await newBlog.save();
    console.log("Blog created:", newBlog);

    res.status(201).json({ message: "Blog created successfully", data: newBlog });
  } catch (error) {
    console.error("Error creating blog:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const { title, description, content } = req.body;
    const blogId = req.params.id;
    console.log("Requested Blog ID:", blogId); // Debug ID

    // Check if the blog exists
    const existingBlog = await Blog.findById(blogId);
    if (!existingBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    let updatedData = { title, description, content };

    // Handle image update if a file is provided
    if (req.files && req.files.image) {
      const file = req.files.image;

      // Upload new image to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(file.tempFilePath);

      // Add the new image URL to the updated data
      updatedData.coverImage = uploadResult.secure_url;

      // Optional: Delete old image from Cloudinary if needed
      if (existingBlog.coverImage) {
        const oldImagePublicId = existingBlog.coverImage.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(oldImagePublicId);
      }
    }

    // Update blog in the database
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { $set: updatedData },
      { new: true } // Return the updated document
    );

    res.status(200).json({
      message: "Blog updated successfully",
      data: updatedBlog,
    });
  } catch (error) {
    console.error("Error updating blog:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// controller to get all blogs
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ id: 1 }); // Sort by `id`
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE A BLOG
// router.delete("/:id", async (req, res) => {
//   try {
//     const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
//     if (!deletedBlog) return res.status(404).json({ message: "Blog not found" });

//     res.status(200).json({ message: "Blog deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to delete blog", error });
//   }
// });
router.delete("/:id", async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);

    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Check if the blog had an image and delete it from Cloudinary
    if (deletedBlog.image) {
      const imageId = deletedBlog.image.split('/').pop().split('.')[0]; // Extract the image ID from the URL
      await cloudinary.v2.uploader.destroy(imageId); // Delete image from Cloudinary
      console.log('Cloudinary image deleted successfully');
    }

    res.status(200).json({ message: "Blog and image deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete blog", error });
  }
});

module.exports = router;
