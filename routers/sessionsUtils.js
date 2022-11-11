const bcrypt = require("bcrypt");
const connectQueryEnd = require("../connectQueryEnd");

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

module.exports = {
  validateUsernameAndPassword,
};
