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
    "INSERT INTO inclusive_web_apps.good_habits_habits (username, habit_id, encrypted_description, record) VALUES (?, ?, ?, ?);";
  const habitId = crypto.randomBytes(16).toString("hex");
  const args = [username, habitId, encryptedDescription, ""];
  await connectQueryEnd(sql, args);
  res.redirect(StatusCodes.SEE_OTHER, `/good-habits.html`);
});

router.get("/habits", async (req, res) => {
  const username = req.username;
  const sql =
    "SELECT * FROM inclusive_web_apps.good_habits_habits WHERE username=?;";
  const args = [username];
  const encryptedHabits = await connectQueryEnd(sql, args);

  const encryptionKey = req.encryptionKey;
  const decryptedHabits = encryptedHabits.map((habit) => ({
    habitId: habit.habit_id,
    description: decrypt(habit.encrypted_description, encryptionKey),
    record: habit.record,
  }));
  decryptedHabits.sort((habit1, habit2) => {
    const description1 = habit1.description;
    const description2 = habit2.description;
    if (description1 < description2) {
      return -1;
    }
    if (description1 > description2) {
      return 1;
    }
    return 0;
  });
  res.status(StatusCodes.OK).send(decryptedHabits);
});

module.exports = router;
