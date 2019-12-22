chrome.runtime.onMessage.addListener(MessageHandler.call(chrome.runtime, categoryMapper));

function MessageHandler(categoryMapper) {
    return (message) => {
        console.log(message);
        var { category, type } = message;
        return categoryMapper[category][type](this, data);
    }
}

var login = {
    login: function login(popup, data) {
        ConnectionManager.createConnection().then(connection => {
            popup.sendMessage({ category: "login", type: "login-success" });
        })
    },
    logout: function logout(popup, data) {
        ConnectionManager.terminateConnection();
        popup.sendMessage({ category: "login", type: "logout-success" });
    }
}

var categoryMapper = {
    login,
    home,
    party
}