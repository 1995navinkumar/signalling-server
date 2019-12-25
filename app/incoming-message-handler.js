const PartyManager = require("./party-manager");

var request = {
    "create-party": function createParty(requester, message) {
        var data = message.data || {};
        try {
            var party = PartyManager.createParty(requester, data.invited);
            requester.respond({ type: "party-creation-success", data: { partyId: party.partyId } });
        } catch (error) {
            requester.respond({ type: "party-creation-failure" });
            logger.error("Error in creating party", error);
        }
    },
    "join-party": function joinParty(requester, message) {
        var data = message.data;
        var partyId = data.partyId;
        var party = PartyManager.getParty(partyId);
        var isInvited = party.isInvited(requester);
        if (isInvited) {
            party.addMember(requester);
            requester.respond({ type: "join-party-success" });
            if (party.hasDJ()) {
                var dj = party.getDJ();
                dj.notify({ type: "join-party", data: { memberIds: [requester.id] } });
            }

        } else {
            // notify admin about the request
            var admin = party.getAdmin();
            admin.forward(connection, message);
        }
    },
    "become-dj": function becomeDJ(requester, message) {
        var { data } = message;
        var party = PartyManager.getParty(requester.partyId);
        if (party.isAdmin(requester)) {
            requester.respond({ type: "dj-accept" });
            requester.notify({ type: "join-party", data: { memberIds: party.getMemberIds() } });
        } else {
            var admin = party.getAdmin();
            admin.forward(requester, message);
            requester.notify({ type: "become-dj-pending" });
        }
    },
    "end-party": function endParty(connection, message) {

    },
    "quit-party": function quitParty(connection, message) {

    }
};

function rtc(sender, message) {
    var { data } = message;
    var recipientId = data.memberId;
    var party = PartyManager.getParty(recipientId);
    var recipient = party.getMember(recipientId);
    recipient.forward(sender, message);
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