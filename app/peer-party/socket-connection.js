var log = console.log;
var audioStream;
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

var actions = {
    "dj-accept": function () {
        chrome.tabs.query({ active : true , currentWindow : true }, (tabs) => {
            chrome.tabCapture.capture({ audio: true }, (stream) => {
                audioStream = stream;
            });
        });
    },
    "join-party" : function(message){
        var clientIds = message.data.clientIds;
        clientIds.forEach(client => {
            
        })
    }
}

function actionInvoker(message) {
    actions[message.action] && actions[message.action](message);
    chrome.runtime.sendMessage(message);
}