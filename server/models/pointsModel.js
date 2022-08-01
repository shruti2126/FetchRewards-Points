/** @format */
/**
 * This is the model for the Points Schema.
 */
const mongoose = require("mongoose");

const PointsSchema = mongoose.Schema({
  payer: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    unique: true,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model("addPoints", PointsSchema);
