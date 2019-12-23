document.addEventListener("DOMContentLoaded", function addListeners() {
    var createPartyButton = document.getElementById("create-party");
    var joinPartyButton = document.getElementById("join-party");
    var homeIcon = document.getElementById("home-icon");
    var partyNameInput = document.getElementById("input__party-name");


    createPartyButton.addEventListener("click", function () {
        createPartyButton.disabled = true;
        joinPartyButton.disabled = true;
        chrome.runtime.sendMessage({
            page: "home",
            type: "create-party"
        });
    });

    joinPartyButton.addEventListener("click", function () {
        var partyId = partyNameInput.value;
        joinPartyButton.disabled = true;
        chrome.runtime.sendMessage({ action: "join-party", data: { partyId } });
    });

    // homeIcon.addEventListener("click", function () {
    //     updatePage("home");
    // });

    chrome.runtime.onMessage.addListener(function handler(message) {
        var type = message.type;
        if (type == "party-creation-success") {
            updatePage("party");
            updateState("connected");
        } else if (type == "party-creation-failure") {
            showMessage(message.data);
        } else if (type == "join-party-success") {
            updatePage("party");
            updateState("connected");
        }
    })

    chrome.runtime.onMessage.addListener(function handler(message) {
        var page = message.page;
        var type = message.type;
        if (page == "home") {
            if (type == "party-creation-success") {
                redirectTo("party");
            }
        }
    })
})