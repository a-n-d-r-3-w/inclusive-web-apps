const express = require("express");
const https = require("https");
const fs = require("fs");
const compression = require("compression");

const app = express();
app.use(compression());
app.use(express.static("public"));

app.post("/api/users", (req, res) => {
  res.send("hi");
});

const options = {
  key: fs.readFileSync("localhost-key.pem"),
  cert: fs.readFileSync("localhost.pem"),
};

https.createServer(options, app).listen(443);
