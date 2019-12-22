document.addEventListener("DOMContentLoaded", function addListeners() {
    var loginButton = document.getElementById("login-button");
    var logoutIcon = document.getElementById("logout-icon");

    loginButton.addEventListener("click", function () {
        // connect to signalling server and redirect to home page if connected
        
    });


    logoutIcon.addEventListener("click", function () {
        chrome.runtime.sendMessage({ action: "logout" });
        clearState();
        updatePageAttr(getPage());
        updateStateAttr(getState());
    });



    chrome.runtime.onMessage.addListener(function handler(message) { })

})