var dependencyConfig = {
    "create-party": {
        id: "create-party",
        type: "script",
        url: "./create-party.js"
    },
    "join-party": {
        id: "join-party",
        type: "script",
        url: "./join-party.js"
    }
}
AssetLoader.setDependencyConfig(dependencyConfig);

//---------------------------------------------------------------------------------------

var createPartyButton, joinPartyButton, sendAudioButton, audioPlayer;
document.addEventListener("DOMContentLoaded", function addListeners() {
    createPartyButton = document.getElementById("createParty");
    joinPartyButton = document.getElementById("joinParty");
    sendAudioButton = document.getElementById("sendAudio");

    createPartyButton.addEventListener("click", function () {
        AssetLoader.require("create-party").then(module => {
            // var partyName = prompt("Enter new party name to create","");
            createParty("navin");
            joinPartyButton.disabled = true;
            createPartyButton.disabled = true;
        });
    });

    joinPartyButton.addEventListener("click", function () {
        AssetLoader.require("join-party").then(module => {
            // var partyName = prompt("Enter party name to join");
            joinParty("navin");
            createPartyButton.disabled = true;
            joinPartyButton.disabled = true;
        });
    });

    sendAudioButton.onclick = () => {
        sendAudioButton.disabled = true;
        sendAudio();
    }

    audioPlayer = document.getElementById("audio-player");
});
