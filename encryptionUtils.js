const crypto = require("crypto");

const encrypt = (plaintext, encryptionKey, initializationVector) => {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    encryptionKey,
    initializationVector
  );
  let encryptedText = cipher.update(plaintext, "utf-8", "hex");
  encryptedText += cipher.final("hex");
  return encryptedText;
};

const decrypt = (encryptedText, encryptionKey, initializationVector) => {
  if (!encryptedText) {
    return "";
  }
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    encryptionKey,
    initializationVector
  );
  let decryptedText = decipher.update(encryptedText, "hex", "utf-8");
  decryptedText += decipher.final("utf-8");
  return decryptedText;
};

module.exports = {
  encrypt,
  decrypt,
};
