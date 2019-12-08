const AuthUtil = {
    registeredUsers: [{
        username: "navin",
        password: "navin"
    }, {
        username: "harish",
        password: "harish"
    }],
    authorize: function authorize(req) {
        return req.headers['sec-websocket-key']
    }
}

module.exports = AuthUtil;