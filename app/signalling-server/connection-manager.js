const log = console.log;
const PartyManager = require("./party-manager");

function ConnectionManager() {
    var activeConnection = {};
    function createConnection(ws, sessionId) {
        var connection = new Connection(ws, sessionId);
        activeConnection[sessionId] = connection;
        log("connection established");
        return connection;
    }
    function terminateConnection(connection) {
        delete activeConnection[connection.id];
        log("connection terminated");
    }
    return {
        createConnection,
        terminateConnection
    }
}

function Connection(ws, sessionId) {
    this.ws = ws;
    this.id = sessionId;
}
Connection.prototype.handleClientRequest = function handleClientRequest(message) {
    PartyManager.handleClientRequest(this,JSON.parse(message));
}
Connection.prototype.signal = function signal(message){
    this.ws.send(JSON.stringify(message))
}

module.exports = ConnectionManager();;