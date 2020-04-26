const PartyManager = require("./party-manager");
const logger = require("../app-logger");


function authorise(requester, message) {
    if (requester.partyId) {
        return true;
    } else {
        requester.respond({ type: "unauthorised", data: { reason: "Unauthorised request" } });
        return false;
    }
}
var request = {
    "create-party": function createPartyValidator(requester, message) {
        if (requester.partyId) {
            requester.respond({ type: "party-creation-failure", data: { reason: "cannot create another party" } });
            return false;
        }
        return true;
    },
    "join-party": function joinPartyValidator(requester, message) {
        if (requester.partyId) {
            requester.respond({ type: "join-party-failure", data: { reason: "cannot join another party" } });
            return false;
        } else {
            var partyId = message.data.partyId;
            console.log(partyId);

            var party = PartyManager.getParty(partyId);
            logger.info(`party : ${party}`);
            // requester.respond({ type: "join-party-failure", data: { reason: "No such party exists !" } });

            return party ? true : false;
        }
    },
    "become-dj": authorise
}

var action = {
    "end-party": function endPartyValidator(requester, message) {
        var authorised = authorise(requester, message);
        if (authorised) {
            var party = PartyManager.getParty(requester.partyId);
            if (party.isAdmin(requester)) {
                return true;
            } else {
                requester.respond({ type: "unauthorised", data: { reason: "Unauthorised request" } });
                return false;
            }
        }
    },
    "leave-party": authorise
}

var webrtc = {
    "offer": authorise,
    "answer": authorise,
    "candidate": authorise
}



var validator = {
    request,
    action,
    webrtc
}

module.exports = validator