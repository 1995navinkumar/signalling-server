import AudioPlayer from './audio-player';
var audioStream;
console.log("peer");


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

export function getAudioTag() {
    var window = chrome.extension.getViews({ type: "popup" })[0];
    return window.document.getElementById("audio-player");
}

export function getAudioStream() {
    if (!audioStream) {
        audioStream = new Promise(function (resolve, reject) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabCapture.capture({ audio: true }, (stream) => {
                    AudioPlayer.setStream(stream);
                    AudioPlayer.play();
                    console.log(audioStream);
                    resolve(stream);
                });
            });
        })
    }
    return audioStream;
}

export function stopStreaming() {
    getAudioStream().then(stream => {
        var tracks = stream.getTracks();
        tracks && tracks.forEach(function (track) {
            track.stop();
        });

    })
}