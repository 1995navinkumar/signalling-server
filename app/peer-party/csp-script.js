var createPartyButton, joinPartyButton, sendAudioButton, audioPlayer;
document.addEventListener("DOMContentLoaded", function addListeners() {
    createPartyButton = document.getElementById("createParty");
    joinPartyButton = document.getElementById("joinParty");
    sendAudioButton = document.getElementById("sendAudio");

    createPartyButton.addEventListener("click", function () {
        chrome.runtime.sendMessage({type : "create-party",partyName : "navin"});
        joinPartyButton.disabled = true;
        createPartyButton.disabled = true;
    });

    joinPartyButton.addEventListener("click", function () {
        chrome.runtime.sendMessage({type : "join-party",partyName : "navin"});
        joinPartyButton.disabled = true;
        createPartyButton.disabled = true;
    });

    sendAudioButton.onclick = () => {
        sendAudioButton.disabled = true;
        chrome.runtime.sendMessage({type : "send-audio",});
    }

    audioPlayer = document.getElementById("audio-player");
});
