const express = require("express");
const uuid = require("./uuid");
const httpLogger = require("./http-logger");
const bodyParser = require("body-parser");
const Socket = require("./app/socket");
const http = require('http');
const WebSocket = require("ws");
var cookieParser = require('cookie-parser');


// modules

// instantiate
const app = express();

// adding unique id for every request
app.use(uuid);

app.use(express.static('public'))

// add body parsers
app.use(bodyParser.json());

// log all http req/res 
app.use(httpLogger.req);
app.use(httpLogger.res);
app.use(cookieParser());

// listen for request
const server = http.createServer(app);

const wss = new WebSocket.Server({ clientTracking: false, noServer: true });
server.listen(process.env.PORT || 8090, function () {
    console.log('server running on port', process.env.PORT || 8090);
});

// Creating websocket
Socket(server, wss);