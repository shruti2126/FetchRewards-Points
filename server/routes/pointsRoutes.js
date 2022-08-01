/** @format */

/**
 * HTTP routes for adding, spending and balancing points.
 */

const express = require("express");
const router = express.Router();
const pointsController = require("../controllers/pointsController");

router.get("/api/spend", pointsController.spendPoints);
router.post("/api/add", pointsController.addPoints);
router.get("/api/balance", pointsController.balancePoints);
module.exports = router;
