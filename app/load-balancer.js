const PartyManager = require("./party-manager");

var request = {
    "create-party": function createParty(requester, message) {
        var data = message.data || {};
        if (!requester.partyId) {
            var party = PartyManager.createParty(requester, data.invited);
            requester.respond({ type: "party-creation-success", data: { partyId: party.partyId } });
        } else {
            requester.respond({ type: "party-creation-failure", data: { reason: "cannot create another party" } });
        }
    },
    "join-party": function joinParty(requester, message) {
        if (!requester.partyId) {
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
                admin.forward(requester, message);
            }
        } else {
            requester.respond({ type: "join-party-failure", data: { reason: "cannot join another party" } })
        }
    },
    "become-dj": function becomeDJ(requester, message) {
        var { data } = message;
        var party = PartyManager.getParty(requester.partyId);
        if (party.isAdmin(requester)) {
            party.setDJ(requester);
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