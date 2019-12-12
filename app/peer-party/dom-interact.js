chrome.runtime.onMessage.addListener(function handler(message) {
    var type = message.type;
    if (type == "create-party") {
        partyCreator(message.partyName, actions).then(audio => {
            sendAudio = audio;
            console.log(sendAudio);
        });
    } else if (type == "send-audio") {
        sendAudio();
    } else if (type == "join-party") {
        partyJoiner(message.partyName, actions);
    }
})