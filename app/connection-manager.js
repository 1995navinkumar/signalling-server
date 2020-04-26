const utils = require("./utils");
const messageValidator = require("./message-validator");
const logger = require("../app-logger");

var ConnectionManager = (function ConnectionManager() {
    var activeConnection = {};
    function createConnection(ws, sessionId, handler) {
        var connection = new Connection(ws, sessionId,handler);
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
        createConnection,
        getConnection,
        getConnectionCount,
        forEach,
        terminateConnection
    }
})();

function Connection(ws, sessionId,handler) {
    this.ws = ws;
    this.id = sessionId;
    this.notificationList = [];
    Object.assign(this, utils.composeEventHandler());
    this.loadBalancer = loadBalancer.call(this, messageValidator, handler);
}

Connection.prototype.getNotificationList = function getNotificationList() {
    return this.notificationList;
};

Connection.prototype.removeNotification = function removeNotification(notificationId) {
    var index = this.notificationList.findIndex(message => message.data.notificationId == notificationId);
    this.notificationList.splice(index, 1);
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

Connection.prototype.api = function api(message) {
    message.category = "api";
    this.signal(message);
}

Connection.prototype.notify = function notify(message) {
    message.data = message.data || {};
    message.data.notificationId = utils.uuid();
    this.notificationList.push(message);
    message.category = "notification";
    this.signal(message);
}

function loadBalancer(messageValidator, messageHandler) {
    return (message) => {
        logger.info(message);
        try {
            var { category, type } = message;
            if (category && type) {
                var isValid = messageValidator[category][type](this, message);
                isValid && messageHandler[category][type](this, message)
            }
        } catch (err) {
            console.log(err);
            logger.error(err.stack);
        }
    }
}

module.exports = ConnectionManager