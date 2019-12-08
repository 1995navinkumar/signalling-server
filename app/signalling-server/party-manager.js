function PartyManager() {
    var activeParties = {};
    function handleClientRequest(connection,message) {
        var action = message.action;
        var partyId = connection.partyId;
        if (action == "create-party") {
            createParty();
        } else if (action == "end-party") {
            endParty(partyId);
        } else {
            getParty(partyId).handleClientRequest(connection,message);
        }
    }
    function getParty(partyId) {
        return activeParties[partyId];
    }
    function createParty() {
        var party = new Party();
        activeParties[party.partyId] = party;
        console.log("party created");
    }

    function endParty(partyId) {
        delete activeParties[partyId];
        console.log("party ended!");
    }
    return {
        handleClientRequest
    }
}

function Party() {
    this.DJ = undefined;
    this.partyMembers = {};
    this.partyId = Math.random();
}
Party.prototype.handleClientRequest = function handleClientRequest(message) {
    console.log(message);
}

module.exports = PartyManager();