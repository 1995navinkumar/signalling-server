const url = require('url');
const uuid = require("./utils").uuid;

const AuthUtil = {
    registeredUsers: [{
        username: "navin",
        password: "navin"
    }, {
        username: "harish",
        password: "harish"
    }],
    authorize: function authorize(req) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;
        return query.email || uuid();
    }
}

module.exports = AuthUtil;