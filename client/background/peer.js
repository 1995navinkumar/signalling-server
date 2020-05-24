import AudioPlayer from './audio-player';
import hark from './hark';
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

export function getAudioStream() {
    if (!audioStream) {
        audioStream = new Promise(function (resolve, reject) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabCapture.capture({ audio: true }, (stream) => {
                    AudioPlayer.setStream(stream);
                    AudioPlayer.play();
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
    });
    audioStream = undefined;
}
