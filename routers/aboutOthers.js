const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const { encrypt, decrypt } = require("../encryptionUtils");
const connectQueryEnd = require("../connectQueryEnd");

const { StatusCodes } = require("http-status-codes");

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));

// Create new person
router.post("/people", async (req, res) => {
  const username = req.username;
  const name = req.body.name;
  const notes = req.body.notes;
  const encryptionKey = req.encryptionKey;

  // Encrypt name and notes.
  const encryptedName = encrypt(name, encryptionKey);
  const encryptedNotes = encrypt(notes, encryptionKey);

  // Save to database.
  const sql =
    "INSERT INTO inclusive_web_apps.about_others_people (username, person_id, encrypted_name, encrypted_notes) VALUES (?, ?, ?, ?);";
  const personId = crypto.randomBytes(16).toString("hex");
  const args = [username, personId, encryptedName, encryptedNotes];
  await connectQueryEnd(sql, args);
  res.redirect(StatusCodes.SEE_OTHER, `/about-others.html`);
});

router.get("/people", async (req, res) => {
  const username = req.username;
  const sql =
    "SELECT * FROM inclusive_web_apps.about_others_people WHERE username=?;";
  const args = [username];
  const encryptedPeople = await connectQueryEnd(sql, args);

  const encryptionKey = req.encryptionKey;
  const decryptedPeople = encryptedPeople.map((person) => ({
    personId: person.person_id,
    name: decrypt(person.encrypted_name, encryptionKey),
  }));
  res.status(StatusCodes.OK).send(decryptedPeople);
});

router.get("/person/:personId", async (req, res) => {
  // Get person from database.
  const personId = req.params.personId;
  const username = req.username;
  const sql =
    "SELECT encrypted_name, encrypted_notes FROM inclusive_web_apps.about_others_people WHERE username=? AND person_id=?;";
  const args = [username, personId];
  const person = (await connectQueryEnd(sql, args))[0];
  // Decrypt data.
  const encryptionKey = req.encryptionKey;
  const name = decrypt(person.encrypted_name, encryptionKey);
  const notes = decrypt(person.encrypted_notes, encryptionKey);
  res.status(StatusCodes.OK).send({
    name,
    notes,
  });
});

// Update person.
router.post("/person/:personId", async (req, res) => {
  const username = req.username;
  const personId = req.params.personId;

  const name = req.body.name;
  const notes = req.body.notes;
  const encryptionKey = req.encryptionKey;

  // Encrypt name and notes.
  const encryptedName = encrypt(name, encryptionKey);
  const encryptedNotes = encrypt(notes, encryptionKey);

  // Update database row.
  const sql = `UPDATE inclusive_web_apps.about_others_people SET encrypted_name=?, encrypted_notes=? WHERE username=? AND person_id=?;`;
  const args = [encryptedName, encryptedNotes, username, personId];
  await connectQueryEnd(sql, args);
  res.redirect(
    StatusCodes.SEE_OTHER,
    "/about-others/person/view.html?person-id=" + personId
  );
});

// Delete person.
router.delete("/person/:personId", async (req, res) => {
  const personId = req.params.personId;
  const username = req.username;
  const sql = `DELETE FROM inclusive_web_apps.about_others_people WHERE username=? AND person_id=?;`;
  const args = [username, personId];
  await connectQueryEnd(sql, args);
  res.sendStatus(StatusCodes.NO_CONTENT);
});

module.exports = router;
