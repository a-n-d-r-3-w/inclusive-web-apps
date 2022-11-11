const express = require("express");
const cookieParser = require("cookie-parser");

const router = express.Router();
router.use(cookieParser());

router.use((req, res, next) => {
  const sessionId = req.cookies.sessionId;
  // Verify if session ID exists in table.
  next();
});

module.exports = router;
