const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const { encrypt, decrypt } = require("../encryptionUtils");
const connectQueryEnd = require("../connectQueryEnd");

const { StatusCodes } = require("http-status-codes");

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));

// Create new habit
router.post("/habit", async (req, res) => {
  const username = req.username;
  const description = req.body.description;
  const encryptionKey = req.encryptionKey;

  // Encrypt description
  const encryptedDescription = encrypt(description, encryptionKey);

  // Save to database.
  const sql =
    "INSERT INTO inclusive_web_apps.good_habits_habits (username, habit_id, encrypted_description) VALUES (?, ?, ?);";
  const habitId = crypto.randomBytes(16).toString("hex");
  const args = [username, habitId, encryptedDescription];
  await connectQueryEnd(sql, args);
  res.redirect(StatusCodes.SEE_OTHER, `/good-habits.html`);
});

module.exports = router;
