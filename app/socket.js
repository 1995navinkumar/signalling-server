const AuthUtil = require("./auth-util");
const ConnectionManager = require("./connection-manager");
const utils = require("./utils");

function Socket(server, wss) {
    server.on('upgrade', function (request, socket, head) {
        var sessionId = AuthUtil.authorize(request);
        if (sessionId) {
            wss.handleUpgrade(request, socket, head, function (ws) {
                wss.emit('connection', ws, sessionId);
            });
        } else {
            logger.info("UnAuthorised client , destroying socket connection");
            socket.destroy();
            return;
        }
    });

    wss.on('connection', function onConnection(ws, sessionId) {
        var connection = ConnectionManager.createConnection(ws, sessionId);
        ws.on("message", utils.pipe(utils.parser, connection.loadBalancer));
        ws.on("close", ConnectionManager.terminateConnection(connection));
        ws.on("error", logger.error);
    });
}

module.exports = Socket;