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
            if(partyId) {
                getParty(partyId).handleClientRequest(connection, message);
            } else {
                console.log(message);
            }
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
    this.partyMembers = [];
    this.partyId = "navin";
    connection.partyId = this.partyId;
}
Party.prototype.getClient = function getClient(clientId) {
    return this.partyMembers.filter(client => client.id == clientId)[0];
}
Party.prototype.handleClientRequest = function handleClientRequest(connection, message) {
    var action = message.action;
    var data = message.data;
    if (action == "join-party") {
        var message = {
            action: "join-party-success"
        }
        // if authorised send signal else wait for admin permission
        connection.signal(message);
        this.partyMembers.push(connection);
        connection.partyId = this.partyId;
        if (this.DJ) {
            var message = {
                action: "join-party",
                data: {
                    clientIds: [connection.id]
                }
            }
            this.DJ.signal(message);
        }
    } else if (action == "become-dj") {
        if (this.DJ) {
            // handle dj change request
        } else {
            this.DJ = connection;
            connection.signal({ action: "dj-accept" });

            var clientIds = this.partyMembers.map(member => member.id);
            var message = {
                action: "join-party",
                data: { clientIds }
            }
            if (clientIds.length > 0) {
                connection.signal(message);
            }
        }
    } else if (action == "offer") {
        var offer = data.offer;
        var clientId = data.clientId;
        var client = this.getClient(clientId);
        var message = {
            action: "offer",
            data: {
                offer,
                clientId
            }
        }
        client.signal(message);
    } else if (action == "candidate") {
        var candidate = data.candidate;
        var clientId = data.clientId;
        var message = {
            action: "candidate",
            data: {
                candidate,
                clientId
            }
        }
        var client = this.getClient(clientId);
        client.signal(message);
    } else if (action == "answer") {
        var answer = data.answer;
        var clientId = data.clientId;
        var message = {
            action: "answer",
            data: {
                answer,
                clientId
            }
        }
        this.DJ.signal(message);
    }
}

module.exports = PartyManager();