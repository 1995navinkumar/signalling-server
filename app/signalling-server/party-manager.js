function PartyManager() {
    var activeParties = {};
    function handleClientRequest(connection,message) {
        var action = message.action;
        var partyId = connection.partyId;
        if (action == "create-party") {
            createParty(connection);
        } else if (action == "end-party") {
            endParty(connection,partyId);
        } else {
            getParty(partyId).handleClientRequest(connection,message);
        }
    }
    function getParty(partyId) {
        return activeParties[partyId];
    }
    function createParty(connection) {
        var party = new Party(connection);
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

function Party(connection) {
    this.DJ = undefined;
    this.admin = connection;
    this.partyMembers = {};
    this.partyId = Math.random();
    connection.partyId = partyId;
}
Party.prototype.handleClientRequest = function handleClientRequest(message) {
    console.log(message);
}

module.exports = PartyManager();