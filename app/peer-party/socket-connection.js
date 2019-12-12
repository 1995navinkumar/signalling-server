var log = console.log;
var socket = (function Socket() {
    var hostName = location.hostname;
    var connection = new WebSocket(`ws://navin-5490:8080`);
    connection.onopen = function (e, f) {
        log("socket connection established ");
    }
    connection.onmessage = pipe(messageParser, actionInvoker);
    connection.onerror = function (e) {
        log("error in connection establishment");
    }
    return connection;
})();

function messageParser(message) {
    return JSON.parse(message.data);
}

function actionInvoker(data) {
    var action = data.action;
    action ? actions[action](data) : log(data);
}