var slavePeer;

async function joinParty(partyName) {
  await Socket({ username: "harish" });
  sessionStorage.setItem("partyId", partyName);
}

function streamReceiver({ streams: [stream] }) {
  log("Received stream from master");
  if (audioPlayer.srcObject) return;
  audioPlayer.srcObject = stream;
  audioPlayer.play();
  setTimeout(audioPlayer.play, 10);
}

async function sendAudio() {
  try {
    log("getUserMedia");
    const gumStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    for (const track of gumStream.getTracks()) {
      slavePeer.addTrack(track, gumStream);
    }
    log("slave.addTrack");
  } catch (err) {
    log("Error in getting user media");
  }
}

function createPeerConnection(iceServers) {
  slavePeer = new RTCPeerConnection({
    iceServers,
  });
  log("new RTCPeerConnection");
  slavePeer.onnegotiationneeded = async function () {
    console.log("negotiation needed event slave");
    log(slavePeer.signalingState);
  };
  slavePeer.ontrack = streamReceiver;
  slavePeer.onicecandidate = handleSlaveICECandidateEvent;
}

function handleSlaveICECandidateEvent(event) {
  log("ice candidate handling");
  if (event.candidate) {
    signal({
      action: "offer-candidate",
      candidate: event.candidate,
    });
  }
}

Object.assign(actions, {
  "connection-success": function () {
    signal({
      clientType: "slave",
      action: "join-party",
    });
  },
  "answer-request": async function acceptOfferAndSendAnswer(data) {
    log("Offer Obtained from Master");
    createPeerConnection(iceServers);

    var desc = new RTCSessionDescription(data.offer);
    log("new RTCSessionDescription");

    // If the connection isn't stable yet, wait for it...

    if (slavePeer.signalingState != "stable") {
      log("  - But the signaling state isn't stable, so triggering rollback");

      // Set the local and remove descriptions for rollback; don't proceed
      // until both return.
      await Promise.all([
        slavePeer.setLocalDescription({ type: "rollback" }),
        slavePeer.setRemoteDescription(desc),
      ]);
      return;
    } else {
      log("slave.setRemoteDescription");
      await slavePeer.setRemoteDescription(desc);
      await sendAudio();

      let answer = await slavePeer.createAnswer(constraints);
      log("slave.createAnswer");
      await slavePeer.setLocalDescription(answer);
      log("slave.setLocalDescription");

      signal({
        action: "answer",
        answer: slavePeer.localDescription,
      });
    }
  },
  "set-remote-candidate": function setRemoteCandidate({
    candidate: remoteCandidate,
  }) {
    if (slavePeer.remoteDescription) {
      var candidate = new RTCIceCandidate(remoteCandidate);
      log("Adding received ICE candidate from master");
      slavePeer.addIceCandidate(candidate);
    }
  },
});
