/** @format */

/**
 * HTTP routes for adding, spending and balancing points.
 */

const express = require("express");
const router = express.Router();
const pointsController = require("../controllers/pointsController");

router.get("/points/spend", pointsController.spendPoints);
router.post("/points/add", pointsController.addPoints);
router.get("/points/balance", pointsController.balancePoints);
module.exports = router;
