const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const { encrypt } = require("../encryptionUtils");

const { StatusCodes } = require("http-status-codes");

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/people", async (req, res) => {
  const name = req.body.name;
  const notes = req.body.notes;
  const encryptionKey = req.encryptionKey;

  // Encrypt name and notes.
  const initializationVector = crypto.randomBytes(16);
  const encryptedName = encrypt(name, encryptionKey, initializationVector);
  const encryptedNotes = encrypt(notes, encryptionKey, initializationVector);
  console.log("name: ", name);
  console.log("encryptedName: ", encryptedName);
  console.log("notes: ", notes);
  console.log("encryptedNotes: ", encryptedNotes);

  // Save to database.
  res.sendStatus(StatusCodes.CREATED);
});

router.get("/people", async (req, res) => {
  const people = [
    {
      personId: "1",
      name: "Whoppers",
      notes: "Notes on Whoppers",
    },
    {
      personId: "2",
      name: "Jackson",
      notes: "Notes on Jackson",
    },
  ];
  res.status(StatusCodes.OK).send(people);
});

module.exports = router;
