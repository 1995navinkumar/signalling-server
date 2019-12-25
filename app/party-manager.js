const utils = require("./utils");

function PartyManager() {
    var activeParties = {};
    function getParty(partyId) {
        return activeParties[partyId];
    }
    function createParty(connection, invited) {
        var party = new Party(connection, invited);
        activeParties[party.partyId] = party;
        logger.info(`party created : ${party.partyId}`);
        return party;
    }

    function endParty(partyId) {
        delete activeParties[partyId];
        logger.info("party ended!" + partyId);
    }
    return {
        getParty, createParty, endParty
    }
}

/**
 * 
 * @param {*} member 
 * @param {*} invited 
 * 
 *  member type 
 *      0 - normal member
 *      1 - DJ
 *      2 - admin
 *      3 - admin + DJ
 */

function Party(member, invited) {
    this.DJ = undefined;
    this.partyMembers = [];
    this.invited = invited || [];
    this.partyId = utils.uuid();
    this.setAdmin(member);
    this.addMember(member);
}
Party.prototype.hasDJ = function hasDJ() {
    return this.DJ ? true : false;
}

Party.prototype.getDJ = function getDJ() {
    return this.DJ;
}

Party.prototype.setDJ = function setDJ(member) {
    if (this.DJ) {
        this.DJ.type -= 1;
    }
    member.type += 1;
    this.DJ = member;
}

Party.prototype.getAdmin = function getAdmin() {
    return this.admin;
}

Party.prototype.setAdmin = function setAdmin(member) {
    member.type += 2;
    this.admin = member;
}

Party.prototype.isAdmin = function isAdmin(member) {
    return member.type & 2;
}

Party.prototype.getMemberIds = function getMemberIds(level = 1) {
    return this.partyMembers.filter(member => !(member.type & level)).map(member => member.id);
}

Party.prototype.addMember = function addMember(member) {
    this.partyMembers.push(member);
    member.partyId = this.partyId;
    member.type = 0;
    member.on("close", this.removeMember.bind(this));
}

Party.prototype.getMember = function getMember(id) {
    return this.partyMembers.filter(member => member.id == id);
}


Party.prototype.isInvited = function isInvited(member) {
    // return this.invited.includes(member.id);
    return true;
}

Party.prototype.removeMember = function removeMember(member) {
    var memIndex = this.partyMembers.findIndex(partyMember => member.id == partyMember.id);
    this.partyMembers.splice(1, memIndex);
    if (member.type & 2) {
        //  admin removed
    }

    if (member.type & 1) {
        // dj removed
    } else {
        // member removed
    }

}

module.exports = PartyManager();