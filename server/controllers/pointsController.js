/** @format */
const { json } = require("body-parser");
const mongoose = require("mongoose");
const { update } = require("../models/addPoints.js");
require("../models/db");

const addPoints = require("../models/addPoints.js");

/**
 *
 * @param {*} pointsToSpend The amount to spend
 * @param {*} results Array of current transactions sorted by timestamp (ascending)
 * @return
 */
async function spend(pointsToSpend, results) {
  var afterSpending = {};
  var i = 0;

  while (pointsToSpend > 0) {
    let id = results[i]._id;
    //if payer already exists as key in dictionary afterSpending, subtract from existing amount
    //else substract from 0
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
  //Create doc from each key-value pair in afterSpending dictionary and save in spendPoints Schema
  let arrOfJsonObjs = [];
  for (const [key, value] of Object.entries(afterSpending)) {
    arrOfJsonObjs.push({ payer: key, points: value });
  }
  return arrOfJsonObjs;
}

async function updateDoc(points, id) {
  const doc = await addPoints.findById(id);
  doc.points = points;
  console.log("updated points = ", doc.points);
  console.log("doc = ", doc);
  await doc.save();
}

//GET request for spending request
/**
 * @return array of json objects indicating spent points from their respective payers
 */
exports.spendPoints = async (req, res) => {
  try {
    const pointsToSpend = req.body.points;
    const results = await addPoints.find({}).sort("timestamp");
    console.log("Results : ", results);
    let arrOfJsonObjs = await spend(pointsToSpend, results);
    console.log("Results after spending: ", results);
    console.log("arr of json objs: ", arrOfJsonObjs);
    res.json(arrOfJsonObjs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//POST request to add points
exports.addPoints = async (req, res) => {
  try {
    var isJson = await isJsonObject(req.body);
    if (!isJson) {
      req.body.forEach(async (element) => {
        const doc = await addPoints.create({
          payer: element.payer,
          points: element.points,
          timestamp: element.timestamp,
        });
        doc.save();
        console.log(doc);
      });
      res.json(req.body);
    } else {
      const doc = await addPoints.create({
        payer: req.body.payer,
        points: req.body.points,
        timestamp: req.body.timestamp,
      });
      doc.save();
      res.json(doc);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log(error.message);
  }
};

/**
 *
 * @param {array|json} strData  data passed in in the body of addPoints GET request
 * @returns
 */
async function isJsonObject(strData) {
  try {
    JSON.parse(strData);
  } catch (e) {
    return false;
  }
  return true;
}

//GET request to balance points
exports.balancePoints = async (req, res) => {
  try {
    var grouped = await balance();
    console.log("Grouped returned = ", grouped);
    res.json(grouped);
  } catch (error) {
    res.status(400).json({ message: error });
    console.log(error.message);
  }
};

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
