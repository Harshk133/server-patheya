const express = require("express");
const router = express.Router();
const Card = require("../models/Card.model");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const { aggregateByMonth } = require("../utils/helper");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

router.get("/analysis", async (req, res) => {
  try {
    const cards = await Card.find(); // Fetch all cards
    const chartData = aggregateByMonth(cards, "createdAt");
    res.json({
      total: cards.length,
      chartData
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch card metrics" });
  }
});

router.get("/", async (req, res) => {
  try {
    const cards = await Card.find();
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }
    res.json(card);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, linkUrl } = req.body;
    const file = req.files.image;

    // Validate input
    // if (!title || !description || !linkUrl || !req.file) {
    //   return res.status(400).json({ message: "All fields are required" });
    // }
    if (!title || !description || !linkUrl) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Upload the image to Cloudinary
    const result = cloudinary.uploader.upload(
      file.tempFilePath,
      (error, result) => {
        console.log("Result from cloudinary", result);
      }
    );

    // Create a new card with the uploaded image URL
    const newCard = new Card({
      title,
      description,
      linkUrl,
      imageUrl: (await result).secure_url,
    });

    await newCard.save();
    res
      .status(201)
      .json({ message: "Card created successfully", data: newCard });
  } catch (error) {
    console.error("Error creating card:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// router.put("/:id", async (req, res) => {
//   const { imageUrl, title, description, linkUrl } = req.body;
//   try {
//     const updatedCard = await Card.findByIdAndUpdate(
//       req.params.id,
//       { imageUrl, title, description, linkUrl },
//       { new: true }
//     );
//     if (!updatedCard) {
//       return res.status(404).json({ message: "Card not found" });
//     }
//     res.json(updatedCard);
//   } catch (error) {
//     res.status(500).json({ message: "Server Error" });
//   }
// });

router.put("/:id", async (req, res) => {
    try {
      const { title, description, linkUrl } = req.body;
      const cardId = req.params.id;
      console.log("Requested Card ID:", cardId); // Debug ID
  
      // Check if the card exists
      const existingCard = await Card.findById(cardId);
      if (!existingCard) {
        return res.status(404).json({ message: "Card not found" });
      }
  
      let updatedData = { title, description, linkUrl };
  
      // Handle image update if a file is provided
      if (req.files && req.files.image) {
        const file = req.files.image;
  
        // Upload new image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(file.tempFilePath);
  
        // Add the new image URL to the updated data
        updatedData.imageUrl = uploadResult.secure_url;
  
        // Optional: Delete old image from Cloudinary if needed
        if (existingCard.imageUrl) {
          const oldImagePublicId = existingCard.imageUrl.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(oldImagePublicId);
        }
  
        // Clean up the temporary file after upload
        fs.unlinkSync(file.tempFilePath);
      }
  
      // Update card in the database
      const updatedCard = await Card.findByIdAndUpdate(
        cardId,
        { $set: updatedData },
        { new: true } // Return the updated document
      );
  
      res.status(200).json({
        message: "Card updated successfully",
        data: updatedCard,
      });
    } catch (error) {
      console.error("Error updating card:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

// router.delete("/:id", async (req, res) => {
//   try {
//     const deletedCard = await Card.findByIdAndDelete(req.params.id);
//     if (!deletedCard) {
//       return res.status(404).json({ message: "Card not found" });
//     }
//     res.status(204).send(); // No content response
//   } catch (error) {
//     res.status(500).json({ message: "Server Error" });
//   }
// });

// const Card = require("../models/Card");
// const cloudinary = require("../config/cloudinary");

router.delete("/:id", async (req, res) => {
  try {
    const cardId = req.params.id;

    // Find the card by ID
    const cardToDelete = await Card.findById(cardId);
    if (!cardToDelete) {
      return res.status(404).json({ message: "Card not found" });
    }

    // If the card has an image, delete it from Cloudinary
    if (cardToDelete.imageUrl) {
      const imagePublicId = cardToDelete.imageUrl.split("/").pop().split(".")[0];
      
      // Delete the image from Cloudinary
      await cloudinary.uploader.destroy(imagePublicId);
    }

    // Delete the card from the database
    const deletedCard = await Card.findByIdAndDelete(cardId);
    if (!deletedCard) {
      return res.status(404).json({ message: "Card not found" });
    }

    res.status(204).send(); // No content response
  } catch (error) {
    console.error("Error deleting card:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});


module.exports = router;
