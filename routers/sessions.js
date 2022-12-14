const bodyParser = require("body-parser");
const express = require("express");
const { StatusCodes } = require("http-status-codes");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");

const connectQueryEnd = require("../connectQueryEnd");

const { validateUsernameAndPassword } = require("./sessionsUtils");

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookieParser());

router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;
    await validateUsernameAndPassword(username, password);

    // Delete other sessions for this username from the database.
    const sql1 = `DELETE FROM inclusive_web_apps.sessions WHERE username = ?;`;
    const args1 = [username];
    await connectQueryEnd(sql1, args1);

    // Create session key.
    const sessionId = crypto.randomBytes(32).toString("hex");

    // Store session in database.
    const sql2 = `INSERT INTO inclusive_web_apps.sessions (session_id, username) VALUES (?, ?);`;
    const args2 = [sessionId, username];
    await connectQueryEnd(sql2, args2);
    // Set response cookie.
    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    res.redirect(StatusCodes.SEE_OTHER, `/home.html`);
  } catch (error) {
    const encodedErrorMessage = encodeURIComponent(error.message); // To replace spaces with %20, for example.
    res.redirect(
      StatusCodes.SEE_OTHER,
      `/log-in.html?error=${encodedErrorMessage}`
    );
  }
});

router.delete("/", async (req, res) => {
  const sessionId = req.cookies.sessionId;
  const sql = "DELETE FROM inclusive_web_apps.sessions WHERE session_id=?;";
  const args = [sessionId];
  await connectQueryEnd(sql, args);
  res.clearCookie("sessionId", {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  });
  res.end();
});

module.exports = router;
