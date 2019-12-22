var log = console.log;
var audioStream;

function signal(message) {
    SocketManager.then(socketManager => {
        socketManager.getSocket().then(socket => {
            socket.send(JSON.stringify(message));
        })
    })
}

function destroySocket() {
    SocketManager.then(socketManager => {
        socketManager.destroy();
    })
}

var SocketManager = (async function Socket() {
    var socket, profile;
    profile = await getUserProfile();
    async function getUserProfile() {
        return new Promise((resolve, reject) => {
            chrome.identity.getProfileUserInfo(resolve);
        })
    }
    async function getSocket() {
        return socket || await makeConnection();
    }

    function destroy() {
        if (socket) {
            socket.close(1000, "User logged out");
            socket = undefined;
            reset();
        }
    }

    async function makeConnection() {
        return new Promise((resolve, reject) => {
            var hostName = localStorage.getItem("server");
            socket = new WebSocket(`ws://${hostName}?email=${profile.email}`);
            socket.onopen = function (e, f) {
                log("socket connection established ");
                resolve(socket);
            }
            socket.onmessage = pipe(messageParser, actionInvoker);
            socket.onerror = function (e) {
                log("error in connection establishment");
                reject(e);
            }
            socket.onclose = function () {
                console.log("socket closed");
                socket = undefined;
            }

        })
    }
    return { getSocket, destroy };
})();

const servers = {
    urls: "stun:stun1.l.google.com:19302"
}

const turnServer = {
    urls: 'turn:192.158.29.39:3478?transport=udp',
    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
    username: '28224511:1379330808'
}

const iceServers = [servers, turnServer];

function messageParser(message) {
    return JSON.parse(message.data);
}

var peer, partyMembers = {};

function reset() {
    if (peer) {
        peer.close();
        peer = undefined;
    }
    if (Object.keys(partyMembers).length > 0) {
        partyMembers.forEach(peerCon => {
            peerCon.close();
        })
        partyMembers = {};
    }
}

function getAudioStream() {
    return new Promise(function (resolve, reject) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabCapture.capture({ audio: true }, (stream) => {
                audioStream = stream;
                document.getElementById("audio-player").srcObject = stream;
                resolve(stream);
            });
        });
    })
}

var actions = {
    "dj-accept": function () {

    },
    "join-party": async function (message) {
        var clientIds = message.data.clientIds;
        var streamObj = audioStream || await getAudioStream();
        clientIds.forEach((clientId) => {
            var clientPeer = new RTC_Connnector(iceServers, streamObj);
            partyMembers[clientId] = clientPeer;
            clientPeer.on('offerReady', function (offer) {
                signal({
                    action: "offer",
                    data: { offer, clientId }
                });
            });
            clientPeer.on('candidateReady', function (candidate) {
                signal({
                    action: "candidate",
                    data: { candidate, clientId }
                });
            })
        });
    },

    "offer": function offer(message) {
        peer = new RTC_Connnector(iceServers);
        var clientId = message.data.clientId;
        peer.on('answerReady', function (answer) {
            signal({
                action: "answer",
                data: { answer, clientId }
            });
        });
        peer.on('candidateReady', function (candidate) {
            signal({
                action: "candidate",
                data: { candidate, clientId }
            });
        });
        peer.on("streamReady", function ({ streams: [stream] }) {
            console.log("streamReady");
            document.getElementById("audio-player").srcObject = stream;
        })
        peer.acceptOffer(message.data.offer);
    },

    "answer": function answer(message) {
        var clientId = message.data.clientId;
        var clientPeer = partyMembers[clientId];
        clientPeer.setAnswer(message.data.answer);
    },

    "candidate": function candidate(message) {
        let clientId = message.data.clientId;
        let clientPeer = partyMembers[clientId] || peer;
        clientPeer.setRemoteCandidate(message.data.candidate);
    }
}

function actionInvoker(message) {
    console.log("invoker");

    actions[message.type] && actions[message.type](message);
    chrome.runtime.sendMessage(message);
}






var ConnectionManager = (function ConnectionManager() {
    var activeConnection;
    function createConnection(userProfile) {
        var hostName = localStorage.getItem("server");
        activeConnection = new Connection(hostName, userProfile);
        return activeConnection;
    }
    function terminateConnection() {
        activeConnection.trigger("close", connection);
        activeConnection.close();
        log("connection terminated");
    }
    return {
        createConnection,
        terminateConnection,
        getConnection
    }
})();

function Connection(hostName, profile) {

    this.ws = new WebSocket(`ws://${hostName}?email=${profile.email}`);
    this.incomingMessageHandler = MessageHandler.call(this, IncomingMessageHandler);
    Object.assign(this, utils.composeEventHandler());

    ws.onopen = function (e, f) {
        log("socket connection established ");
    }
    ws.onmessage = pipe(messageParser, this.incomingMessageHandler);

    ws.onerror = function (e) {
        log("error in connection establishment", e);
    }
    ws.onclose = function () {
        console.log("socket closed");
    }
}

Connection.prototype.signal = function signal(message) {
    this.ws.send(JSON.stringify(message))
}

Connection.prototype.request = function request(message) {
    this.signal(message);
}

Connection.prototype.respond = function respond(to, message) {
    message.category = "response";
    message.data.memberId = to;
    this.signal(message);
}

Connection.prototype.action = function action(message) {
    message.category = "action";
    this.signal(message);
}

Connection.prototype.webrtc = function webrtc(message) {
    message.category = "webrtc";
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