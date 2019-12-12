
var socket = (function Socket({ username }) {
    var hostName = location.hostname;
    document.cookie = "sessionId=navin";
    var connection = new WebSocket(`ws://navin-5490:8080`, username);
    connection.onopen = function (e, f) {
        log("socket connection established ");
    }
    connection.onmessage = pipe(messageParser, actionInvoker);
    connection.onerror = function (e) {
        log("error in connection establishment");
    }
    return connection;
})();