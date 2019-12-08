const AuthUtil = {
    registeredUsers: [{
        username: "navin",
        password: "navin"
    }, {
        username: "harish",
        password: "harish"
    }],
    authorize: function authorize(req) {
        return req.sessionId || "navin";
    }
}

module.exports = AuthUtil;