const bodyParser = require('body-parser');
const express = require('express');
const HttpStatus = require('http-status-codes');
const { createUser } = require('./usersUtils');

const router = express.Router();
router.use(bodyParser.urlencoded());

const validateUsername = username => {
  if (username.length < 4 || username.length > 20) {
    throw new Error('That username is too short or too long.');
  }

  const characters = username.split('');
  const everyCharacterIsValid = characters
    .map(character => character.charCodeAt())
    .every(charCode => {
      const isLowercaseLetter = charCode >= 97 && charCode <= 122;
      const isDigit = charCode >= 48 && charCode <= 57;
      return isLowercaseLetter || isDigit;
    });
  if (!everyCharacterIsValid) {
    throw new Error('That username contains invalid characters.');
  }
};

const validatePassword = password => {
  if (password.length < 8 || password.length > 64) {
    throw new Error('That password is too short or too long.');
  }
};

router.post('/', async (req, res) => {
  try {
    const { username, password } = req.body;
    validateUsername(username);
    validatePassword(password);

    await createUser(username, password);
    res.redirect(
      HttpStatus.SEE_OTHER,
      `/create-account/success?username=${username}`
    );
    return;
  } catch (error) {
    const encodedErrorMessage = encodeURIComponent(error.message); // To replace spaces with %20, for example.
    res.redirect(
      HttpStatus.SEE_OTHER,
      `/create-account?error=${encodedErrorMessage}`
    );
  }
});

module.exports = router;
