const express = require("express");
const cookieParser = require("cookie-parser");
const { StatusCodes } = require("http-status-codes");

const connectQueryEnd = require("../connectQueryEnd");

const router = express.Router();
router.use(cookieParser());

router.use(async (req, res, next) => {
  const sessionId = req.cookies.sessionId;
  if (!sessionId) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }

  // Verify if session ID exists in table.
  const sql = `SELECT * FROM inclusive_web_apps.sessions WHERE session_id=?;`;
  const args = [sessionId];
  const result = (await connectQueryEnd(sql, args))[0];
  if (!result) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }
  next();
});

module.exports = router;
