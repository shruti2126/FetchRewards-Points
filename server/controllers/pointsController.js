/** @format */
const { json } = require("body-parser");
require("mongoose");
require("../models/addPoints.js");
require("../models/db");

const addPoints = require("../models/addPoints.js");

/**
 * Deducts given points and Returns an array of objects containing information about how
 * much was deducted from reward points from which payers.
 *
 * @param {Number} pointsToSpend The amount of points to spend from user's account.
 * @param {Array} results Array of current transactions sorted by timestamp (ascending).
 * @return {Array} An array of Json Objects {"payer" :,  "points": } displaying subtracted amount from payers.
 */
async function spend(pointsToSpend, results) {
  var afterSpending = {};
  var i = 0;

  while (pointsToSpend > 0) {
    let id = results[i]._id;
    var pointsAvailable = results[i].points;
    if (results[i].points >= pointsToSpend) {
      afterSpending[results[i].payer] = -1 * pointsToSpend;
      results[i].points -= pointsToSpend;
      await updateDoc(results[i].points, id);
    } else {
      if (afterSpending[results[i].payer] !== undefined) {
        afterSpending[results[i].payer] -= results[i].points;
      } else {
        afterSpending[results[i].payer] = 0 - results[i].points;
      }
      results[i].points = 0;
      await updateDoc(results[i].points, id);
    }
    pointsToSpend = pointsToSpend - pointsAvailable;
    i++;
  }

  let arrOfJsonObjs = [];
  for (const [key, value] of Object.entries(afterSpending)) {
    arrOfJsonObjs.push({ payer: key, points: value });
  }
  return arrOfJsonObjs;
}

/**
 * Updates points field of documents with given id
 *
 * @param {Number} points New points after deductions
 * @param {_id} id id of the document
 */
async function updateDoc(points, id) {
  const doc = await addPoints.findById(id);
  doc.points = points;
  await doc.save();
}

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
    const results = await addPoints.find({}).sort("timestamp");
    let arrOfJsonObjs = await spend(pointsToSpend, results);
    res.json(arrOfJsonObjs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * POST request to add points (i.e create docs for each transaction in database)
 *
 * @param {*} req
 * @param {*} res
 * @return {JSON} sends a JSON object for each doc converted to json format as respnse
 */
exports.addPoints = async (req, res) => {
  try {
    // var isJson = await isJsonObject(req.body);
    // console.log(isJson);
    // if (!isJson) {
    //   req.body.forEach(async (element) => {
    //     const doc = await addPoints.create({
    //       payer: element.payer,
    //       points: element.points,
    //       timestamp: element.timestamp,
    //     });
    //     addPoints.doc.save();
    //     console.log(doc);
    //   });
    //   res.json(req.body);
    //} else {
    const doc = await addPoints.create({
      payer: req.body.payer,
      points: req.body.points,
      timestamp: req.body.timestamp,
    });
    doc.save();
    res.json(doc);
    //}
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log(error.message);
  }
};

/**
 * Function to GET request body is an array of JSON objects or just 1 object (i.e one transaction)
 *
 * @param {any} data data passed in in the body of addPoints GET request
 * @returns {bool} true if data is JSON, else fasle
 */
async function isJsonObject(data) {
  try {
    JSON.parse(data);
  } catch (e) {
    return false;
  }
  return true;
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
    res.status(400).json({ message: error });
    console.log(error.message);
  }
};

/**
 * Groups all documents based on field "payer" and sums "points".
 *
 * @returns {Object} a dictionary of key-value pairs of payer (key) and remaining points (value)
 *                  based on the aggregation.
 */
async function balance() {
  let balancedOutput = {};
  const grouped = await addPoints.aggregate([
    {
      $group: { _id: "$payer", points: { $sum: "$points" } },
    },
  ]);
  grouped.forEach((element) => {
    balancedOutput[element._id] = element.points;
  });
  return balancedOutput;
}
