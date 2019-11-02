const WebSocket = require("ws");
const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);
let clients = {};

module.exports = function Socket() {
    const wsServer = new WebSocket.Server({ port: 8080 });
    wsServer.on('connection', function connection(ws, req) {
        storeClientWS(ws, req);
        ws.on('message', pipe(messageParser, actionInvoker));
    });
}

function storeClientWS(ws, req) {
    //has to improve
    var cookie = req.headers.cookie;
    var clientId = cookie.split("=")[1];
    clients[clientId] = ws;
}

function messageParser(message) {
    return JSON.parse(message);
}

function actionInvoker(data) {
    var action = data.action;
    return actions[action](data);
}

var actions = {
    "create-party": function createParty(data) {
        var party = PartyManager.newParty(data.partyId);
        party.addClient("master", data.clientId);
    },
    "join-party": function (data) {
        var party = PartyManager.getParty(data.partyId);
        party.addClient("slave", data.clientId);
        var masterClient = party.getMasterClient();
        signal(masterClient.id,{
            action: "offer-request"
        });
    },
    "offer": function createOffer(data) {
        var party = PartyManager.getParty(data.partyId);
        var client = party.getClient(data.clientId);
        client.description = data.offer;
    }
}

function signal(clientId, message) {
    var socket = clients[clientId];
    socket.send(JSON.stringify(message));
}


var PartyManager = (function PartyManager() {
    var sessions = {};
    function newParty(id) {
        var id;
        var clients = {};
        var masterClient;
        function getClient(clientId) {
            return clients[clientId];
        }
        function getMasterClient() {
            return masterClient;
        }
        function addClient( type, id ) {
            var description;
            var client = {
                description,
                type,
                id
            }
            clients[id] = client;
            if (!masterClient && type == "master") {
                masterClient = client;
            }
            return client;
        }
        var party = { id, getClient, addClient, getMasterClient };
        sessions[id] = party
        return party;
    }
    function getParty(id) {
        return sessions[id];
    }
    return {
        newParty,
        getParty
    }
})();