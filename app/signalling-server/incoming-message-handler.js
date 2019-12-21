const PartyManager = require("./party-manager");

var request = {
    "create-party": function createParty(connection, message) {
        var data = message.data || {};
        var outgoing = {};
        message.outgoing = outgoing;
        try {
            var party = PartyManager.createParty(connection, data.invited);
            outgoing.partyId = party.partyId;
            outgoing.status = "success";
        } catch (error) {
            console.log("Error in creating party", error);
            outgoing.status = "failure";
        }
        return message;
    },
    "join-party": function joinParty(connection, message) {
        var partyId = message.data.partyId;
        var party = PartyManager.getParty(partyId);
        var data = message.data;
        var isInvited = party.isInvited(connection);
        if (isInvited) {
            party.addMember(connection);
            data.status = "success";
            if (party.hasDJ()) {
                data.memberIds = [connection.id];
                var dj = party.getDJ();
                dj.outgoingMessageHandler(message);
            }
        } else {
            // notify admin about the request
            var admin = party.getAdmin();
            data.clientId = connection.id;
            admin.outgoingMessageHandler(message);
        }
        return message;
    },
    "become-dj": function becomeDJ(connection, message) {
        var { data } = message;
        var party = PartyManager.getParty(connection.partyId);
        if (party.hasDJ()) {
            var admin = party.getAdmin();
            data.memberId = connection.id;
            data.status = "pending";
            admin.outgoingMessageHandler(message);
        } else {
            party.setDJ(connection);
            data.memberIds = party.getMemberIds();
        }
        return message;
    },
    "end-party": function endParty(connection, message) {

    },
    "quit-party": function quitParty(connection, message) {

    }
};

function rtc(connection, message) {
    var { data } = message;
    var memberId = data.memberId;
    var party = PartyManager.getParty(connection.id);
    var member = party.getMember(memberId);
    data.memberId = connection.id;
    member.outgoingMessageHandler(message);
}

var webrtc = {
    "offer": rtc,
    "answer": rtc,
    "candidate": rtc
}

var message = {

}

var action = {

}

var categoryMapper = {
    request,
    webrtc,
    message,
    action
}

module.exports = categoryMapper;