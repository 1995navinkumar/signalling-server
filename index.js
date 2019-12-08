const express = require("express");
const uuid = require("./uuid");
const httpLogger = require("./http-logger");
const bodyParser = require("body-parser");
const Socket = require("./app/signalling-server/socket");
const http = require('http');
const WebSocket = require("ws");


// modules

// instantiate
const app = express();

app.use(express.static('app/peer-party'));

// adding unique id for every request
app.use(uuid);

// add body parsers
app.use(bodyParser.json());

// log all http req/res 
app.use(httpLogger.req);
app.use(httpLogger.res);

// listen for request
const server = http.createServer(app);

const wss = new WebSocket.Server({ clientTracking: false, noServer: true });
server.listen(process.env.port || 8080, function () {
    console.log('server running on port', process.env.port || 8080);
});

// Creating websocket
Socket(server, wss);