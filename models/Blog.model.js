const mongoose = require("mongoose");

// Define the Blog schema
const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
    },
    content: {
      type: String,
      required: true,
      minlength: 20,
    },
    coverImage: { type: String, required: true },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

// No "id" field in the schema. MongoDB uses "_id" automatically.
const Blog = mongoose.model("Blog", BlogSchema);

module.exports = Blog;
