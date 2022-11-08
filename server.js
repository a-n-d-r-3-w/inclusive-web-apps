const express = require("express");
const https = require("https");
const fs = require("fs");

const app = express();

app.use(express.static("public"));

const options = {
  key: fs.readFileSync("localhost-key.pem"),
  cert: fs.readFileSync("localhost.pem"),
};
https.createServer(options, app).listen(443);
