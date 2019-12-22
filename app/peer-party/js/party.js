document.addEventListener("DOMContentLoaded", function addListeners() {
    var becomeDJButton = document.getElementById("become-dj");
    becomeDJButton.addEventListener('click', function () {
        chrome.runtime.sendMessage({ action: "become-dj" });
    });
    chrome.runtime.onMessage.addListener(function handler(message) { })

});