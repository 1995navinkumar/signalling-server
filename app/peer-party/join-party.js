var slavePeer;

async function joinParty(partyName) {
  await Socket({ username: "harish" });
  sessionStorage.setItem("partyId", partyName);
}

function streamReceiver({ streams: [stream] }) {
  log(stream);
  if (audioPlayer.srcObject) return;
  audioPlayer.srcObject = stream;
  audioPlayer.play();
}

async function sendAudio() {
  log("add slave track");
  const gumStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });

  for (const track of gumStream.getTracks()) {
    log(track);
    slavePeer.addTrack(track, gumStream);
  }
}

function createPeerConnection(iceServers) {
  slavePeer = new RTCPeerConnection({
    iceServers,
  });
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
    var desc = new RTCSessionDescription(data.offer);

    createPeerConnection(iceServers);

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
      log("  - Setting remote description");
      await sendAudio();
      await slavePeer.setRemoteDescription(desc);

      let answer = await slavePeer.createAnswer(constraints);
      log(answer);
      await slavePeer.setLocalDescription(answer);

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
