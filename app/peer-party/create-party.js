var masterPeer;

async function createParty(partyName) {
  await Socket({ username: "navin" });
  sessionStorage.setItem("partyId", partyName);
}

Object.assign(actions, {
  "connection-success": function () {
    signal({
      clientType: "master",
      action: "create-party",
    });
  },
  "offer-request": function sendOffer() {
    createPeerConnection(iceServers);
  },
  "answer-response": async function acceptAnswer(data) {
    try {
      log("Answer Received");
      var desc = new RTCSessionDescription(data.answer);
      log("new RTCSessionDescription");
      await masterPeer.setRemoteDescription(desc);
      log("master.setRemoteDescription");
    } catch (err) {
      log(`Error in setting remote description ${err}`);
    }
  },
  "set-remote-candidate": function setRemoteCandidate({
    candidate: remoteCandidate,
  }) {
    var candidate = new RTCIceCandidate(remoteCandidate);
    log("Adding received ICE candidate from slave");
    masterPeer.addIceCandidate(candidate);
  },
});

function streamReceiver({ streams: [stream] }) {
  log("Obtained stream from slave");
  if (audioPlayer.srcObject) return;
  audioPlayer.srcObject = stream;
  audioPlayer.play();
}

function createPeerConnection(iceServers) {
  masterPeer = new RTCPeerConnection({
    iceServers,
  });
  log("new RTCPeerConnection");

  masterPeer.onicecandidate = handleMasterICECandidateEvent;
  masterPeer.ontrack = streamReceiver;
  //Event triggered when negotiation can take place as RTCpeer won't be stable
  masterPeer.onnegotiationneeded = handleNegotiationNeededEvent;
  // masterPeer.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
}

async function sendAudio() {
  try {
    const gumStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    log("getUserMedia");

    for (const track of gumStream.getTracks()) {
      masterPeer.addTrack(track, gumStream);
    }
    log("master.addTrack");
  } catch (err) {
    log(`Error in getting User Media ${err}`);
  }
}

function handleMasterICECandidateEvent(event) {
  if (event.candidate) {
    log("Send ICE candidates to slave");
    signal({
      action: "offer-candidate",
      candidate: event.candidate,
    });
  }
}

async function handleNegotiationNeededEvent() {
  try {
    log("Ready to negotiate");
    const offer = await masterPeer.createOffer(constraints);
    log("master.createOffer");

    // If the connection hasn't yet achieved the "stable" state,
    // return to the caller. Another negotiationneeded event
    // will be fired when the state stabilizes.
    if (masterPeer.signalingState != "stable") {
      log("     -- The connection isn't stable yet; postponing...");
      return;
    }

    await masterPeer.setLocalDescription(offer);
    log("master.setLocalDescription");

    signal({
      action: "offer",
      offer: masterPeer.localDescription,
    });
  } catch (error) {
    log(`Failed in Negotiation ${error}`);
  }
}
