/** @format */
/**
 * This is the starting point of application; Sets up PORT listening for server
 * and imports necessary libraries.
 */
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const routes = require("./server/routes/pointsRoutes.js");
app.use("/", routes);

app.listen(port, () => console.log(`Listening on port ${port}`));
