var audioStream;

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
                    var audioTag = getAudioTag();
                    audioTag.srcObject = stream;
                    audioStream = stream;
                    console.log(audioStream);
                    resolve(stream);
                });
            });
        })
    }
    return audioStream;
}
