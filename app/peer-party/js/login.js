document.addEventListener("DOMContentLoaded", function addListeners() {
   
   
    var logoutIcon = document.getElementById("logout-icon");
    logoutIcon.addEventListener("click", function () {
        chrome.runtime.sendMessage({ action: "logout" });
        clearState();
        updatePageAttr(getPage());
        updateStateAttr(getState());
    });

    chrome.runtime.onMessage.addListener(function handler(message) { })

})