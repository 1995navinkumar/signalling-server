import { describe } from 'riteway';

const ConnectionManager = require("../app/connection-manager");

var connection = ConnectionManager.createConnection({}, "1995navinkumar@gmail.com");

describe('ConnectionManager.createConnection()', async assert => {
    const should = 'Create new Connection Object and add it to activeConnections';
    var expected = connection;
    var actual = ConnectionManager.getConnection("1995navinkumar@gmail.com");
    assert({
        given: 'ws , id',
        should,
        actual,
        expected
    });
});

describe('ConnectionManager.terminateConnection()', async assert => {
    const should = 'terminate an active connection and remove it from activeConnections object';
    var actual = ConnectionManager.terminateConnection(connection)();
    var expected = typeof ConnectionManager.getConnection("1995navinkumar@gmail.com") == "undefined";
    assert({
        given: 'connection',
        should,
        actual,
        expected
    });
});