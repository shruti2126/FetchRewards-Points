/** @format */

const mongoose = require("mongoose");

const addPointsSchema = mongoose.Schema({
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

module.exports = mongoose.model("addPoints", addPointsSchema);
