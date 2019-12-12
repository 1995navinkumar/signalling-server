function PartyManager() {
    var activeParties = {};
    function handleClientRequest(connection, message) {
        var action = message.action;
        var partyId = connection.partyId || (message.data && message.data.partyId);
        if (action == "create-party") {
            var party = createParty(connection);
            var message = {
                action: "party-creation-success",
                data: {
                    partyId: party.partyId
                }
            }
            connection.signal(message);
        } else if (action == "end-party") {
            endParty(connection, partyId);
        } else {
            getParty(partyId).handleClientRequest(connection, message);
        }
    }
    function getParty(partyId) {
        return activeParties[partyId];
    }
    function createParty(connection) {
        var party = new Party(connection);
        activeParties[party.partyId] = party;
        console.log("party created");
        return party;
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
    this.partyMembers = [connection];
    this.partyId = "navin";
    connection.partyId = this.partyId;
}
Party.prototype.handleClientRequest = function handleClientRequest(connection, message) {
    var action = message.action;
    if (action == "join-party") {
        var message = {
            action : "join-party-success"
        }
        connection.signal(message)
    }
}

module.exports = PartyManager();