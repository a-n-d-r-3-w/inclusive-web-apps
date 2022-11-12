const crypto = require("crypto");

const encrypt = (plaintext, encryptionKey) => {
  const initializationVector = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    encryptionKey,
    initializationVector
  );
  let encryptedText = cipher.update(plaintext, "utf-8", "hex");
  encryptedText += cipher.final("hex");
  // Prepend the encrypted text with the initialization vector so that it can be retrieved during the decryption process.
  const initializationVectorAsString = initializationVector.toString("hex");
  console.log("initializationVectorAsString: ", initializationVectorAsString);

  return initializationVectorAsString + encryptedText;
};

const decrypt = (encryptedText, encryptionKey) => {
  if (!encryptedText) {
    return "";
  }
  const initializationVectorAsString = encryptedText.substring(0, 32);
  const initializationVector = Buffer.from(initializationVectorAsString, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    encryptionKey,
    initializationVector
  );
  let decryptedText = decipher.update(
    encryptedText.substring(32),
    "hex",
    "utf-8"
  );
  decryptedText += decipher.final("utf-8");
  return decryptedText;
};

module.exports = {
  encrypt,
  decrypt,
};
