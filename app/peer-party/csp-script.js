document.addEventListener("DOMContentLoaded", function addListeners() {
    updatePageAttr(getPage());
    updateStateAttr(getState());

    var createPartyButton = document.getElementById("create-party");
    var joinPartyButton = document.getElementById("join-party");

    var enterPartyButton = document.getElementById("enter-party");
    var becomeDJButton = document.getElementById("become-dj");

    var homePage = document.querySelector(".home-page");
    var partyPage = document.querySelector(".party-page");

    var partyNameInput = document.getElementById("input__party-name");

    var homeIcon = document.getElementById("home-icon");
    var logoutIcon = document.getElementById("logout-icon");
    var settingsIcon = document.getElementById("settings-icon");

    var serverInput = document.getElementById("server-ip");
    serverInput.value = localStorage.getItem("server");
    var serverSetButton = document.getElementById("add-server");

    var messageContainer = document.getElementById("message-container");

    createPartyButton.addEventListener("click", function () {
        chrome.runtime.sendMessage({ action: "create-party" });
    });

    joinPartyButton.addEventListener("click", function () {
        var partyId = partyNameInput.value;
        chrome.runtime.sendMessage({ action: "join-party", data: { partyId } });
    });

    becomeDJButton.addEventListener('click', function () {
        chrome.runtime.sendMessage({ action: "become-dj" });
    });

    homeIcon.addEventListener("click", function () {
        setPage("home");
        updatePageAttr(getPage());
    })

    logoutIcon.addEventListener("click", function () {
        chrome.runtime.sendMessage({ action: "logout" });
        localStorage.clear();
        updatePageAttr(getPage());
        updateStateAttr(getState());
    });

    settingsIcon.addEventListener("click", function () {
        setPage("settings");
        updatePageAttr(getPage());
    });

    serverSetButton.addEventListener("click", function () {
        var value = serverInput.value;
        localStorage.setItem("server",value);
    });

    chrome.runtime.onMessage.addListener(function handler(message) {
        var action = message.action;
        if (action == "party-creation-success") {
            setPage("party");
            setState("connected");
            updatePageAttr(getPage());
            updateStateAttr(getState());
        } else if (action == "party-creation-failure") {
            showMessage(message.data);
        } else if (action == "join-party-success") {
            setPage("party");
            setState("connected");
            updatePageAttr(getPage());
            updateStateAttr(getState());
        } else if (action == "dj-accept") {
            console.log("dj accepted");
            showMessage("dj accepted");
        } else if (action == "join-party") {
            console.log(message);
        }
    });

    function showMessage(msg) {
        messageContainer.innerText = msg;
        setTimeout(function () {
            messageContainer.innerText = ""
        }, 2000);
    }

});

function updateStateAttr(state) {
    document.body.setAttribute("state", state);
}

function updatePageAttr(page) {
    document.body.setAttribute("page", page);
}

function getState() {
    return localStorage.getItem("state") || "idle";
}

function getPage() {
    return localStorage.getItem("page") || "home";
}

function setState(state) {
    localStorage.setItem("state", state);
}

function setPage(page) {
    localStorage.setItem("page", page);
}
