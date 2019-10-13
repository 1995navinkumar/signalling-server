const express = require("express");
const uuid = require("./uuid");
const httpLogger = require("./http-logger");
const bodyParser = require("body-parser");
const peerParty = require("./services/peer-party");
const createSocket = require("./services/peer-party/wss-server");

// modules

// instantiate
const app = express();
// adding unique id for every request
app.use(uuid);

// add body parsers
app.use(bodyParser.json());

// log all http req/res 
app.use(httpLogger.req);
app.use(httpLogger.res);

app.use("/party",peerParty);

// listen for request
app.listen(process.env.port || 8000, function () {
    console.log('server running on port', process.env.port || 8000);
});

//Creating websocket
createSocket(app);