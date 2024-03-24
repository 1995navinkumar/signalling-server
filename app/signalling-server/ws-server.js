const WebSocket = require("ws");
const uuidv1 = require("uuid/v1");
const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((y, f) => f(y), x);
let liveSockets = {};
let wss;

function noop() {
  console.log("pinging active clients");
}

function heartbeat() {
  this.isAlive = true;
}

module.exports = function Socket() {
  wss = new WebSocket.Server({ port: 8080 });
  wss.on("connection", function connection(ws, req) {
    storeClientWS(ws);
    ws.on("message", pipe(messageParser, actionInvoker));
    ws.isAlive = true;
    ws.on("pong", heartbeat);
    ws.on("close", function () {
      console.log("terminating broken connections");
      liveSockets[ws.protocol] = undefined;
    });
  });
};

setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
      console.log("terminating broken connections");
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);

function storeClientWS(ws, req) {
  //has to improve
  var user = ws.protocol;
  // var uuid = uuidv1();
  liveSockets[user] = ws;
  ws.send(
    JSON.stringify({
      action: "connection",
      uuid: user,
    })
  );
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
    console.log("creating a party");
    var party = PartyManager.newParty(data.partyId);
    party.addClient("master", data.clientId);
  },
  "join-party": function joinParty(data) {
    console.log(`Join party ${data}`);
    var party = PartyManager.getParty(data.partyId);
    party.addClient("slave", data.clientId);
    var masterClient = party.getMasterClient();
    signal([masterClient], {
      action: "offer-request",
      clientId: data.clientId,
    });
  },
  offer: function sendOfferAndRequestAnswer(data) {
    console.log(`sendOffer ${data}`);
    var party = PartyManager.getParty(data.partyId);
    var client = party.getClient(data.clientId);
    client.description = data.offer;
    signal(party.getSlaveClients(), {
      action: "answer-request",
      offer: client.description,
    });
  },
  answer: function sendAnswer(data) {
    console.log(`sendAnswer ${data}`);
    var party = PartyManager.getParty(data.partyId);
    var client = party.getClient(data.clientId);
    client.description = data.answer;
    signal([party.getMasterClient()], {
      action: "answer-response",
      answer: client.description,
    });
  },
  "offer-candidate": function offerCandidate(data) {
    console.log(`offerCandidate ${data}`);
    var party = PartyManager.getParty(data.partyId);
    var client = party.getClient(data.clientId);
    var clientType = client.type;
    var message = {
      action: "set-remote-candidate",
      candidate: data.candidate,
    };
    if (clientType == "master") {
      signal(party.getSlaveClients(), message);
    } else {
      signal([party.getMasterClient()], message);
    }
  },
};

function signal(clients, message) {
  clients.forEach((client) => {
    var socket = liveSockets[client.id];
    console.log(`signalling socket with clientId : ${client.id}`);
    socket.send(JSON.stringify(message));
  });
}

var PartyManager = (function PartyManager() {
  var sessions = {};
  function newParty(id) {
    var id;
    var clients = [];
    function getClient(clientId) {
      return clients.filter((client) => client.id == clientId)[0];
    }
    function getMasterClient() {
      return clients.filter((client) => client.type == "master")[0];
    }
    function getSlaveClients() {
      return clients.filter((client) => client.type == "slave");
    }
    function addClient(type, id) {
      var description;
      var client = {
        description,
        type,
        id,
      };
      clients.push(client);
      return client;
    }
    var party = { id, getClient, addClient, getMasterClient, getSlaveClients };
    sessions[id] = party;
    return party;
  }
  function getParty(id) {
    return sessions[id];
  }
  return {
    newParty,
    getParty,
  };
})();
