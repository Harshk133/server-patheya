const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  linkUrl: { type: String, required: true },
}, { timestamps: true });

const Card = mongoose.model("Card", cardSchema);

module.exports = Card;
