const bodyParser = require("body-parser");
const express = require("express");
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const connectQueryEnd = require("../connectQueryEnd");

const router = express.Router();
router.use(bodyParser.urlencoded());

router.get("/", async (req, res) => {
  res.send("hi");
});

module.exports = router;
