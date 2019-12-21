const utils = require("./utils");

function PartyManager() {
    var activeParties = {};
    function getParty(partyId) {
        return activeParties[partyId];
    }
    function createParty(connection, invited) {
        var party = new Party(connection, invited);
        activeParties[party.partyId] = party;
        console.log(`party created : ${party.partyId}`);
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
    connection.partyId = this.partyId;
    connection.on("close",this.removeMember);
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
    member.on("close", this.removeMember);
}

Party.prototype.getMember = function getMember(id) {
    return this.partyMembers.filter(member => member.id == id);
}

Party.prototype.setDJ = function setDJ(dj) {
    this.DJ = dj;
}

Party.prototype.isInvited = function isInvited(connectionId) {
    // return this.invited.includes(connectionId);
    return true;
}

Party.prototype.removeMember = function removeMember(member) {
    console.log("remove member");
    
}

Party.prototype.removeAdmin = function removeAdmin(){

}



module.exports = PartyManager();