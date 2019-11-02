var masterPeer;

function createParty(partyName) {
    localStorage.setItem("partyId", partyName);
    signal({
        clientType: "master",
        action: "create-party"
    });
    // createPeerConnection(iceServers);
    //Event triggered when negotiation can take place as RTCpeer won't be stable
    // masterPeer.onnegotiationneeded = handleNegotiationNeededEvent;
}

var actions = {
    "offer-request": function sendOffer() {
        createPeerConnection(iceServers);
        masterPeer.onnegotiationneeded = handleNegotiationNeededEvent;
    },
    "answer-response" : function acceptAnswer(data){
        
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