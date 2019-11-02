var slavePeer;

function joinParty(partyName) {
    localStorage.setItem("partyId", partyName);
    signal({
        clientType: "slave",
        action: "join-party"
    });
}

function createPeerConnection(iceServers) {
    slavePeer = new RTCPeerConnection({
        iceServers
    });
    // RTC Data Channel
    // channel.onopen = handleChannelStatusChange;
    // channel.onclose = handleChannelStatusChange;

    // peer.ondatachannel = receiveChannelCallback;

    // peer.onicecandidate = handleMasterICECandidateEvent;
    // peer.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
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
    }
}