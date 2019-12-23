document.addEventListener("DOMContentLoaded", function addListeners() {
    var loginButton = document.getElementById("login-button");
    var logoutIcon = document.getElementById("logout-icon");

    loginButton.addEventListener("click", function () {
        // connect to signalling server and redirect to home page if connected
        chrome.runtime.sendMessage({
            page: "login",
            type: "login"
        });
    });


    logoutIcon.addEventListener("click", function () {
        chrome.runtime.sendMessage({
            page: "login",
            type: "logout"
        });

    });



    chrome.runtime.onMessage.addListener(function handler(message) {
        var page = message.page;
        var type = message.type;
        if (page == "login") {
            if (type == "login-success") {
                redirectTo("home");
                logoutIcon.style.display = "block";
            } else if (type == "logout-success") {
                redirectTo("login");
                logoutIcon.style.display = "none";
            }
        }
    })

})