var request = {
    "create-party": function (connection, message) {
        var status = message.outgoing.status;
        var notify = {
            category: "notification"
        }
        if (status == "success") {
            notify.type = "party-creation-success"
            notify.data = {
                partyId: message.outgoing.partyId
            }
        } else {
            notify.type = "party-creation-failure";
        }
        connection.signal(notify);
    }
}

var webrtc = {

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