chrome.runtime.onMessage.addListener(function handler(message) {
    signal(message);
})

function signal(message) {
    socket.send(JSON.stringify(message));
}