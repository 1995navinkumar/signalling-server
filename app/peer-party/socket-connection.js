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

var peer, partyMembers = {};

function getAudioStream() {
    return new Promise(function (resolve, reject) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabCapture.capture({ audio: true }, (stream) => {
                audioStream = stream;
                resolve(stream);
            });
        });
    })
}

var actions = {
    "dj-accept": function () {

    },
    "join-party": function (message) {
        var clientIds = message.data.clientIds;
        clientIds.forEach(async (clientId) => {
            console.log(clientId);
            console.log(audioStream);
            var streamObj = audioStream || await getAudioStream();
            console.log(streamObj);
            
            var clientPeer = new RTC_Connnector(iceServers, streamObj);
            console.log(clientPeer);

            partyMembers[clientId] = clientPeer;
            clientPeer.addEventListener('offerReady', function ({detail}) {
                signal({
                    action: "offer",
                    data: { offer: detail.data, clientId }
                });
            });
            clientPeer.addEventListener('candidateReady', function ({detail}) {
                signal({
                    action: "candidate",
                    data: { candidate: detail.data, clientId }
                });
            })
        });
    },

    "offer": function offer(message) {
        peer = new RTC_Connnector(iceServers);
        var clientId = message.data.clientId;
        peer.addEventListener('answerReady', function ({detail}) {
            signal({
                action: "answer",
                data: { answer: detail.data, clientId }
            });
        });
        peer.addEventListener('candidateReady', function ({detail}) {
            signal({
                action: "candidate",
                data: { candidate: detail.data, clientId }
            });
        });
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
    actions[message.action] && actions[message.action](message);
    chrome.runtime.sendMessage(message);
}