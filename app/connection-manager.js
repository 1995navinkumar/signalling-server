const utils = require("./utils");
const messageHandler = require("./message-handler");
const messageValidator = require("./message-validator");
const logger = require("../app-logger");

function ConnectionManager() {
    var activeConnection = {};
    function createConnection(ws, sessionId) {
        var connection = new Connection(ws, sessionId);
        activeConnection[sessionId] = connection;
        logger.info("connection established : " + sessionId);
        return connection;
    }
    function terminateConnection(connection) {
        return (e) => {
            connection.trigger("close", connection);
            logger.info("connection terminated : " + connection.id);
            return delete activeConnection[connection.id];
        }
    }
    function getConnection(id) {
        return activeConnection[id];
    }

    function getConnectionCount() {
        return Object.keys(activeConnection).length;
    }

    function forEach(callback) {
        Object.keys(activeConnection).forEach(key => {
            callback(activeConnection[key]);
        })
    }

    return {
        activeConnection,
        createConnection,
        getConnection,
        getConnectionCount,
        forEach,
        terminateConnection
    }
}

function Connection(ws, sessionId) {
    this.ws = ws;
    this.id = sessionId;
    Object.assign(this, utils.composeEventHandler());
    this.loadBalancer = loadBalancer.call(this, messageValidator, messageHandler);
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

function loadBalancer(messageValidator, messageHandler) {
    return (message) => {
        logger.info(message);
        var { category, type } = message;
        var isValid = messageValidator[category][type](this, message);
        isValid ? messageHandler[category][type](this, message) : "";
    }
}

module.exports = ConnectionManager();;