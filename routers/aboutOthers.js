const express = require("express");
const { StatusCodes } = require("http-status-codes");

const router = express.Router();

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
