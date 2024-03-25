sessionStorage.clear();

const iceServersTwilio = [
  {
    url: "stun:global.stun.twilio.com:3478",
    urls: "stun:global.stun.twilio.com:3478",
  },
  {
    url: "turn:global.turn.twilio.com:3478?transport=udp",
    username:
      "91c6a52e91e84e503e35a247d4b55272f77fdbf63718442e7a4b7229dbf250aa",
    urls: "turn:global.turn.twilio.com:3478?transport=udp",
    credential: "Un/t/nn6v76i4sIhzsSWPbJw7i4tq1LwThc7ODPN3Bo=",
  },
  {
    url: "turn:global.turn.twilio.com:3478?transport=tcp",
    username:
      "91c6a52e91e84e503e35a247d4b55272f77fdbf63718442e7a4b7229dbf250aa",
    urls: "turn:global.turn.twilio.com:3478?transport=tcp",
    credential: "Un/t/nn6v76i4sIhzsSWPbJw7i4tq1LwThc7ODPN3Bo=",
  },
  {
    url: "turn:global.turn.twilio.com:443?transport=tcp",
    username:
      "91c6a52e91e84e503e35a247d4b55272f77fdbf63718442e7a4b7229dbf250aa",
    urls: "turn:global.turn.twilio.com:443?transport=tcp",
    credential: "Un/t/nn6v76i4sIhzsSWPbJw7i4tq1LwThc7ODPN3Bo=",
  },
];

const iceServersKatcheri = [
  {
    url: "stun:144.24.128.160:7001",
    urls: "stun:144.24.128.160:7001",
  },
  {
    url: "turn:144.24.128.160:7001?transport=udp",
    username: "navin",
    urls: "turn:144.24.128.160:7001?transport=udp",
    credential: "rtc",
  },
  {
    url: "turn:144.24.128.160:5349?transport=tcp",
    username: "navin",
    urls: "turn:144.24.128.160:5349?transport=tcp",
    credential: "rtc",
  },
  // {
  //   url: "turn:global.turn.twilio.com:3478?transport=tcp",
  //   username:
  //     "91c6a52e91e84e503e35a247d4b55272f77fdbf63718442e7a4b7229dbf250aa",
  //   urls: "turn:global.turn.twilio.com:3478?transport=tcp",
  //   credential: "Un/t/nn6v76i4sIhzsSWPbJw7i4tq1LwThc7ODPN3Bo=",
  // },
  // {
  //   url: "turn:global.turn.twilio.com:443?transport=tcp",
  //   username:
  //     "91c6a52e91e84e503e35a247d4b55272f77fdbf63718442e7a4b7229dbf250aa",
  //   urls: "turn:global.turn.twilio.com:443?transport=tcp",
  //   credential: "Un/t/nn6v76i4sIhzsSWPbJw7i4tq1LwThc7ODPN3Bo=",
  // },
];

const iceServers = iceServersKatcheri;

const log = (msg) => {
  const logContainer = document.getElementById("log-container");
  const para = document.createElement("p");
  para.innerText = msg;
  logContainer.appendChild(para);
};

const constraints = {
  video: true,
};

const offerOptions = {
  offerToReceiveAudio: 1,
};

let socket;

function Socket({ username }) {
  return new Promise((resolve, reject) => {
    var hostName = location.hostname;
    var pathname = location.pathname;
    var connection;
    if (ENV === "production") {
      connection = new WebSocket(`wss://${hostName}${pathname}/ws`, username);
    } else {
      connection = new WebSocket(`ws://${hostName}:8080`, username);
    }
    connection.onopen = function (e, f) {
      resolve(connection);
    };
    connection.onmessage = pipe(messageParser, actionInvoker);
    connection.onerror = function (e) {
      log("error in connection establishment");
      reject(e);
    };
    socket = connection;
  });
}

var actions = {
  connection: function (data) {
    sessionStorage.setItem("uuid", data.uuid);
    actions["connection-success"](data);
  },
};

function signal(message) {
  socket.send(processMessage(message));
}

function messageParser(message) {
  return JSON.parse(message.data);
}

function actionInvoker(data) {
  var action = data.action;
  action ? actions[action](data) : log(data);
}

function processMessage(message) {
  var clientId = sessionStorage.getItem("uuid");
  var partyId = sessionStorage.getItem("partyId");
  var finalMessage = Object.assign({}, { clientId, partyId }, message);
  return JSON.stringify(finalMessage);
}
