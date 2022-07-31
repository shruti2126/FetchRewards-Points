/** @format */

const express = require("express");
const router = express.Router();
const pointsController = require("../controllers/pointsController");

/**
 * App routes
 */
router.get("/api/spend", pointsController.spendPoints);
router.post("/api/add", pointsController.addPoints);
router.get("/api/balance", pointsController.balancePoints);
module.exports = router;
