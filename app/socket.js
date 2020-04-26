const AuthUtil = require("./auth-util");
const ConnectionManager = require("./connection-manager");
const MessageHandler = require("./message-handler");
const utils = require("./utils");
const logger = require("../app-logger");

function Socket(server, wss) {
    server.on('upgrade', function (request, socket, head) {
        var id = AuthUtil.authorize(request);
        if (id) {
            var connection = ConnectionManager.getConnection(id);
            if (connection) {
                logger.info("Connection already present with same id , so resuming connection");
                wss.handleUpgrade(request, socket, head, function (ws) {
                    attachEvents(connection, ws);
                });
            } else {
                wss.handleUpgrade(request, socket, head, function (ws) {
                    wss.emit('connection', ws, id);
                });
            }
        } else {
            logger.error("UnAuthorised client , destroying socket connection");
            socket.destroy();
            return;
        }
    });

    wss.on('connection', function onConnection(ws, id) {
        var connection = ConnectionManager.createConnection(ws, id, MessageHandler);
        attachEvents(connection, ws);
    });

    function attachEvents(connection, ws) {
        ws.isAlive = true;
        ws.on("message", utils.pipe(utils.parser, connection.loadBalancer));
        ws.on("close", ConnectionManager.terminateConnection(connection));
        ws.on("error", logger.error);
        ws.on('pong', heartbeat);
    }

    function noop() { }

    function heartbeat() {
        this.isAlive = true;
    }

    const interval = setInterval(function ping() {
        wss.clients && wss.clients.forEach(function each(ws) {
            if (ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping(noop);
        });
    }, 10000);
}

module.exports = Socket;