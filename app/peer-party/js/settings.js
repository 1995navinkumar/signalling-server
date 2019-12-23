document.addEventListener("DOMContentLoaded", function addListeners() {
    var settingsIcon = document.getElementById("settings-icon");
    var serverInput = document.getElementById("server-ip");
    serverInput.value = localStorage.getItem("server");
    var serverSetButton = document.getElementById("add-server");
    settingsIcon.addEventListener("click", function () {
        redirectTo("settings");
    });
    serverSetButton.addEventListener("click", function () {
        var value = serverInput.value;
        localStorage.setItem("server", value);
    });
    chrome.runtime.onMessage.addListener(function handler(message) { })

})