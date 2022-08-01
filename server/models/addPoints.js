/** @format */

const mongoose = require("mongoose");

const addPointsSchema = mongoose.Schema({
  payer: {
    type: String,
    required: true,
    unique: true,
  },
  points: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model("addPoints", addPointsSchema);
