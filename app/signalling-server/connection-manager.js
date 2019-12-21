const log = console.log;
const utils = require("./utils");
const IncomingMessageHandler = require("./incoming-message-handler");
const OutgoingMessageHandler = require("./outgoing-message-handler");

function ConnectionManager() {
    var activeConnection = {};
    function createConnection(ws, sessionId) {
        var connection = new Connection(ws, sessionId);
        activeConnection[sessionId] = connection;
        log("connection established : " + sessionId);
        return connection;
    }
    function terminateConnection(connection) {
        return (e) => {
            connection.trigger("close", connection);
            log("connection terminated : " + connection.id);
            delete activeConnection[connection.id];
        }
    }
    return {
        createConnection,
        terminateConnection
    }
}

function Connection(ws, sessionId) {
    this.ws = ws;
    this.id = sessionId;
    Object.assign(this, utils.composeEventHandler());
    this.incomingMessageHandler = MessageHandler.call(this, IncomingMessageHandler);
    this.outgoingMessageHandler = MessageHandler.call(this, OutgoingMessageHandler);
}

Connection.prototype.signal = function signal(message) {
    this.ws.send(JSON.stringify(message))
}

function MessageHandler(categoryMapper) {
    return (message) => {
        if (message) {
            console.log(message);
            var { category, type } = message;
            return categoryMapper[category][type](this, message);
        }
    }
}

module.exports = ConnectionManager();;