const AuthUtil = require("./auth-util");
const ConnectionManager = require("./connection-manager");

function Socket(server, wss) {
    server.on('upgrade', function (request, socket, head) {
        var sessionId = AuthUtil.authorize(request);
        if (sessionId) {
            wss.handleUpgrade(request, socket, head, function (ws) {
                wss.emit('connection', ws, sessionId);
            });
        } else {
            console.log("UnAuthorised client , destroying socket connection");
            socket.destroy();
            return;
        }
    });

    wss.on('connection', function onConnection(ws, sessionId) {
        var connection = ConnectionManager.createConnection(ws, sessionId);
        ws.on("message", connection.handleClientRequest);
        ws.on("close", function () {
            ConnectionManager.terminateConnection(connection);
        });
    });
}

module.exports = Socket;