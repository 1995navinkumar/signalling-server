function joinParty(partyName){
    localStorage.setItem("partyId",partyName);
    signal({
        clientType : "slave",
        action : "join-party"
    });
}