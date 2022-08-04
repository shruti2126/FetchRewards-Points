/** @format */

require("../db");

const pointsModel = require("../models/pointsModel.js");

/**
 * POST request to add points (i.e create docs for each transaction in database)
 *
 * @param {*} req
 * @param {*} res
 * @return {JSON} sends a JSON object for each doc converted to json format as respnse
 */
exports.addPoints = async (req, res) => {
  try {
    if (req.body.length > 1) {
      let response = [];
      req.body.forEach(async (element) => {
        const doc = await pointsModel.create({
          payer: element.payer,
          points: element.points,
          timestamp: element.timestamp,
        });
        doc.save();
      });
      res.send("Transactions added to database");
    } else {
      const doc = await pointsModel.create({
        payer: req.body.payer,
        points: req.body.points,
        timestamp: req.body.timestamp,
      });
      doc.save();
      res.json(doc);
    }
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error in add points -> " + error.message });
    console.log(error.message);
  }
};

/**
 * GET request to spend requested number of points
 *
 * @param {*} req
 * @param {*} res
 * @return {JSON} sends response of json objects received from spend() function
 */
exports.spendPoints = async (req, res) => {
  try {
    const pointsToSpend = req.body.points;
    const docs = await pointsModel.find({}).sort("timestamp");
    let pointsDeducted = await spend(pointsToSpend, docs);
    res.json(pointsDeducted);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error in Spend points -> " + error.message });
  }
};

/**
 * Deducts given points and Returns an array of objects containing information about how
 * much was deducted from reward points from which payers.
 *
 * @param {Number} pointsToSpend The amount of points to spend from user's account.
 * @param {Array} docs Array of current transactions sorted by timestamp (ascending).
 * @return {Array} An array of Json Objects {"payer" :,  "points": } displaying subtracted amount from payers.
 */
async function spend(pointsToSpend, docs) {
  var afterSpending = {};
  var i = 0;
  while (pointsToSpend > 0 && i < docs.length) {
    let id = docs[i]._id;
    //Store original points in doc for use later in the function because
    //value of docs[i].points changes in while loop
    var pointsAvailable = docs[i].points;
    //If doc points >= pointsToSpend, subtract all points from doc points
    if (docs[i].points >= pointsToSpend) {
      afterSpending[docs[i].payer] = -1 * pointsToSpend;
      docs[i].points -= pointsToSpend;
    } else if (docs[i].points < pointsToSpend) {
      // if doc points < pointsToSpend, all doc points are used up
      if (afterSpending[docs[i].payer] !== undefined) {
        afterSpending[docs[i].payer] -= docs[i].points;
      } else {
        afterSpending[docs[i].payer] = -1 * docs[i].points;
      }
      docs[i].points = 0;
      console.log("points in doc = ", docs[i].points);
    }
    await updateDoc(docs[i].points, id);
    //updating remaining points for spending
    pointsToSpend = pointsToSpend - pointsAvailable;
    i++;
  }

  if (Object.keys(afterSpending).length == 0) {
    return [];
  }
  let pointsDeducted = [];
  for (const [key, value] of Object.entries(afterSpending)) {
    pointsDeducted.push({ payer: key, points: value });
  }

  return pointsDeducted;
}

/**
 * Updates points field of documents with given id
 *
 * @param {Number} points New points after deductions
 * @param {_id} id id of the document
 */
async function updateDoc(points, id) {
  const doc = await pointsModel.findById(id);
  doc.points = points;
  await doc.save();
}

/**
 * GET request to balance points after spending points
 *
 * @param {*} req
 * @param {*} res
 */
exports.balancePoints = async (req, res) => {
  try {
    var grouped = await balance();
    res.json(grouped);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error in balance points -> " + error.message });
    console.log(error.message);
  }
};

/**
 * Groups all documents based on field "payer" and sums "points" for each aggregation.
 *
 * @returns {Object} a dictionary of key-value pairs of payer (key) and remaining points (value)
 *                  based on the aggregation.
 */
async function balance() {
  let balancedOutput = {};
  const grouped = await pointsModel.aggregate([
    {
      $group: {
        _id: "$payer",
        points: { $sum: "$points" },
      },
    },
  ]);
  grouped.forEach((element) => {
    balancedOutput[element._id] = element.points;
  });
  return balancedOutput;
}
