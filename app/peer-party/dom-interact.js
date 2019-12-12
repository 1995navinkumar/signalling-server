chrome.runtime.onMessage.addListener(function handler(message) {
    var type = message.type;
    if (type == "create-party") {
        signal({
            action: "create-party"
        });
    } else if (type == "send-audio") {
        sendAudio();
    } else if (type == "join-party") {
        signal({
            action: "join-party"
        });
    }
})

function signal(message) {
    socket.send(JSON.stringify(message));
}

var actions = {
    "party-creation-success": function (data) {
        chrome.runtime.sendMessage({action: "party-creation-success"});
    }
}

function actionInvoker(data) {
    var action = data.action;
    action ? actions[action](data) : log(data);
}