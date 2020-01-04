const AuthUtil = require("./auth-util");
const ConnectionManager = require("./connection-manager");
const utils = require("./utils");
const logger = require("../app-logger");

function Socket(server, wss) {
    server.on('upgrade', function (request, socket, head) {
        var id = AuthUtil.authorize(request);
        if (id) {
            wss.handleUpgrade(request, socket, head, function (ws) {
                wss.emit('connection', ws, id);
            });
        } else {
            logger.info("UnAuthorised client , destroying socket connection");
            socket.destroy();
            return;
        }
    });

    wss.on('connection', function onConnection(ws, id) {
        var connection = ConnectionManager.createConnection(ws, id);
        ws.on("message", utils.pipe(utils.parser, connection.loadBalancer));
        ws.on("close", ConnectionManager.terminateConnection(connection));
        ws.on("error", logger.error);
    });
}

module.exports = Socket;