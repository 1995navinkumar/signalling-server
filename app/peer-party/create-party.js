async function partyCreator(partyName, actions) {
    var masterPeer,liveStream,peerList = [];

    Object.assign(actions, {
        "connection-success": function () {
            console.log("connection success");
            signal({
                action: "create-party"
            });
        },
        "offer-request": function sendOffer() {
            createPeerConnection(iceServers);
        },
        "answer-response": async function acceptAnswer(data) {
            var desc = new RTCSessionDescription(data.answer);
            await peerList[username].setRemoteDescription(desc);
            log("Master Remote Description is set");
        },
        "set-remote-candidate": function setRemoteCandidate({ candidate: remoteCandidate }) {
            var candidate = new RTCIceCandidate(remoteCandidate);
            log("Adding received ICE candidate from slave");
            peerList[username].addIceCandidate(candidate);
        }
    });

    let username = "navin"+Math.random();
    await Socket({ username });
    sessionStorage.setItem("partyId", partyName);



    function streamReceiver({ streams: [stream] }) {
        log(stream);
        if (audioPlayer.srcObject) return;
        audioPlayer.srcObject = stream;
        audioPlayer.play();
    }

    function createPeerConnection(iceServers) {
        let masterPeer = new RTCPeerConnection({
            iceServers
        });

        masterPeer.onicecandidate = handleMasterICECandidateEvent;
        masterPeer.ontrack = streamReceiver;
        //Event triggered when negotiation can take place as RTCpeer won't be stable
        masterPeer.onnegotiationneeded = handleNegotiationNeededEvent;
        // masterPeer.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
        peerList[username] = masterPeer;
    }

    async function sendAudio() {
        log("add master track");
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if(liveStream){
                chrome.tabCapture.capture({ audio: true }, (stream) => {
                    liveStream = stream;
                    for (const track of stream.getTracks()) {
                        peerList[username].addTrack(track, stream);
                    }
                });
            } else {
                for (const track of liveStream.getTracks()) {
                    peerList[username].addTrack(track, stream);
                }
            }
        });
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

            const offer = await peerList[username].createOffer(constraints);

            // If the connection hasn't yet achieved the "stable" state,
            // return to the caller. Another negotiationneeded event
            // will be fired when the state stabilizes.
            if (peerList[username].signalingState != "stable") {
                log("     -- The connection isn't stable yet; postponing...")
                return;
            }

            log("Setting to local description");
            await peerList[username].setLocalDescription(offer);

            signal({
                action: "offer",
                offer: peerList[username].localDescription
            });

        } catch (error) {
            log(`Failed in Negotiation ${error}`)
        }
    }
    return sendAudio;
};
