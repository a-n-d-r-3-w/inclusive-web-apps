const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const { encrypt, decrypt } = require("../encryptionUtils");
const connectQueryEnd = require("../connectQueryEnd");

const { StatusCodes } = require("http-status-codes");

const router = express.Router();

// Create new habit
router.post(
  "/habit",
  bodyParser.urlencoded({ extended: true }),
  async (req, res) => {
    const username = req.username;
    const description = req.body.description;
    const encryptionKey = req.encryptionKey;

    // Encrypt description
    const encryptedDescription = encrypt(description, encryptionKey);

    // Save to database.
    const sql =
      "INSERT INTO inclusive_web_apps.good_habits_habits (username, habit_id, encrypted_description, record) VALUES (?, ?, ?, ?);";
    const habitId = crypto.randomBytes(16).toString("hex");
    const initialRecord = "?";
    const args = [username, habitId, encryptedDescription, initialRecord];
    await connectQueryEnd(sql, args);
    res.redirect(StatusCodes.SEE_OTHER, `/good-habits.html`);
  }
);

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

router.put("/habits/:habitId/record", bodyParser.json(), async (req, res) => {
  const username = req.username;
  const habitId = req.params.habitId;
  const newRecord = req.body.newRecord;
  const sql =
    "UPDATE inclusive_web_apps.good_habits_habits SET record=? WHERE username=? AND habit_id=?";
  const args = [newRecord, username, habitId];
  await connectQueryEnd(sql, args);
  res.sendStatus(StatusCodes.NO_CONTENT);
});

// Get habit description.
router.get("/habit/:habitId", async (req, res) => {
  const username = req.username;
  const habitId = req.params.habitId;
  const sql =
    "SELECT encrypted_description FROM inclusive_web_apps.good_habits_habits WHERE username=? and habit_id=?";
  const args = [username, habitId];
  const habit = (await connectQueryEnd(sql, args))[0];

  const encryptionKey = req.encryptionKey;
  const description = decrypt(habit.encrypted_description, encryptionKey);
  res.status(StatusCodes.OK).send({
    description,
  });
});

// Update habit description.
router.post(
  "/habit/:habitId",
  bodyParser.urlencoded({ extended: true }),
  async (req, res) => {
    const username = req.username;
    const habitId = req.params.habitId;
    const description = req.body.description;
    const encryptionKey = req.encryptionKey;
    const encryptedDescription = encrypt(description, encryptionKey);
    const sql =
      "UPDATE inclusive_web_apps.good_habits_habits SET encrypted_description=? WHERE username=? and habit_id=?";
    const args = [encryptedDescription, username, habitId];
    await connectQueryEnd(sql, args);
    res.redirect(StatusCodes.SEE_OTHER, "/good-habits.html");
  }
);

// Delete habit
router.delete("/habit/:habitId", async (req, res) => {
  const habitId = req.params.habitId;
  const username = req.username;
  const sql = `DELETE FROM inclusive_web_apps.good_habits_habits WHERE username=? AND habit_id=?;`;
  const args = [username, habitId];
  await connectQueryEnd(sql, args);
  res.sendStatus(StatusCodes.NO_CONTENT);
});

module.exports = router;
