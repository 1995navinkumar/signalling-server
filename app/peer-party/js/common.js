document.addEventListener("DOMContentLoaded", function addListeners() {
    setPageAndState();
});

function setPageAndState() {
    var state = localStorage.getItem("state") || "disconnected";
    var page = localStorage.getItem("page") || "login";
    document.body.setAttribute("state", state);
    document.body.setAttribute("page", page);
}

function updateState(state) {
    localStorage.setItem("state", state);
    document.body.setAttribute("state", state);
}

function updatePage(page) {
    localStorage.setItem("page", page);
    document.body.setAttribute("page", page);
}

function showMessage(msg) {
    messageContainer.innerText = msg;
    setTimeout(function () {
        messageContainer.innerText = ""
    }, 2000);
}