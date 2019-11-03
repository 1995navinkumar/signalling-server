// sessionStorage.clear();

const servers = {
    urls: "stun:stun1.l.google.com:19302"
}

const turnServer = {
    urls: 'turn:192.158.29.39:3478?transport=udp',
    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
    username: '28224511:1379330808'
}

const iceServers = [servers,turnServer];

const log = console.log;

const constraints = {
    audio: true
};

const offerOptions = {
    offerToReceiveAudio: 1,
};

const clientId = uuid();
console.log(clientId);
sessionStorage.setItem("clientId",clientId);

const socket = (function Socket() {
    document.cookie = `clientId=${clientId}`;
    var connection = new WebSocket("ws://localhost:8080");
    connection.onopen = function () {
        log("socket connection established ");
    }
    connection.onmessage = pipe(messageParser,actionInvoker);

    connection.onerror = function () {
        log("error in connection establishment");
    }
    return connection;
})();

function signal(message){
    socket.send(processMessage(message));
}

function messageParser(message) {
    return JSON.parse(message.data);
}

function actionInvoker(data) {
    var action = data.action;
    action ? actions[action](data) : log(data);
}

function processMessage(message){
    var clientId = sessionStorage.getItem("clientId");
    var partyId = sessionStorage.getItem("partyId");
    var finalMessage =  Object.assign({},{clientId,partyId},message);
    return JSON.stringify(finalMessage);
}
