chrome.runtime.onMessage.addListener(function handler(message) {
    var type = message.type;
    if (type == "create-party") {
        signal({
            action: "create-party"
        });
    } else if (type == "send-audio") {
        sendAudio();
    } else if (type == "join-party") {
        partyJoiner(message.partyName, actions);
    }
})

function signal(message) {
    socket.send(JSON.stringify(message));
}