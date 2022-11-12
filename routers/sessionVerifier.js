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

  // Attach username to the request so that subsequent middleware have it.
  const username = result.username;
  req.username = username;

  // Attach encryption key to the request so that subsequent middleware have it.
  const sql2 = "SELECT * FROM inclusive_web_apps.users WHERE username=?;";
  const args2 = [username];
  const result2 = (await connectQueryEnd(sql2, args2))[0];
  if (!result) {
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    return;
  }
  const encryptionKey = result2.encryption_key;
  req.encryptionKey = encryptionKey;

  next();
});

module.exports = router;
