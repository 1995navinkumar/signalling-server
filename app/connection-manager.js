const log = console.log;
const utils = require("./utils");
const IncomingMessageHandler = require("./incoming-message-handler");
const logger = require("../app-logger");

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
}

Connection.prototype.signal = function signal(message) {
    this.ws.send(JSON.stringify(message))
}

Connection.prototype.forward = function forward(from, message) {
    message.data.memberId = from.id;
    this.signal(message);
}

Connection.prototype.respond = function respond(message) {
    message.category = "response";
    this.signal(message);
}

Connection.prototype.notify = function notify(message) {
    message.category = "notification";
    this.signal(message);
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