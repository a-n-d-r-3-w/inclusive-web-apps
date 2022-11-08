const express = require("express");
const https = require("https");
const fs = require("fs");

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const options = {
  key: fs.readFileSync("localhost-key.pem"),
  cert: fs.readFileSync("localhost.pem"),
};
https.createServer(options, app).listen(443);
