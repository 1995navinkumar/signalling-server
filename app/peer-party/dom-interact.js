chrome.runtime.onMessage.addListener(function handler(message) {
    var action = message.action;
    if (action == "logout") {
        destroySocket();
    } else {
        signal(message);
    }
})