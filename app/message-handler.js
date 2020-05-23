const PartyManager = require("./party-manager");
const ConnectionManager = require("./connection-manager");

var request = {
    "create-party": function createParty(requester, message) {
        var { data } = message;
        var party = PartyManager.createParty(requester, data && data.invited);
        console.log(party.partyId);
        requester.respond({ type: "party-creation-success", data: { partyId: party.partyId } });
    },
    "join-party": function joinParty(requester, message) {
        var { data } = message;
        var partyId = data.partyId;
        console.log(partyId);
        
        var party = PartyManager.getParty(partyId);
        // var isInvited = party.isInvited(requester);
        var isInvited = true;
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
        }
    }
};

var response = {
    "join-party": function joinParty(responder, message) {
        var accepted = message.data.accepted;
        var requester = ConnectionManager.getConnection(message.data.memberId);
        requester.forward(responder, message);
        if (accepted) {
            var party = PartyManager.getParty(responder.partyId);
            party.addMember(requester);
            var dj = party.getDJ();
            dj.notify({ type: "join-party", data: { memberIds: [requester.id] } });
        }
    },
    "become-dj": function becomeDJ(responder, message) {
        var accepted = message.data.accepted;
        var requester = ConnectionManager.getConnection(message.data.memberId);
        requester.forward(responder, message);
        if (accepted) {
            var party = PartyManager.getParty(responder.partyId);
            party.setDJ(requester);
            requester.notify({ type: "join-party", data: { memberIds: party.getMemberIds() } });
        }
    }
}

function rtc(sender, message) {
    var { data } = message;
    var recipientId = data.memberId;
    console.log(recipientId);
    var recipient = ConnectionManager.getConnection(recipientId);
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
    "end-party": function endParty(requester, message) {
        PartyManager.endParty(requester.partyId);
    },
    "leave-party": function quitParty(requester, message) {
        var party = PartyManager.getParty(requester.partyId);
        party.removeMember(requester);
    }
}

var api = {
    notification: function getNotification(requester) {
        requester.api({
            type: "notification-list",
            data: requester.getNotificationList()
        });
    }
}



var categoryMapper = {
    request,
    webrtc,
    message,
    action,
    response,
    api
}

module.exports = categoryMapper;