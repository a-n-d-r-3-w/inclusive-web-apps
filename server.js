const express = require("express");
const https = require("https");
const fs = require("fs");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const users = require("./routers/users");
const sessions = require("./routers/sessions");

const app = express();
// Disable app.use(helmet.contentSecurityPolicy()); because it prevents the page from rendering on production builds.
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());

// Rate limiter
// Enable 'trust proxy' if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // limit each IP to `max` requests per `windowMs`
});
app.use(limiter);

app.use(compression());
app.use(express.static("public"));

app.use("/api/users", users);
app.use("/api/sessions", sessions);

const options = {
  key: fs.readFileSync("localhost-key.pem"),
  cert: fs.readFileSync("localhost.pem"),
};

https.createServer(options, app).listen(443);
