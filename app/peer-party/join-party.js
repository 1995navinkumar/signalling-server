var slavePeer;
var videoElement = document.querySelector(".video-player");

function joinParty(partyName) {
    localStorage.setItem("partyId", partyName);
    signal({
        clientType: "slave",
        action: "join-party"
    });
}

function streamReceiver({streams: [stream]}) {
    log(stream);
    if(videoElement.srcObject) return;
    videoElement.srcObject = stream;
}

function createPeerConnection(iceServers) {
    slavePeer = new RTCPeerConnection({
        iceServers
    });

    slavePeer.ontrack = streamReceiver;
}

var actions = {
    "answer-request": async function acceptOfferAndSendAnswer(data) {
        var desc = new RTCSessionDescription(data.offer);

        createPeerConnection(iceServers);

        // If the connection isn't stable yet, wait for it...

        if (slavePeer.signalingState != "stable") {
            log("  - But the signaling state isn't stable, so triggering rollback");

            // Set the local and remove descriptions for rollback; don't proceed
            // until both return.
            await Promise.all([
                slavePeer.setLocalDescription({ type: "rollback" }),
                slavePeer.setRemoteDescription(desc)
            ]);
            return;
        } else {
            log("  - Setting remote description");
            await slavePeer.setRemoteDescription(desc);

            let answer = await slavePeer.createAnswer(constraints);
            slavePeer.setLocalDescription(answer);

            signal({
                action: "answer",
                answer: slavePeer.localDescription
            });
        }
    },
    "set-remote-candidate": function setRemoteCandidate({candidate: remoteCandidate}) {
        var candidate = new RTCIceCandidate(remoteCandidate);
        log("Adding received ICE candidate from master");
    
        slavePeer.addIceCandidate(candidate)
    }
}