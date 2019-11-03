var masterPeer;

async function createParty(partyName) {
    await Socket({username : "navin"});
    sessionStorage.setItem("partyId", partyName);
}

Object.assign(actions,{
    "connection-success" : function(){
        signal({
            clientType: "master",
            action: "create-party"
        });
    },
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
})

function streamReceiver({ streams: [stream] }) {
    log(stream);
    log("hello");
    if (videoPlayer.srcObject) return;
    videoPlayer.srcObject = stream;
    videoPlayer.play();
}

function createPeerConnection(iceServers) {
    masterPeer = new RTCPeerConnection({
        iceServers
    });

    masterPeer.onicecandidate = handleMasterICECandidateEvent;
    masterPeer.ontrack = streamReceiver;
    // masterPeer.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
}

async function sendVideo(){
    log("add master track");
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