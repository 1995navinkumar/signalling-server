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

    masterPeer.onicecandidate = handleMasterICECandidateEvent;
    // masterPeer.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
}

async function sendVideo(){
    const gumStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    });

    for (const track of gumStream.getTracks()) {
        masterPeer.addTrack(track, gumStream);
    }
}

function handleMasterICECandidateEvent(event) {
    log("ice candidate handling");
    if (event.candidate) {
        signal({
            action: "offer-candidate",
            candidate: event.candidate
        })
    }
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