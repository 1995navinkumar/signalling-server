function Connection(ws, sessionId) {
    this.ws = ws;
    this.id = sessionId;
    Object.assign(this, utils.composeEventHandler());
    this.incomingMessageHandler = MessageHandler.call(this, IncomingMessageHandler);
}

Connection.prototype.signal = function signal(message) {
    this.ws.send(JSON.stringify(message))
}

Connection.prototype.request = function request(message) {
    this.signal(message);
}

Connection.prototype.respond = function respond(to, message) {
    message.category = "response";
    message.data.memberId = to;
    this.signal(message);
}

Connection.prototype.action = function action(message) {
    message.category = "action";
    this.signal(message);
}

Connection.prototype.webrtc = function webrtc(message) {
    message.category = "webrtc";
    this.signal(message);
}

function MessageHandler(categoryMapper) {
    return (message) => {
        if (message) {
            console.log(message);
            var { category, type } = message;
            return categoryMapper[category][type](this, message);
        }
    }
}