document.addEventListener("DOMContentLoaded", function addListeners() {
    var createPartyButton = document.getElementById("create-party");
    var joinPartyButton = document.getElementById("join-party");

    var enterPartyButton = document.getElementById("enter-party");
    var becomeDJButton = document.getElementById("become-dj");

    var homePage = document.querySelector(".home-page");
    var partyPage = document.querySelector(".party-page");

    var partyNameInput = document.getElementById("input__party-name");

    var messageContainer = document.getElementById("message-container");

    partyPage.style.setProperty("display", "none");

    createPartyButton.addEventListener("click", function () {
        chrome.runtime.sendMessage({ type: "create-party" });
        joinPartyButton.disabled = true;
        createPartyButton.disabled = true;
    });

    joinPartyButton.addEventListener("click", function () {
        var partyId = partyNameInput.value;
        chrome.runtime.sendMessage({ type: "join-party", partyId: partyId });
        joinPartyButton.disabled = true;
        createPartyButton.disabled = true;
    });

    chrome.runtime.onMessage.addListener(function handler(message) {
        var action = message.action;
        if (action == "party-creation-success") {
            homePage.style.setProperty("display", "none");
            partyPage.style.removeProperty("display");
        } else if (action == "party-creation-failure") {
            showMessage(message.data);
        }
    });

    function showMessage(msg) {
        messageContainer.innerText = msg;
        setTimeout(function () {
            messageContainer.innerText = ""
        }, 2000);
    }

});
