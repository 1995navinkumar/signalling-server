import { describe } from 'riteway';

const PartyManager = require("../app/party-manager");

const ConnectionManager = require("../app/connection-manager");

var connection1 = ConnectionManager.createConnection({ name: "navin" }, "navinkumar@gmail.com");

var party = PartyManager.createParty(connection1, []);

describe('party.getMemberIds', async assert => {
    const should = "get members";
    party.setDJ(connection1);
    assert({
        given: "",
        should,
        actual: party.getMemberIds(),
        expected: ["navinkumar@gmail.com"]
    })
});

