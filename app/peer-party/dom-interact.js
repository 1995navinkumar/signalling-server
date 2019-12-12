chrome.runtime.onMessage.addListener(function handler(message) {
    signal(message);
})

function signal(message) {
    socket.send(JSON.stringify(message));
}

var actions = {
    "party-creation-success": function (data) {
        chrome.runtime.sendMessage({action: "party-creation-success"});
    }
}

function actionInvoker(data) {
    var action = data.action;
    action ? actions[action](data) : log(data);
}