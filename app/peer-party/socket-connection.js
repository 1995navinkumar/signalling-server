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

var rtcPeers = {}, djPeer;

var actions = {
    "dj-accept": function () {
        chrome.tabs.query({ active : true , currentWindow : true }, (tabs) => {
            chrome.tabCapture.capture({ audio: true }, (stream) => {
                audioStream = stream;
            });
        });
    },
    "join-party" : function(message){
        djPeer = djPeer || new RTC_Connnector(iceServers,stream);
        var clientIds = message.data.clientIds;
        clientIds.forEach(clientId => {
            let rtcTransmitter = new RTC_Connnector(iceServers);
            rtcPeers[clientId] = rtcTransmitter;

            rtcTransmitter.addEventListener('offer', function (offer) {
                signal({
                    action:"offer",
                    data: {offer, clientId}
                });
            });

            rtcTransmitter.addEventListener('answer', function (answer) {
                signal({
                    action:"answer",
                    data: {answer, clientId}
                });
            });

            rtcTransmitter.addEventListener('answer', function (candidate) {
                signal({
                    action:"candidate",
                    data: {candidate, clientId}
                });
            });
        });
    },
     
    "offer": function offer(message) {
        let rtcTransmitter = rtcPeers[message.data.clientId];
        rtcTransmitter.acceptOffer(message.offer);
    },

    "answer": function offer(message) {
        let rtcTransmitter = rtcPeers[message.data.clientId];
        rtcTransmitter.setAnswer(message.answer);
    },

    "candidate": function candidate(message) {
        let rtcTransmitter = rtcPeers[message.data.clientId];
        rtcTransmitter.setRemoteCandidate(message.candidate);
    }
}

function actionInvoker(message) {
    actions[message.action] && actions[message.action](message);
    chrome.runtime.sendMessage(message);
}