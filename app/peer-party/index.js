sessionStorage.clear();

const servers = {
    urls: "stun:stun1.l.google.com:19302"
}

const turnServer = {
    urls: 'turn:192.158.29.39:3478?transport=udp',
    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
    username: '28224511:1379330808'
}

const iceServers = [servers, turnServer];

const log = console.log;

const constraints = {
    audio: true
};

const offerOptions = {
    offerToReceiveAudio: 1,
};

let socket;

function Socket({username}) {
    return new Promise((resolve, reject) => {
        var hostName = location.hostname;
        var connection = new WebSocket(`ws://${hostName}:8080`,username);
        connection.onopen = function (e, f) {
            log("socket connection established ");
            resolve(connection);
        }
        connection.onmessage = pipe(messageParser, actionInvoker);
        connection.onerror = function (e) {
            log("error in connection establishment");
            reject(e);
        }
        socket = connection;
    });
};

var actions = {
    "connection" : function(data){
        sessionStorage.setItem("uuid",data.uuid);
        actions["connection-success"](data);
    }
}

function signal(message) {
    socket.send(processMessage(message));
}

function messageParser(message) {
    return JSON.parse(message.data);
}

function actionInvoker(data) {
    var action = data.action;
    action ? actions[action](data) : log(data);
}

function processMessage(message) {
    var clientId = sessionStorage.getItem("uuid");
    var partyId = sessionStorage.getItem("partyId");
    var finalMessage = Object.assign({}, { clientId, partyId }, message);
    return JSON.stringify(finalMessage);
}
