function joinParty(partyName){
    localStorage.setItem("partyId",partyName);
    signal({
        clientType : "slave",
        action : "join-party"
    });
}

var actions = {
    "answer-request": function acceptOfferAndSendAnswer(data) {
        var offer = data.offer;
        console.log(offer);
        // createPeerConnection(iceServers);
        // masterPeer.onnegotiationneeded = handleNegotiationNeededEvent;
    }
}