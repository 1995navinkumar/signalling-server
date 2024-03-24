const express = require("express");
const uuid = require("./uuid");
const httpLogger = require("./http-logger");
const bodyParser = require("body-parser");
const Socket = require("./app/signalling-server/ws-server");

// modules

// instantiate
const app = express();

app.use(express.static("app/peer-party"));

// adding unique id for every request
app.use(uuid);

// add body parsers
app.use(bodyParser.json());

// log all http req/res
app.use(httpLogger.req);
app.use(httpLogger.res);

// listen for request
app.listen(8000, function () {
  console.log("server running on port", 8000);
});

// Creating websocket
Socket(app);
