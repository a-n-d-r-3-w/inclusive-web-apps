const bodyParser = require("body-parser");
const express = require("express");
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const connectQueryEnd = require("../connectQueryEnd");

const router = express.Router();
router.use(bodyParser.urlencoded());

const validateUsernameAndPassword = async (username, password) => {
  const sql = `SELECT hashed_password FROM inclusive_web_apps.users WHERE username=?;`;
  const args = [username];
  const result = (await connectQueryEnd(sql, args))[0];
  if (!result) {
    throw new Error("Username not found.");
  }
  const hashedPassword = result.hashed_password;
  const usernameAndPasswordMatch = await bcrypt.compare(
    password,
    hashedPassword
  );
  if (!usernameAndPasswordMatch) {
    throw new Error("Username and password do not match.");
  }
};

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

    res.redirect(StatusCodes.SEE_OTHER, `/about-others.html`);
  } catch (error) {
    const encodedErrorMessage = encodeURIComponent(error.message); // To replace spaces with %20, for example.
    res.redirect(
      StatusCodes.SEE_OTHER,
      `/log-in.html?error=${encodedErrorMessage}`
    );
  }
});

module.exports = router;
