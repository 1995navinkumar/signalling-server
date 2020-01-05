import { describe } from 'riteway';

const ConnectionManager = require("../app/connection-manager");

var connection1 = ConnectionManager.createConnection({ name: "navin" }, "navinkumar@gmail.com");
var connection2 = ConnectionManager.createConnection({ name: "harish" }, "harish@gmail.com");
var connection3 = ConnectionManager.createConnection({ name: "sandeep" }, "sandeep@gmail.com");

describe('ConnectionManager.getConnectionCount()', async assert => {
    const should = "Get total active connection count";
    assert({
        given: "",
        should,
        actual: ConnectionManager.getConnectionCount(),
        expected: 3
    })
});

describe('ConnectionManager.getConnection()', async assert => {
    const should = 'Get expected Connection Object from ConnectionManager';
    assert({
        given: 'ws , id',
        should,
        actual: ConnectionManager.getConnection("navinkumar@gmail.com"),
        expected: connection1
    });

    assert({
        given: 'ws , id',
        should,
        actual: typeof ConnectionManager.getConnection("dinesh@gmail.com") == "undefined",
        expected: true
    });

    assert({
        given: 'ws , id',
        should,
        actual: ConnectionManager.getConnection("sandeep@gmail.com"),
        expected: connection3
    });

});

describe('ConnectionManager.terminateConnection()', async assert => {
    const should = 'terminate an active connection and remove it from activeConnections object';
    assert({
        given: 'connection',
        should,
        actual: ConnectionManager.terminateConnection(connection1)(),
        expected: typeof ConnectionManager.getConnection("navinkumar@gmail.com") == "undefined"
    });

    assert({
        given: 'connection',
        should: 'decrement connection count property by 1',
        actual: ConnectionManager.getConnectionCount(),
        expected: 2
    });
});

describe('ConnectionManager.forEach()', async assert => {
    const should = 'execute a function for each connection object';
    var result = [];
    var callback = function (connection) {
        result.push(connection.ws.name);
    }
    ConnectionManager.forEach(callback);

    assert({
        given: 'Function',
        should,
        actual: result,
        expected: ["harish", "sandeep"]
    });
});