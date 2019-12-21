const IncomingMessageHandler = require("./incoming-message-handler");
const OutgoingMessageHandler = require("./outgoing-message-handler");
const utils = require("./utils");

function PartyManager() {
    var activeParties = {};
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
        getParty, createParty, endParty
    }
}


function Party(connection, invited) {
    this.DJ = undefined;
    this.admin = connection;
    this.partyMembers = [];
    this.invited = invited || [];
    this.partyId = utils.uuid();
    this.incomingMessageHandler = IncomingMessageHandler.call(this);
    this.outgoingMessageHandler = OutgoingMessageHandler.call(this);
    connection.partyId = this.partyId;
}
Party.prototype.hadDJ = function hasDJ() {
    return this.DJ ? true : false;
}

Party.prototype.getDJ = function getDJ() {
    return this.DJ;
}

Party.prototype.getAdmin = function getAdmin() {
    return this.admin;
}

Party.prototype.getMemberIds = function getMemberIds() {
    return this.partyMembers.map(member => member.id);
}

Party.prototype.addMember = function addMember(member) {
    this.partyMembers.push(member);
}

Party.prototype.getMember = function getMember(id) {
    return this.partyMembers.filter(member => member.id == id);
}

Party.prototype.setDJ = function setDJ(dj) {
    this.DJ = dj;
}

Party.prototype.isInvited = function isInvited(connectionId) {
    return this.invited.includes(connectionId);
}



module.exports = PartyManager();