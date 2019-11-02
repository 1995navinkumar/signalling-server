var masterPeer;

function createParty(partyName) {
    localStorage.setItem("partyId", partyName);
    signal({
        clientType: "master",
        action: "create-party"
    });
}

var actions = {
    "offer-request": function sendOffer() {
        createPeerConnection(iceServers);
        //Event triggered when negotiation can take place as RTCpeer won't be stable
        masterPeer.onnegotiationneeded = handleNegotiationNeededEvent;
    },
    "answer-response": async function acceptAnswer(data) {
        var desc = new RTCSessionDescription(data.answer);
        await masterPeer.setRemoteDescription(desc);
        log("Master Remote Description is set");
    }
}

function createPeerConnection(iceServers) {
    masterPeer = new RTCPeerConnection({
        iceServers
    });
    // RTC Data Channel
    channel = masterPeer.createDataChannel("peer-party");
    channel.onopen = handleChannelStatusChange;
    channel.onclose = handleChannelStatusChange;

    // peer.ondatachannel = receiveChannelCallback;

    // peer.onicecandidate = handleMasterICECandidateEvent;
    // peer.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
}



function handleChannelStatusChange(e) {
    log("state of data channel" + sendChannel.readyState);
    // if (sendChannel) {
    //     var state = sendChannel.readyState;
    //     log("channel status changed => " + state);
    //     if (state === "open") {

    //     }
    // }
}

async function handleNegotiationNeededEvent() {
    try {
        log("Negotiation started");

        const offer = await masterPeer.createOffer(constraints);

        // If the connection hasn't yet achieved the "stable" state,
        // return to the caller. Another negotiationneeded event
        // will be fired when the state stabilizes.
        if (masterPeer.signalingState != "stable") {
            log("     -- The connection isn't stable yet; postponing...")
            return;
        }

        log("Setting to local description");
        await masterPeer.setLocalDescription(offer);

        signal({
            action: "offer",
            offer: masterPeer.localDescription
        });

    } catch (error) {
        log(`Failed in Negotiation ${error}`)
    }
}