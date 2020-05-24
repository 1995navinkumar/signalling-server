(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function AudioPlayer() {
  var audio = new Audio();

  function play() {
    audio.play();
  }

  function pause() {
    audio.pause();
  }

  function setStream(stream) {
    audio.srcObject = stream;
  }

  function getStream() {
    audio.srcObject;
  }

  return {
    play: play,
    pause: pause,
    setStream: setStream,
    getStream: getStream
  };
}

var player = AudioPlayer();
window.AudioPlayer = player;
var _default = player;
exports["default"] = _default;

},{}],2:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _utils = require("../utils");

var _events = _interopRequireDefault(require("events"));

var ConnectionManager = function ConnectionManager() {
  var activeConnection;

  function createConnection(_x, _x2, _x3) {
    return _createConnection.apply(this, arguments);
  }

  function _createConnection() {
    _createConnection = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee(url, queryParams, handler) {
      var ws;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return makeConnection(url, queryParams);

            case 2:
              ws = _context.sent;
              activeConnection = new Connection(ws, handler);
              return _context.abrupt("return", activeConnection);

            case 5:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));
    return _createConnection.apply(this, arguments);
  }

  function terminateConnection() {
    if (!activeConnection) {
      return;
    }

    ;
    activeConnection.events.emit("close");
    activeConnection.close();
    activeConnection = undefined;
    console.log("connection terminated");
  }

  function getConnection() {
    return activeConnection;
  }

  return {
    createConnection: createConnection,
    terminateConnection: terminateConnection,
    getConnection: getConnection
  };
}();

window.ConnectionManager = ConnectionManager;

function makeConnection(_x4, _x5) {
  return _makeConnection.apply(this, arguments);
}

function _makeConnection() {
  _makeConnection = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee2(url, queryParams) {
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", new Promise(function (resolve, reject) {
              var ws = new WebSocket("ws://".concat(url, "?").concat(queryParams));

              ws.onopen = function () {
                console.log("socket connection established ");
                resolve(ws);
              };

              ws.onerror = function (e) {
                console.log("error in connection establishment", e);
                reject(e);
              };

              ws.onclose = function () {
                console.log("socket closed");
              };
            }));

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _makeConnection.apply(this, arguments);
}

function Connection(ws, handler) {
  this.ws = ws;
  this.handler = MessageHandler.call(this, handler);
  this.events = new _events["default"]();
  ws.onmessage = (0, _utils.pipe)(_utils.messageParser, this.handler);
}

Connection.prototype.close = function close() {
  this.ws.close(1000, "logged out");
};

Connection.prototype.signal = function signal(message) {
  this.ws.send(JSON.stringify(message));
};

Connection.prototype.request = function request(message) {
  message.category = "request";
  this.signal(message);
};

Connection.prototype.respond = function respond(to, message) {
  message.category = "response";
  message.data.memberId = to;
  this.signal(message);
};

Connection.prototype.action = function action(message) {
  message.category = "action";
  this.signal(message);
};

Connection.prototype.webrtc = function webrtc(message) {
  message.category = "webrtc";
  this.signal(message);
};

function MessageHandler(categoryMapper) {
  var _this = this;

  return function (message) {
    console.log(message);
    var category = message.category,
        type = message.type,
        data = message.data;

    if (category && type) {
      try {
        return categoryMapper[category][type](_this, data);
      } catch (error) {
        console.log(error);
      }
    }
  };
}

var _default = ConnectionManager;
exports["default"] = _default;

},{"../utils":8,"@babel/runtime/helpers/asyncToGenerator":11,"@babel/runtime/helpers/interopRequireDefault":14,"@babel/runtime/regenerator":21,"events":22}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = hark;

// original source code is taken from:
// https://github.com/SimpleWebRTC/hark
// copyright goes to &yet team
// edited by Muaz Khan for RTCMultiConnection.js
function hark(stream, options) {
  var audioContextType = window.webkitAudioContext || window.AudioContext;
  var harker = this;
  harker.events = {};

  harker.on = function (event, callback) {
    harker.events[event] = callback;
  };

  harker.emit = function () {
    if (harker.events[arguments[0]]) {
      harker.events[arguments[0]](arguments[1], arguments[2], arguments[3], arguments[4]);
    }
  }; // make it not break in non-supported browsers


  if (!audioContextType) return harker;
  options = options || {}; // Config

  var smoothing = options.smoothing || 0.1,
      interval = options.interval || 50,
      threshold = options.threshold,
      play = options.play,
      history = options.history || 10,
      running = true; // Setup Audio Context

  if (!window.audioContext00) {
    window.audioContext00 = new audioContextType();
  }

  var gainNode = audioContext00.createGain();
  gainNode.connect(audioContext00.destination); // don't play for self

  gainNode.gain.value = 0;
  var sourceNode, fftBins, analyser;
  analyser = audioContext00.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = smoothing;
  fftBins = new Float32Array(analyser.fftSize); //WebRTC Stream

  sourceNode = audioContext00.createMediaStreamSource(stream);
  threshold = threshold || -50;
  sourceNode.connect(analyser);
  if (play) analyser.connect(audioContext00.destination);
  harker.speaking = false;

  harker.setThreshold = function (t) {
    threshold = t;
  };

  harker.setInterval = function (i) {
    interval = i;
  };

  harker.stop = function () {
    running = false;
    harker.emit('volume_change', -100, threshold);

    if (harker.speaking) {
      harker.speaking = false;
      harker.emit('stopped_speaking');
    }
  };

  harker.speakingHistory = [];

  for (var i = 0; i < history; i++) {
    harker.speakingHistory.push(0);
  } // Poll the analyser node to determine if speaking
  // and emit events if changed


  var looper = function looper() {
    setTimeout(function () {
      //check if stop has been called
      if (!running) {
        return;
      }

      var currentVolume = getMaxVolume(analyser, fftBins);
      harker.emit('volume_change', currentVolume, threshold);
      var history = 0;

      if (currentVolume > threshold && !harker.speaking) {
        // trigger quickly, short history
        for (var i = harker.speakingHistory.length - 3; i < harker.speakingHistory.length; i++) {
          history += harker.speakingHistory[i];
        }

        if (history >= 2) {
          harker.speaking = true;
          harker.emit('speaking');
        }
      } else if (currentVolume < threshold && harker.speaking) {
        for (var j = 0; j < harker.speakingHistory.length; j++) {
          history += harker.speakingHistory[j];
        }

        if (history === 0) {
          harker.speaking = false;
          harker.emit('stopped_speaking');
        }
      }

      harker.speakingHistory.shift();
      harker.speakingHistory.push(0 + (currentVolume > threshold));
      looper();
    }, interval);
  };

  looper();

  function getMaxVolume(analyser, fftBins) {
    var maxVolume = -Infinity;
    analyser.getFloatFrequencyData(fftBins);

    for (var i = 4, ii = fftBins.length; i < ii; i++) {
      if (fftBins[i] > maxVolume && fftBins[i] < 0) {
        maxVolume = fftBins[i];
      }
    }

    return maxVolume;
  }

  return harker;
}

},{}],4:[function(require,module,exports){
"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _connectionManager = _interopRequireDefault(require("./connection-manager"));

var Peer = _interopRequireWildcard(require("./peer"));

var _audioPlayer = _interopRequireDefault(require("./audio-player"));

var _wsHandler = _interopRequireDefault(require("./ws-handler"));

var _events = _interopRequireDefault(require("events"));

console.log(Peer);
window.peer = Peer;
window.SocketHandler = _wsHandler["default"];
window.events = new _events["default"]();

},{"./audio-player":1,"./connection-manager":2,"./peer":5,"./ws-handler":7,"@babel/runtime/helpers/interopRequireDefault":14,"@babel/runtime/helpers/interopRequireWildcard":15,"events":22}],5:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAudioStream = getAudioStream;
exports.stopStreaming = stopStreaming;

var _audioPlayer = _interopRequireDefault(require("./audio-player"));

var _hark = _interopRequireDefault(require("./hark"));

var audioStream;
var peer,
    partyMembers = {};

function reset() {
  if (peer) {
    peer.close();
    peer = undefined;
  }

  if (Object.keys(partyMembers).length > 0) {
    partyMembers.forEach(function (peerCon) {
      peerCon.close();
    });
    partyMembers = {};
  }
}

function getAudioStream() {
  if (!audioStream) {
    audioStream = new Promise(function (resolve, reject) {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function (tabs) {
        chrome.tabCapture.capture({
          audio: true
        }, function (stream) {
          _audioPlayer["default"].setStream(stream);

          _audioPlayer["default"].play();

          resolve(stream);
        });
      });
    });
  }

  return audioStream;
}

function stopStreaming() {
  getAudioStream().then(function (stream) {
    var tracks = stream.getTracks();
    tracks && tracks.forEach(function (track) {
      track.stop();
    });
  });
  audioStream = undefined;
}

},{"./audio-player":1,"./hark":3,"@babel/runtime/helpers/interopRequireDefault":14}],6:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _events = _interopRequireDefault(require("events"));

/**
 * Used for abstraction of webrtc implementations
 * @module RTC_Connnector
 * @extends EventTarget
 */
var log = console.log;

var RTC_Connnector =
/*#__PURE__*/
function () {
  /**
   * @param {Object} iceServers 
   * @param {Object} peerEvents Set of actions that has to be called during the peer transmissions
   * @param {function} peerEvents.onicecandidate
   * @param {function} peerEvents.ontrack
   * @param {function} peerEvents.onnegotiationneeded  
   */
  function RTC_Connnector(iceServers, streams) {
    var peerEvents = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    (0, _classCallCheck2["default"])(this, RTC_Connnector);

    /**
     * @property {RTCPeerConnection} rtcPeer rtc peer instance which is used to initiate a communication with other peers 
     */
    this.constraints = {
      audio: true
    };
    this.rtcPeer = new RTCPeerConnection({
      iceServers: iceServers
    });
    var eventHandler = new _events["default"]();
    this.on = eventHandler.on;
    this.off = eventHandler.off;
    this.trigger = eventHandler.emit;
    console.log(this.rtcPeer);
    this.rtcPeer.onnegotiationneeded = this._initiateConnection.bind(this);
    this.rtcPeer.ontrack = this._ontrack.bind(this);
    this.rtcPeer.onicecandidate = this._onicecandidate.bind(this);

    if (streams) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = streams.getTracks()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var track = _step.value;
          this.rtcPeer.addTrack(track, streams);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }

  (0, _createClass2["default"])(RTC_Connnector, [{
    key: "_ontrack",
    value: function _ontrack(event) {
      log("track added in rtc");
      this.trigger("streamReady", event);
    }
  }, {
    key: "_initiateConnection",
    value: function () {
      var _initiateConnection2 = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee() {
        var offer;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                log("Negotiation started");
                _context.next = 4;
                return this.rtcPeer.createOffer(this.constraints);

              case 4:
                offer = _context.sent;

                if (!(this.rtcPeer.signalingState != "stable")) {
                  _context.next = 8;
                  break;
                }

                log("     -- The connection isn't stable yet; postponing...");
                return _context.abrupt("return");

              case 8:
                log("Setting to local description");
                _context.next = 11;
                return this.rtcPeer.setLocalDescription(offer);

              case 11:
                this.trigger("offerReady", this.rtcPeer.localDescription);
                _context.next = 17;
                break;

              case 14:
                _context.prev = 14;
                _context.t0 = _context["catch"](0);
                log("Failed in Negotiation ".concat(_context.t0));

              case 17:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 14]]);
      }));

      function _initiateConnection() {
        return _initiateConnection2.apply(this, arguments);
      }

      return _initiateConnection;
    }()
  }, {
    key: "acceptOffer",
    value: function () {
      var _acceptOffer = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee2(offer) {
        var desc, answer;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                desc = new RTCSessionDescription(offer); // If the connection isn't stable yet, wait for it...

                if (!(this.rtcPeer.signalingState != "stable")) {
                  _context2.next = 8;
                  break;
                }

                log("  - But the signaling state isn't stable, so triggering rollback"); // Set the local and remove descriptions for rollback; don't proceed
                // until both return.

                _context2.next = 5;
                return Promise.all([this.rtcPeer.setLocalDescription({
                  type: "rollback"
                }), this.rtcPeer.setRemoteDescription(desc)]);

              case 5:
                return _context2.abrupt("return");

              case 8:
                log("  - Setting remote description");
                _context2.next = 11;
                return this.rtcPeer.setRemoteDescription(desc);

              case 11:
                _context2.next = 13;
                return this.rtcPeer.createAnswer(this.constraints);

              case 13:
                answer = _context2.sent;
                this.rtcPeer.setLocalDescription(answer);
                this.trigger("answerReady", this.rtcPeer.localDescription);

              case 16:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function acceptOffer(_x) {
        return _acceptOffer.apply(this, arguments);
      }

      return acceptOffer;
    }()
  }, {
    key: "setAnswer",
    value: function setAnswer(answer) {
      var desc = new RTCSessionDescription(answer);
      this.rtcPeer.setRemoteDescription(desc).then(function (_) {
        log("Master Remote Description is set");
      });
    }
  }, {
    key: "setRemoteCandidate",
    value: function setRemoteCandidate(candidate) {
      if (this.rtcPeer.remoteDescription) {
        var candidate = new RTCIceCandidate(candidate);
        log("Adding received ICE candidate");
        this.rtcPeer.addIceCandidate(candidate);
      }
    }
  }, {
    key: "_onicecandidate",
    value: function _onicecandidate(event) {
      log("ice candidate handling");

      if (event.candidate) {
        this.trigger("candidateReady", event.candidate);
      }
    }
  }]);
  return RTC_Connnector;
}();

exports["default"] = RTC_Connnector;

},{"@babel/runtime/helpers/asyncToGenerator":11,"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":13,"@babel/runtime/helpers/interopRequireDefault":14,"@babel/runtime/regenerator":21,"events":22}],7:[function(require,module,exports){
"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _peer = require("./peer");

var _audioPlayer = _interopRequireDefault(require("./audio-player"));

var _rtc = _interopRequireDefault(require("./rtc"));

var _connectionManager = _interopRequireDefault(require("./connection-manager"));

var utils = _interopRequireWildcard(require("../utils"));

var audioStream,
    peer,
    partyMembers = {};
var servers = {
  urls: "stun:stun1.l.google.com:19302"
};
var turnServer = {
  urls: 'turn:192.158.29.39:3478?transport=udp',
  credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
  username: '28224511:1379330808'
};
var iceServers = [servers, turnServer];
var webrtc = {
  "offer": function offer(connection, data) {
    peer = new _rtc["default"](iceServers);
    var memberId = data.memberId;

    var connection = _connectionManager["default"].getConnection();

    peer.on('answerReady', function (answer) {
      connection.webrtc({
        type: "answer",
        data: {
          answer: answer,
          memberId: memberId
        }
      });
    });
    peer.on('candidateReady', function (candidate) {
      connection.webrtc({
        type: "candidate",
        data: {
          candidate: candidate,
          memberId: memberId
        }
      });
    });
    peer.on("streamReady", function (_ref) {
      var _ref$streams = (0, _slicedToArray2["default"])(_ref.streams, 1),
          stream = _ref$streams[0];

      console.log("streamReady");

      _audioPlayer["default"].setStream(stream);

      console.log(stream);

      _audioPlayer["default"].play();
    });
    peer.acceptOffer(data.offer);
  },
  "answer": function answer(connection, data) {
    var memberId = data.memberId;
    var clientPeer = partyMembers[memberId];
    clientPeer.setAnswer(data.answer);
  },
  "candidate": function candidate(connection, data) {
    var memberId = data.memberId;
    var clientPeer = partyMembers[memberId] || peer;
    clientPeer.setRemoteCandidate(data.candidate);
  }
};
var response = {
  "party-creation-success": function partyCreationSuccess(connection, data) {
    var popup = utils.getPopup();
    popup.app.setState({
      route: "party"
    });
  },
  "join-party-success": function joinPartySuccess(connection, data) {
    var popup = utils.getPopup();
    popup.app.setState({
      route: "party"
    });
  },
  "dj-accept": function djAccept() {
    audioStream = (0, _peer.getAudioStream)();
  }
};
var notification = {
  "join-party": function () {
    var _joinParty = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee(connection, data) {
      var clientIds, streamObj;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              console.log(data);
              connection = _connectionManager["default"].getConnection();
              clientIds = data.memberIds;
              _context.next = 5;
              return audioStream;

            case 5:
              streamObj = _context.sent;
              clientIds.forEach(function (memberId) {
                var clientPeer = new _rtc["default"](iceServers, streamObj);
                partyMembers[memberId] = clientPeer;
                clientPeer.on('offerReady', function (offer) {
                  connection.webrtc({
                    type: "offer",
                    data: {
                      offer: offer,
                      memberId: memberId
                    }
                  });
                });
                clientPeer.on('candidateReady', function (candidate) {
                  connection.webrtc({
                    type: "candidate",
                    data: {
                      candidate: candidate,
                      memberId: memberId
                    }
                  });
                });
              });

            case 7:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    function joinParty(_x, _x2) {
      return _joinParty.apply(this, arguments);
    }

    return joinParty;
  }()
};
var _default = {
  response: response,
  notification: notification,
  webrtc: webrtc
};
exports["default"] = _default;

},{"../utils":8,"./audio-player":1,"./connection-manager":2,"./peer":5,"./rtc":6,"@babel/runtime/helpers/asyncToGenerator":11,"@babel/runtime/helpers/interopRequireDefault":14,"@babel/runtime/helpers/interopRequireWildcard":15,"@babel/runtime/helpers/slicedToArray":18,"@babel/runtime/regenerator":21}],8:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messageParser = messageParser;
exports.uid = uid;
exports.isExtension = isExtension;
exports.getBackground = getBackground;
exports.getPopup = getPopup;
exports.getUserProfile = getUserProfile;
exports.pipe = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var pipe = function pipe() {
  for (var _len = arguments.length, fns = new Array(_len), _key = 0; _key < _len; _key++) {
    fns[_key] = arguments[_key];
  }

  return function (x) {
    return fns.reduce(function (y, f) {
      return f(y);
    }, x);
  };
};

exports.pipe = pipe;

function messageParser(message) {
  return JSON.parse(message.data);
}

var count = 0;

function uid(suffix) {
  return "".concat(count, "_").concat(suffix);
}

function isExtension() {
  return location.protocol.includes("chrome-extension");
}

function getBackground() {
  if (isExtension()) {
    return chrome.extension.getBackgroundPage();
  } else {
    return window;
  }
}

function getPopup() {
  if (isExtension()) {
    return chrome.extension.getViews({
      type: "popup"
    })[0];
  } else {
    return window;
  }
}

function getUserProfile() {
  return _getUserProfile.apply(this, arguments);
}

function _getUserProfile() {
  _getUserProfile = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee() {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", new Promise(function (resolve, reject) {
              if (isExtension()) {
                chrome.identity.getProfileUserInfo(resolve);
              } else {
                localStorage.userProfile ? resolve(JSON.parse(localStorage.userProfile)) : resolve({});
              }
            }));

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _getUserProfile.apply(this, arguments);
}

},{"@babel/runtime/helpers/asyncToGenerator":11,"@babel/runtime/helpers/interopRequireDefault":14,"@babel/runtime/regenerator":21}],9:[function(require,module,exports){
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

module.exports = _arrayLikeToArray;
},{}],10:[function(require,module,exports){
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

module.exports = _arrayWithHoles;
},{}],11:[function(require,module,exports){
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

module.exports = _asyncToGenerator;
},{}],12:[function(require,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
},{}],13:[function(require,module,exports){
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

module.exports = _createClass;
},{}],14:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
},{}],15:[function(require,module,exports){
var _typeof = require("../helpers/typeof");

function _getRequireWildcardCache() {
  if (typeof WeakMap !== "function") return null;
  var cache = new WeakMap();

  _getRequireWildcardCache = function _getRequireWildcardCache() {
    return cache;
  };

  return cache;
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }

  if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") {
    return {
      "default": obj
    };
  }

  var cache = _getRequireWildcardCache();

  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }

  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;

  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;

      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }

  newObj["default"] = obj;

  if (cache) {
    cache.set(obj, newObj);
  }

  return newObj;
}

module.exports = _interopRequireWildcard;
},{"../helpers/typeof":19}],16:[function(require,module,exports){
function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

module.exports = _iterableToArrayLimit;
},{}],17:[function(require,module,exports){
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

module.exports = _nonIterableRest;
},{}],18:[function(require,module,exports){
var arrayWithHoles = require("./arrayWithHoles");

var iterableToArrayLimit = require("./iterableToArrayLimit");

var unsupportedIterableToArray = require("./unsupportedIterableToArray");

var nonIterableRest = require("./nonIterableRest");

function _slicedToArray(arr, i) {
  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest();
}

module.exports = _slicedToArray;
},{"./arrayWithHoles":10,"./iterableToArrayLimit":16,"./nonIterableRest":17,"./unsupportedIterableToArray":20}],19:[function(require,module,exports){
function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;
},{}],20:[function(require,module,exports){
var arrayLikeToArray = require("./arrayLikeToArray");

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
}

module.exports = _unsupportedIterableToArray;
},{"./arrayLikeToArray":9}],21:[function(require,module,exports){
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":23}],22:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],23:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvYmFja2dyb3VuZC9hdWRpby1wbGF5ZXIuanMiLCJjbGllbnQvYmFja2dyb3VuZC9jb25uZWN0aW9uLW1hbmFnZXIuanMiLCJjbGllbnQvYmFja2dyb3VuZC9oYXJrLmpzIiwiY2xpZW50L2JhY2tncm91bmQvaW5kZXguanMiLCJjbGllbnQvYmFja2dyb3VuZC9wZWVyLmpzIiwiY2xpZW50L2JhY2tncm91bmQvcnRjLmpzIiwiY2xpZW50L2JhY2tncm91bmQvd3MtaGFuZGxlci5qcyIsImNsaWVudC91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2FycmF5TGlrZVRvQXJyYXkuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9hcnJheVdpdGhIb2xlcy5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2FzeW5jVG9HZW5lcmF0b3IuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jbGFzc0NhbGxDaGVjay5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2NyZWF0ZUNsYXNzLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVXaWxkY2FyZC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2l0ZXJhYmxlVG9BcnJheUxpbWl0LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvbm9uSXRlcmFibGVSZXN0LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZi5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL3JlZ2VuZXJhdG9yL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCJub2RlX21vZHVsZXMvcmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7OztBQ0FBLFNBQVMsV0FBVCxHQUF1QjtBQUNuQixNQUFJLEtBQUssR0FBRyxJQUFJLEtBQUosRUFBWjs7QUFDQSxXQUFTLElBQVQsR0FBZ0I7QUFDWixJQUFBLEtBQUssQ0FBQyxJQUFOO0FBQ0g7O0FBQ0QsV0FBUyxLQUFULEdBQWlCO0FBQ2IsSUFBQSxLQUFLLENBQUMsS0FBTjtBQUNIOztBQUNELFdBQVMsU0FBVCxDQUFtQixNQUFuQixFQUEyQjtBQUN2QixJQUFBLEtBQUssQ0FBQyxTQUFOLEdBQWtCLE1BQWxCO0FBQ0g7O0FBQ0QsV0FBUyxTQUFULEdBQXFCO0FBQ2pCLElBQUEsS0FBSyxDQUFDLFNBQU47QUFDSDs7QUFDRCxTQUFPO0FBQ0gsSUFBQSxJQUFJLEVBQUosSUFERztBQUVILElBQUEsS0FBSyxFQUFMLEtBRkc7QUFHSCxJQUFBLFNBQVMsRUFBVCxTQUhHO0FBSUgsSUFBQSxTQUFTLEVBQVQ7QUFKRyxHQUFQO0FBTUg7O0FBQ0QsSUFBSSxNQUFNLEdBQUcsV0FBVyxFQUF4QjtBQUNBLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLE1BQXJCO2VBQ2UsTTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN2QmY7O0FBQ0E7O0FBRUEsSUFBTSxpQkFBaUIsR0FBSSxTQUFTLGlCQUFULEdBQTZCO0FBQ3BELE1BQUksZ0JBQUo7O0FBRG9ELFdBRXJDLGdCQUZxQztBQUFBO0FBQUE7O0FBQUE7QUFB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNnQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJmdW5jdGlvbiBBdWRpb1BsYXllcigpIHtcbiAgICB2YXIgYXVkaW8gPSBuZXcgQXVkaW8oKTtcbiAgICBmdW5jdGlvbiBwbGF5KCkge1xuICAgICAgICBhdWRpby5wbGF5KCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHBhdXNlKCkge1xuICAgICAgICBhdWRpby5wYXVzZSgpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzZXRTdHJlYW0oc3RyZWFtKSB7XG4gICAgICAgIGF1ZGlvLnNyY09iamVjdCA9IHN0cmVhbTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZ2V0U3RyZWFtKCkge1xuICAgICAgICBhdWRpby5zcmNPYmplY3Q7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHBsYXksXG4gICAgICAgIHBhdXNlLFxuICAgICAgICBzZXRTdHJlYW0sXG4gICAgICAgIGdldFN0cmVhbVxuICAgIH1cbn1cbnZhciBwbGF5ZXIgPSBBdWRpb1BsYXllcigpO1xud2luZG93LkF1ZGlvUGxheWVyID0gcGxheWVyO1xuZXhwb3J0IGRlZmF1bHQgcGxheWVyOyIsImltcG9ydCB7IHBpcGUsIG1lc3NhZ2VQYXJzZXIgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cyc7XG5cbmNvbnN0IENvbm5lY3Rpb25NYW5hZ2VyID0gKGZ1bmN0aW9uIENvbm5lY3Rpb25NYW5hZ2VyKCkge1xuICAgIHZhciBhY3RpdmVDb25uZWN0aW9uO1xuICAgIGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUNvbm5lY3Rpb24odXJsLCBxdWVyeVBhcmFtcywgaGFuZGxlcikge1xuICAgICAgICB2YXIgd3MgPSBhd2FpdCBtYWtlQ29ubmVjdGlvbih1cmwsIHF1ZXJ5UGFyYW1zKTtcbiAgICAgICAgYWN0aXZlQ29ubmVjdGlvbiA9IG5ldyBDb25uZWN0aW9uKHdzLCBoYW5kbGVyKTtcbiAgICAgICAgcmV0dXJuIGFjdGl2ZUNvbm5lY3Rpb247XG4gICAgfVxuICAgIGZ1bmN0aW9uIHRlcm1pbmF0ZUNvbm5lY3Rpb24oKSB7XG4gICAgICAgIGlmICghYWN0aXZlQ29ubmVjdGlvbikgeyByZXR1cm4gfTtcbiAgICAgICAgYWN0aXZlQ29ubmVjdGlvbi5ldmVudHMuZW1pdChcImNsb3NlXCIpO1xuICAgICAgICBhY3RpdmVDb25uZWN0aW9uLmNsb3NlKCk7XG4gICAgICAgIGFjdGl2ZUNvbm5lY3Rpb24gPSB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiY29ubmVjdGlvbiB0ZXJtaW5hdGVkXCIpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnZXRDb25uZWN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYWN0aXZlQ29ubmVjdGlvbjtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY3JlYXRlQ29ubmVjdGlvbixcbiAgICAgICAgdGVybWluYXRlQ29ubmVjdGlvbixcbiAgICAgICAgZ2V0Q29ubmVjdGlvblxuICAgIH1cbn0pKCk7XG5cbndpbmRvdy5Db25uZWN0aW9uTWFuYWdlciA9IENvbm5lY3Rpb25NYW5hZ2VyO1xuXG5hc3luYyBmdW5jdGlvbiBtYWtlQ29ubmVjdGlvbih1cmwsIHF1ZXJ5UGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgdmFyIHdzID0gbmV3IFdlYlNvY2tldChgd3M6Ly8ke3VybH0/JHtxdWVyeVBhcmFtc31gKTtcbiAgICAgICAgd3Mub25vcGVuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJzb2NrZXQgY29ubmVjdGlvbiBlc3RhYmxpc2hlZCBcIik7XG4gICAgICAgICAgICByZXNvbHZlKHdzKTtcbiAgICAgICAgfTtcbiAgICAgICAgd3Mub25lcnJvciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImVycm9yIGluIGNvbm5lY3Rpb24gZXN0YWJsaXNobWVudFwiLCBlKTtcbiAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgfVxuICAgICAgICB3cy5vbmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJzb2NrZXQgY2xvc2VkXCIpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIENvbm5lY3Rpb24od3MsIGhhbmRsZXIpIHtcbiAgICB0aGlzLndzID0gd3M7XG4gICAgdGhpcy5oYW5kbGVyID0gTWVzc2FnZUhhbmRsZXIuY2FsbCh0aGlzLCBoYW5kbGVyKTtcbiAgICB0aGlzLmV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB3cy5vbm1lc3NhZ2UgPSBwaXBlKG1lc3NhZ2VQYXJzZXIsIHRoaXMuaGFuZGxlcik7XG59XG5cbkNvbm5lY3Rpb24ucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgdGhpcy53cy5jbG9zZSgxMDAwLCBcImxvZ2dlZCBvdXRcIik7XG59XG5cbkNvbm5lY3Rpb24ucHJvdG90eXBlLnNpZ25hbCA9IGZ1bmN0aW9uIHNpZ25hbChtZXNzYWdlKSB7XG4gICAgdGhpcy53cy5zZW5kKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpKVxufVxuXG5Db25uZWN0aW9uLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChtZXNzYWdlKSB7XG4gICAgbWVzc2FnZS5jYXRlZ29yeSA9IFwicmVxdWVzdFwiO1xuICAgIHRoaXMuc2lnbmFsKG1lc3NhZ2UpO1xufVxuXG5Db25uZWN0aW9uLnByb3RvdHlwZS5yZXNwb25kID0gZnVuY3Rpb24gcmVzcG9uZCh0bywgbWVzc2FnZSkge1xuICAgIG1lc3NhZ2UuY2F0ZWdvcnkgPSBcInJlc3BvbnNlXCI7XG4gICAgbWVzc2FnZS5kYXRhLm1lbWJlcklkID0gdG87XG4gICAgdGhpcy5zaWduYWwobWVzc2FnZSk7XG59XG5cbkNvbm5lY3Rpb24ucHJvdG90eXBlLmFjdGlvbiA9IGZ1bmN0aW9uIGFjdGlvbihtZXNzYWdlKSB7XG4gICAgbWVzc2FnZS5jYXRlZ29yeSA9IFwiYWN0aW9uXCI7XG4gICAgdGhpcy5zaWduYWwobWVzc2FnZSk7XG59XG5cbkNvbm5lY3Rpb24ucHJvdG90eXBlLndlYnJ0YyA9IGZ1bmN0aW9uIHdlYnJ0YyhtZXNzYWdlKSB7XG4gICAgbWVzc2FnZS5jYXRlZ29yeSA9IFwid2VicnRjXCI7XG4gICAgdGhpcy5zaWduYWwobWVzc2FnZSk7XG59XG5cbmZ1bmN0aW9uIE1lc3NhZ2VIYW5kbGVyKGNhdGVnb3J5TWFwcGVyKSB7XG4gICAgcmV0dXJuIChtZXNzYWdlKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuICAgICAgICB2YXIgeyBjYXRlZ29yeSwgdHlwZSwgZGF0YSB9ID0gbWVzc2FnZTtcbiAgICAgICAgaWYgKGNhdGVnb3J5ICYmIHR5cGUpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhdGVnb3J5TWFwcGVyW2NhdGVnb3J5XVt0eXBlXSh0aGlzLCBkYXRhKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBDb25uZWN0aW9uTWFuYWdlcjsiLCIvLyBvcmlnaW5hbCBzb3VyY2UgY29kZSBpcyB0YWtlbiBmcm9tOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL1NpbXBsZVdlYlJUQy9oYXJrXG4vLyBjb3B5cmlnaHQgZ29lcyB0byAmeWV0IHRlYW1cbi8vIGVkaXRlZCBieSBNdWF6IEtoYW4gZm9yIFJUQ011bHRpQ29ubmVjdGlvbi5qc1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaGFyayhzdHJlYW0sIG9wdGlvbnMpIHtcbiAgICB2YXIgYXVkaW9Db250ZXh0VHlwZSA9IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQgfHwgd2luZG93LkF1ZGlvQ29udGV4dDtcblxuICAgIHZhciBoYXJrZXIgPSB0aGlzO1xuICAgIGhhcmtlci5ldmVudHMgPSB7fTtcbiAgICBoYXJrZXIub24gPSBmdW5jdGlvbiAoZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgICAgIGhhcmtlci5ldmVudHNbZXZlbnRdID0gY2FsbGJhY2s7XG4gICAgfTtcblxuICAgIGhhcmtlci5lbWl0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoaGFya2VyLmV2ZW50c1thcmd1bWVudHNbMF1dKSB7XG4gICAgICAgICAgICBoYXJrZXIuZXZlbnRzW2FyZ3VtZW50c1swXV0oYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0sIGFyZ3VtZW50c1szXSwgYXJndW1lbnRzWzRdKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBtYWtlIGl0IG5vdCBicmVhayBpbiBub24tc3VwcG9ydGVkIGJyb3dzZXJzXG4gICAgaWYgKCFhdWRpb0NvbnRleHRUeXBlKSByZXR1cm4gaGFya2VyO1xuXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgLy8gQ29uZmlnXG4gICAgdmFyIHNtb290aGluZyA9IChvcHRpb25zLnNtb290aGluZyB8fCAwLjEpLFxuICAgICAgICBpbnRlcnZhbCA9IChvcHRpb25zLmludGVydmFsIHx8IDUwKSxcbiAgICAgICAgdGhyZXNob2xkID0gb3B0aW9ucy50aHJlc2hvbGQsXG4gICAgICAgIHBsYXkgPSBvcHRpb25zLnBsYXksXG4gICAgICAgIGhpc3RvcnkgPSBvcHRpb25zLmhpc3RvcnkgfHwgMTAsXG4gICAgICAgIHJ1bm5pbmcgPSB0cnVlO1xuXG4gICAgLy8gU2V0dXAgQXVkaW8gQ29udGV4dFxuICAgIGlmICghd2luZG93LmF1ZGlvQ29udGV4dDAwKSB7XG4gICAgICAgIHdpbmRvdy5hdWRpb0NvbnRleHQwMCA9IG5ldyBhdWRpb0NvbnRleHRUeXBlKCk7XG4gICAgfVxuXG4gICAgdmFyIGdhaW5Ob2RlID0gYXVkaW9Db250ZXh0MDAuY3JlYXRlR2FpbigpO1xuICAgIGdhaW5Ob2RlLmNvbm5lY3QoYXVkaW9Db250ZXh0MDAuZGVzdGluYXRpb24pO1xuICAgIC8vIGRvbid0IHBsYXkgZm9yIHNlbGZcbiAgICBnYWluTm9kZS5nYWluLnZhbHVlID0gMDtcblxuICAgIHZhciBzb3VyY2VOb2RlLCBmZnRCaW5zLCBhbmFseXNlcjtcblxuICAgIGFuYWx5c2VyID0gYXVkaW9Db250ZXh0MDAuY3JlYXRlQW5hbHlzZXIoKTtcbiAgICBhbmFseXNlci5mZnRTaXplID0gNTEyO1xuICAgIGFuYWx5c2VyLnNtb290aGluZ1RpbWVDb25zdGFudCA9IHNtb290aGluZztcbiAgICBmZnRCaW5zID0gbmV3IEZsb2F0MzJBcnJheShhbmFseXNlci5mZnRTaXplKTtcblxuICAgIC8vV2ViUlRDIFN0cmVhbVxuICAgIHNvdXJjZU5vZGUgPSBhdWRpb0NvbnRleHQwMC5jcmVhdGVNZWRpYVN0cmVhbVNvdXJjZShzdHJlYW0pO1xuICAgIHRocmVzaG9sZCA9IHRocmVzaG9sZCB8fCAtNTA7XG5cbiAgICBzb3VyY2VOb2RlLmNvbm5lY3QoYW5hbHlzZXIpO1xuICAgIGlmIChwbGF5KSBhbmFseXNlci5jb25uZWN0KGF1ZGlvQ29udGV4dDAwLmRlc3RpbmF0aW9uKTtcblxuICAgIGhhcmtlci5zcGVha2luZyA9IGZhbHNlO1xuXG4gICAgaGFya2VyLnNldFRocmVzaG9sZCA9IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgIHRocmVzaG9sZCA9IHQ7XG4gICAgfTtcblxuICAgIGhhcmtlci5zZXRJbnRlcnZhbCA9IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgIGludGVydmFsID0gaTtcbiAgICB9O1xuXG4gICAgaGFya2VyLnN0b3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgaGFya2VyLmVtaXQoJ3ZvbHVtZV9jaGFuZ2UnLCAtMTAwLCB0aHJlc2hvbGQpO1xuICAgICAgICBpZiAoaGFya2VyLnNwZWFraW5nKSB7XG4gICAgICAgICAgICBoYXJrZXIuc3BlYWtpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGhhcmtlci5lbWl0KCdzdG9wcGVkX3NwZWFraW5nJyk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGhhcmtlci5zcGVha2luZ0hpc3RvcnkgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhpc3Rvcnk7IGkrKykge1xuICAgICAgICBoYXJrZXIuc3BlYWtpbmdIaXN0b3J5LnB1c2goMCk7XG4gICAgfVxuXG4gICAgLy8gUG9sbCB0aGUgYW5hbHlzZXIgbm9kZSB0byBkZXRlcm1pbmUgaWYgc3BlYWtpbmdcbiAgICAvLyBhbmQgZW1pdCBldmVudHMgaWYgY2hhbmdlZFxuICAgIHZhciBsb29wZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAvL2NoZWNrIGlmIHN0b3AgaGFzIGJlZW4gY2FsbGVkXG4gICAgICAgICAgICBpZiAoIXJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBjdXJyZW50Vm9sdW1lID0gZ2V0TWF4Vm9sdW1lKGFuYWx5c2VyLCBmZnRCaW5zKTtcblxuICAgICAgICAgICAgaGFya2VyLmVtaXQoJ3ZvbHVtZV9jaGFuZ2UnLCBjdXJyZW50Vm9sdW1lLCB0aHJlc2hvbGQpO1xuXG4gICAgICAgICAgICB2YXIgaGlzdG9yeSA9IDA7XG4gICAgICAgICAgICBpZiAoY3VycmVudFZvbHVtZSA+IHRocmVzaG9sZCAmJiAhaGFya2VyLnNwZWFraW5nKSB7XG4gICAgICAgICAgICAgICAgLy8gdHJpZ2dlciBxdWlja2x5LCBzaG9ydCBoaXN0b3J5XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IGhhcmtlci5zcGVha2luZ0hpc3RvcnkubGVuZ3RoIC0gMzsgaSA8IGhhcmtlci5zcGVha2luZ0hpc3RvcnkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaGlzdG9yeSArPSBoYXJrZXIuc3BlYWtpbmdIaXN0b3J5W2ldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaGlzdG9yeSA+PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhcmtlci5zcGVha2luZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGhhcmtlci5lbWl0KCdzcGVha2luZycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFZvbHVtZSA8IHRocmVzaG9sZCAmJiBoYXJrZXIuc3BlYWtpbmcpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGhhcmtlci5zcGVha2luZ0hpc3RvcnkubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaGlzdG9yeSArPSBoYXJrZXIuc3BlYWtpbmdIaXN0b3J5W2pdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaGlzdG9yeSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBoYXJrZXIuc3BlYWtpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgaGFya2VyLmVtaXQoJ3N0b3BwZWRfc3BlYWtpbmcnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBoYXJrZXIuc3BlYWtpbmdIaXN0b3J5LnNoaWZ0KCk7XG4gICAgICAgICAgICBoYXJrZXIuc3BlYWtpbmdIaXN0b3J5LnB1c2goMCArIChjdXJyZW50Vm9sdW1lID4gdGhyZXNob2xkKSk7XG5cbiAgICAgICAgICAgIGxvb3BlcigpO1xuICAgICAgICB9LCBpbnRlcnZhbCk7XG4gICAgfTtcbiAgICBsb29wZXIoKTtcblxuICAgIGZ1bmN0aW9uIGdldE1heFZvbHVtZShhbmFseXNlciwgZmZ0Qmlucykge1xuICAgICAgICB2YXIgbWF4Vm9sdW1lID0gLUluZmluaXR5O1xuICAgICAgICBhbmFseXNlci5nZXRGbG9hdEZyZXF1ZW5jeURhdGEoZmZ0Qmlucyk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDQsIGlpID0gZmZ0Qmlucy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZmZ0Qmluc1tpXSA+IG1heFZvbHVtZSAmJiBmZnRCaW5zW2ldIDwgMCkge1xuICAgICAgICAgICAgICAgIG1heFZvbHVtZSA9IGZmdEJpbnNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWF4Vm9sdW1lO1xuICAgIH1cblxuICAgIHJldHVybiBoYXJrZXI7XG59IiwiaW1wb3J0IENvbm5lY3Rpb25NYW5hZ2VyIGZyb20gJy4vY29ubmVjdGlvbi1tYW5hZ2VyJztcbmltcG9ydCAqIGFzIFBlZXIgZnJvbSAnLi9wZWVyJztcbmltcG9ydCBBdWRpb1BsYXllciBmcm9tICcuL2F1ZGlvLXBsYXllcic7XG5pbXBvcnQgU29ja2V0SGFuZGxlciBmcm9tICcuL3dzLWhhbmRsZXInO1xuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMnO1xuXG5jb25zb2xlLmxvZyhQZWVyKVxud2luZG93LnBlZXIgPSBQZWVyO1xud2luZG93LlNvY2tldEhhbmRsZXIgPSBTb2NrZXRIYW5kbGVyO1xud2luZG93LmV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXIoKTsiLCJpbXBvcnQgQXVkaW9QbGF5ZXIgZnJvbSAnLi9hdWRpby1wbGF5ZXInO1xuaW1wb3J0IGhhcmsgZnJvbSAnLi9oYXJrJztcbnZhciBhdWRpb1N0cmVhbTtcblxudmFyIHBlZXIsIHBhcnR5TWVtYmVycyA9IHt9O1xuXG5mdW5jdGlvbiByZXNldCgpIHtcbiAgICBpZiAocGVlcikge1xuICAgICAgICBwZWVyLmNsb3NlKCk7XG4gICAgICAgIHBlZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmIChPYmplY3Qua2V5cyhwYXJ0eU1lbWJlcnMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcGFydHlNZW1iZXJzLmZvckVhY2gocGVlckNvbiA9PiB7XG4gICAgICAgICAgICBwZWVyQ29uLmNsb3NlKCk7XG4gICAgICAgIH0pXG4gICAgICAgIHBhcnR5TWVtYmVycyA9IHt9O1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEF1ZGlvU3RyZWFtKCkge1xuICAgIGlmICghYXVkaW9TdHJlYW0pIHtcbiAgICAgICAgYXVkaW9TdHJlYW0gPSBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBjaHJvbWUudGFicy5xdWVyeSh7IGFjdGl2ZTogdHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZSB9LCAodGFicykgPT4ge1xuICAgICAgICAgICAgICAgIGNocm9tZS50YWJDYXB0dXJlLmNhcHR1cmUoeyBhdWRpbzogdHJ1ZSB9LCAoc3RyZWFtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIEF1ZGlvUGxheWVyLnNldFN0cmVhbShzdHJlYW0pO1xuICAgICAgICAgICAgICAgICAgICBBdWRpb1BsYXllci5wbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc3RyZWFtKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gYXVkaW9TdHJlYW07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdG9wU3RyZWFtaW5nKCkge1xuICAgIGdldEF1ZGlvU3RyZWFtKCkudGhlbihzdHJlYW0gPT4ge1xuICAgICAgICB2YXIgdHJhY2tzID0gc3RyZWFtLmdldFRyYWNrcygpO1xuICAgICAgICB0cmFja3MgJiYgdHJhY2tzLmZvckVhY2goZnVuY3Rpb24gKHRyYWNrKSB7XG4gICAgICAgICAgICB0cmFjay5zdG9wKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIGF1ZGlvU3RyZWFtID0gdW5kZWZpbmVkO1xufVxuIiwiLyoqXG4gKiBVc2VkIGZvciBhYnN0cmFjdGlvbiBvZiB3ZWJydGMgaW1wbGVtZW50YXRpb25zXG4gKiBAbW9kdWxlIFJUQ19Db25ubmVjdG9yXG4gKiBAZXh0ZW5kcyBFdmVudFRhcmdldFxuICovXG5cbnZhciBsb2cgPSBjb25zb2xlLmxvZztcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnZXZlbnRzJztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJUQ19Db25ubmVjdG9yIHtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBpY2VTZXJ2ZXJzIFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwZWVyRXZlbnRzIFNldCBvZiBhY3Rpb25zIHRoYXQgaGFzIHRvIGJlIGNhbGxlZCBkdXJpbmcgdGhlIHBlZXIgdHJhbnNtaXNzaW9uc1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHBlZXJFdmVudHMub25pY2VjYW5kaWRhdGVcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBwZWVyRXZlbnRzLm9udHJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBwZWVyRXZlbnRzLm9ubmVnb3RpYXRpb25uZWVkZWQgIFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGljZVNlcnZlcnMsIHN0cmVhbXMsIHBlZXJFdmVudHMgPSB7fSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IHtSVENQZWVyQ29ubmVjdGlvbn0gcnRjUGVlciBydGMgcGVlciBpbnN0YW5jZSB3aGljaCBpcyB1c2VkIHRvIGluaXRpYXRlIGEgY29tbXVuaWNhdGlvbiB3aXRoIG90aGVyIHBlZXJzIFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jb25zdHJhaW50cyA9IHtcbiAgICAgICAgICAgIGF1ZGlvOiB0cnVlXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucnRjUGVlciA9IG5ldyBSVENQZWVyQ29ubmVjdGlvbih7XG4gICAgICAgICAgICBpY2VTZXJ2ZXJzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBldmVudEhhbmRsZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgICAgIHRoaXMub24gPSBldmVudEhhbmRsZXIub247XG4gICAgICAgIHRoaXMub2ZmID0gZXZlbnRIYW5kbGVyLm9mZjtcbiAgICAgICAgdGhpcy50cmlnZ2VyID0gZXZlbnRIYW5kbGVyLmVtaXQ7XG5cbiAgICAgICAgY29uc29sZS5sb2codGhpcy5ydGNQZWVyKTtcblxuXG4gICAgICAgIHRoaXMucnRjUGVlci5vbm5lZ290aWF0aW9ubmVlZGVkID0gdGhpcy5faW5pdGlhdGVDb25uZWN0aW9uLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMucnRjUGVlci5vbnRyYWNrID0gdGhpcy5fb250cmFjay5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnJ0Y1BlZXIub25pY2VjYW5kaWRhdGUgPSB0aGlzLl9vbmljZWNhbmRpZGF0ZS5iaW5kKHRoaXMpO1xuXG4gICAgICAgIGlmIChzdHJlYW1zKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHRyYWNrIG9mIHN0cmVhbXMuZ2V0VHJhY2tzKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJ0Y1BlZXIuYWRkVHJhY2sodHJhY2ssIHN0cmVhbXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX29udHJhY2soZXZlbnQpIHtcbiAgICAgICAgbG9nKFwidHJhY2sgYWRkZWQgaW4gcnRjXCIpO1xuICAgICAgICB0aGlzLnRyaWdnZXIoXCJzdHJlYW1SZWFkeVwiLCBldmVudCk7XG4gICAgfVxuXG4gICAgYXN5bmMgX2luaXRpYXRlQ29ubmVjdGlvbigpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxvZyhcIk5lZ290aWF0aW9uIHN0YXJ0ZWRcIik7XG4gICAgICAgICAgICBjb25zdCBvZmZlciA9IGF3YWl0IHRoaXMucnRjUGVlci5jcmVhdGVPZmZlcih0aGlzLmNvbnN0cmFpbnRzKTtcblxuICAgICAgICAgICAgLy8gSWYgdGhlIGNvbm5lY3Rpb24gaGFzbid0IHlldCBhY2hpZXZlZCB0aGUgXCJzdGFibGVcIiBzdGF0ZSxcbiAgICAgICAgICAgIC8vIHJldHVybiB0byB0aGUgY2FsbGVyLiBBbm90aGVyIG5lZ290aWF0aW9ubmVlZGVkIGV2ZW50XG4gICAgICAgICAgICAvLyB3aWxsIGJlIGZpcmVkIHdoZW4gdGhlIHN0YXRlIHN0YWJpbGl6ZXMuXG4gICAgICAgICAgICBpZiAodGhpcy5ydGNQZWVyLnNpZ25hbGluZ1N0YXRlICE9IFwic3RhYmxlXCIpIHtcbiAgICAgICAgICAgICAgICBsb2coXCIgICAgIC0tIFRoZSBjb25uZWN0aW9uIGlzbid0IHN0YWJsZSB5ZXQ7IHBvc3Rwb25pbmcuLi5cIilcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxvZyhcIlNldHRpbmcgdG8gbG9jYWwgZGVzY3JpcHRpb25cIik7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnJ0Y1BlZXIuc2V0TG9jYWxEZXNjcmlwdGlvbihvZmZlcik7XG5cbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcihcIm9mZmVyUmVhZHlcIiwgdGhpcy5ydGNQZWVyLmxvY2FsRGVzY3JpcHRpb24pO1xuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBsb2coYEZhaWxlZCBpbiBOZWdvdGlhdGlvbiAke2Vycm9yfWApXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBhY2NlcHRPZmZlcihvZmZlcikge1xuICAgICAgICB2YXIgZGVzYyA9IG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24ob2ZmZXIpO1xuXG4gICAgICAgIC8vIElmIHRoZSBjb25uZWN0aW9uIGlzbid0IHN0YWJsZSB5ZXQsIHdhaXQgZm9yIGl0Li4uXG5cbiAgICAgICAgaWYgKHRoaXMucnRjUGVlci5zaWduYWxpbmdTdGF0ZSAhPSBcInN0YWJsZVwiKSB7XG4gICAgICAgICAgICBsb2coXCIgIC0gQnV0IHRoZSBzaWduYWxpbmcgc3RhdGUgaXNuJ3Qgc3RhYmxlLCBzbyB0cmlnZ2VyaW5nIHJvbGxiYWNrXCIpO1xuXG4gICAgICAgICAgICAvLyBTZXQgdGhlIGxvY2FsIGFuZCByZW1vdmUgZGVzY3JpcHRpb25zIGZvciByb2xsYmFjazsgZG9uJ3QgcHJvY2VlZFxuICAgICAgICAgICAgLy8gdW50aWwgYm90aCByZXR1cm4uXG4gICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICAgICAgdGhpcy5ydGNQZWVyLnNldExvY2FsRGVzY3JpcHRpb24oe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInJvbGxiYWNrXCJcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICB0aGlzLnJ0Y1BlZXIuc2V0UmVtb3RlRGVzY3JpcHRpb24oZGVzYylcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG9nKFwiICAtIFNldHRpbmcgcmVtb3RlIGRlc2NyaXB0aW9uXCIpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5ydGNQZWVyLnNldFJlbW90ZURlc2NyaXB0aW9uKGRlc2MpO1xuXG4gICAgICAgICAgICBsZXQgYW5zd2VyID0gYXdhaXQgdGhpcy5ydGNQZWVyLmNyZWF0ZUFuc3dlcih0aGlzLmNvbnN0cmFpbnRzKTtcbiAgICAgICAgICAgIHRoaXMucnRjUGVlci5zZXRMb2NhbERlc2NyaXB0aW9uKGFuc3dlcik7XG5cbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcihcImFuc3dlclJlYWR5XCIsIHRoaXMucnRjUGVlci5sb2NhbERlc2NyaXB0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldEFuc3dlcihhbnN3ZXIpIHtcbiAgICAgICAgdmFyIGRlc2MgPSBuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKGFuc3dlcik7XG4gICAgICAgIHRoaXMucnRjUGVlci5zZXRSZW1vdGVEZXNjcmlwdGlvbihkZXNjKS50aGVuKF8gPT4ge1xuICAgICAgICAgICAgbG9nKFwiTWFzdGVyIFJlbW90ZSBEZXNjcmlwdGlvbiBpcyBzZXRcIik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHNldFJlbW90ZUNhbmRpZGF0ZShjYW5kaWRhdGUpIHtcbiAgICAgICAgaWYgKHRoaXMucnRjUGVlci5yZW1vdGVEZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgdmFyIGNhbmRpZGF0ZSA9IG5ldyBSVENJY2VDYW5kaWRhdGUoY2FuZGlkYXRlKTtcbiAgICAgICAgICAgIGxvZyhcIkFkZGluZyByZWNlaXZlZCBJQ0UgY2FuZGlkYXRlXCIpO1xuICAgICAgICAgICAgdGhpcy5ydGNQZWVyLmFkZEljZUNhbmRpZGF0ZShjYW5kaWRhdGUpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfb25pY2VjYW5kaWRhdGUoZXZlbnQpIHtcbiAgICAgICAgbG9nKFwiaWNlIGNhbmRpZGF0ZSBoYW5kbGluZ1wiKTtcbiAgICAgICAgaWYgKGV2ZW50LmNhbmRpZGF0ZSkge1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKFwiY2FuZGlkYXRlUmVhZHlcIiwgZXZlbnQuY2FuZGlkYXRlKTtcbiAgICAgICAgfVxuICAgIH1cbn0iLCJpbXBvcnQgeyBnZXRBdWRpb1N0cmVhbSB9IGZyb20gJy4vcGVlcic7XG5pbXBvcnQgQXVkaW9QbGF5ZXIgZnJvbSAnLi9hdWRpby1wbGF5ZXInO1xuaW1wb3J0IFJUQ19Db25ubmVjdG9yIGZyb20gJy4vcnRjJztcbmltcG9ydCBDb25uZWN0aW9uTWFuYWdlciBmcm9tICcuL2Nvbm5lY3Rpb24tbWFuYWdlcic7XG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tICcuLi91dGlscyc7XG5cbnZhciBhdWRpb1N0cmVhbSwgcGVlciwgcGFydHlNZW1iZXJzID0ge307XG5cbmNvbnN0IHNlcnZlcnMgPSB7XG4gICAgdXJsczogXCJzdHVuOnN0dW4xLmwuZ29vZ2xlLmNvbToxOTMwMlwiXG59XG5cbmNvbnN0IHR1cm5TZXJ2ZXIgPSB7XG4gICAgdXJsczogJ3R1cm46MTkyLjE1OC4yOS4zOTozNDc4P3RyYW5zcG9ydD11ZHAnLFxuICAgIGNyZWRlbnRpYWw6ICdKWkVPRXQyVjNRYjB5MjdHUm50dDJ1MlBBWUE9JyxcbiAgICB1c2VybmFtZTogJzI4MjI0NTExOjEzNzkzMzA4MDgnXG59XG5cbmNvbnN0IGljZVNlcnZlcnMgPSBbc2VydmVycywgdHVyblNlcnZlcl07XG5cblxudmFyIHdlYnJ0YyA9IHtcbiAgICBcIm9mZmVyXCI6IGZ1bmN0aW9uIG9mZmVyKGNvbm5lY3Rpb24sIGRhdGEpIHtcbiAgICAgICAgcGVlciA9IG5ldyBSVENfQ29ubm5lY3RvcihpY2VTZXJ2ZXJzKTtcbiAgICAgICAgdmFyIG1lbWJlcklkID0gZGF0YS5tZW1iZXJJZDtcbiAgICAgICAgdmFyIGNvbm5lY3Rpb24gPSBDb25uZWN0aW9uTWFuYWdlci5nZXRDb25uZWN0aW9uKCk7XG4gICAgICAgIHBlZXIub24oJ2Fuc3dlclJlYWR5JywgZnVuY3Rpb24gKGFuc3dlcikge1xuICAgICAgICAgICAgY29ubmVjdGlvbi53ZWJydGMoe1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiYW5zd2VyXCIsXG4gICAgICAgICAgICAgICAgZGF0YTogeyBhbnN3ZXIsIG1lbWJlcklkIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcGVlci5vbignY2FuZGlkYXRlUmVhZHknLCBmdW5jdGlvbiAoY2FuZGlkYXRlKSB7XG4gICAgICAgICAgICBjb25uZWN0aW9uLndlYnJ0Yyh7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJjYW5kaWRhdGVcIixcbiAgICAgICAgICAgICAgICBkYXRhOiB7IGNhbmRpZGF0ZSwgbWVtYmVySWQgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBwZWVyLm9uKFwic3RyZWFtUmVhZHlcIiwgZnVuY3Rpb24gKHsgc3RyZWFtczogW3N0cmVhbV0gfSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJzdHJlYW1SZWFkeVwiKTtcbiAgICAgICAgICAgIEF1ZGlvUGxheWVyLnNldFN0cmVhbShzdHJlYW0pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coc3RyZWFtKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQXVkaW9QbGF5ZXIucGxheSgpO1xuICAgICAgICB9KVxuICAgICAgICBwZWVyLmFjY2VwdE9mZmVyKGRhdGEub2ZmZXIpO1xuICAgIH0sXG5cbiAgICBcImFuc3dlclwiOiBmdW5jdGlvbiBhbnN3ZXIoY29ubmVjdGlvbiwgZGF0YSkge1xuICAgICAgICB2YXIgbWVtYmVySWQgPSBkYXRhLm1lbWJlcklkO1xuICAgICAgICB2YXIgY2xpZW50UGVlciA9IHBhcnR5TWVtYmVyc1ttZW1iZXJJZF07XG4gICAgICAgIGNsaWVudFBlZXIuc2V0QW5zd2VyKGRhdGEuYW5zd2VyKTtcbiAgICB9LFxuXG4gICAgXCJjYW5kaWRhdGVcIjogZnVuY3Rpb24gY2FuZGlkYXRlKGNvbm5lY3Rpb24sIGRhdGEpIHtcbiAgICAgICAgbGV0IG1lbWJlcklkID0gZGF0YS5tZW1iZXJJZDtcbiAgICAgICAgbGV0IGNsaWVudFBlZXIgPSBwYXJ0eU1lbWJlcnNbbWVtYmVySWRdIHx8IHBlZXI7XG4gICAgICAgIGNsaWVudFBlZXIuc2V0UmVtb3RlQ2FuZGlkYXRlKGRhdGEuY2FuZGlkYXRlKTtcbiAgICB9XG59XG5cbnZhciByZXNwb25zZSA9IHtcbiAgICBcInBhcnR5LWNyZWF0aW9uLXN1Y2Nlc3NcIjogZnVuY3Rpb24gKGNvbm5lY3Rpb24sIGRhdGEpIHtcbiAgICAgICAgdmFyIHBvcHVwID0gdXRpbHMuZ2V0UG9wdXAoKTtcbiAgICAgICAgcG9wdXAuYXBwLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHJvdXRlOiBcInBhcnR5XCJcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBcImpvaW4tcGFydHktc3VjY2Vzc1wiOiBmdW5jdGlvbiAoY29ubmVjdGlvbiwgZGF0YSkge1xuICAgICAgICB2YXIgcG9wdXAgPSB1dGlscy5nZXRQb3B1cCgpO1xuICAgICAgICBwb3B1cC5hcHAuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcm91dGU6IFwicGFydHlcIlxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIFwiZGotYWNjZXB0XCI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYXVkaW9TdHJlYW0gPSBnZXRBdWRpb1N0cmVhbSgpO1xuICAgIH1cbn1cblxudmFyIG5vdGlmaWNhdGlvbiA9IHtcbiAgICBcImpvaW4tcGFydHlcIjogYXN5bmMgZnVuY3Rpb24gKGNvbm5lY3Rpb24sIGRhdGEpIHtcbiAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgICAgIHZhciBjb25uZWN0aW9uID0gQ29ubmVjdGlvbk1hbmFnZXIuZ2V0Q29ubmVjdGlvbigpO1xuICAgICAgICB2YXIgY2xpZW50SWRzID0gZGF0YS5tZW1iZXJJZHM7XG4gICAgICAgIHZhciBzdHJlYW1PYmogPSBhd2FpdCBhdWRpb1N0cmVhbTtcbiAgICAgICAgY2xpZW50SWRzLmZvckVhY2goKG1lbWJlcklkKSA9PiB7XG4gICAgICAgICAgICB2YXIgY2xpZW50UGVlciA9IG5ldyBSVENfQ29ubm5lY3RvcihpY2VTZXJ2ZXJzLCBzdHJlYW1PYmopO1xuICAgICAgICAgICAgcGFydHlNZW1iZXJzW21lbWJlcklkXSA9IGNsaWVudFBlZXI7XG4gICAgICAgICAgICBjbGllbnRQZWVyLm9uKCdvZmZlclJlYWR5JywgZnVuY3Rpb24gKG9mZmVyKSB7XG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbi53ZWJydGMoe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm9mZmVyXCIsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHsgb2ZmZXIsIG1lbWJlcklkIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2xpZW50UGVlci5vbignY2FuZGlkYXRlUmVhZHknLCBmdW5jdGlvbiAoY2FuZGlkYXRlKSB7XG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbi53ZWJydGMoe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImNhbmRpZGF0ZVwiLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7IGNhbmRpZGF0ZSwgbWVtYmVySWQgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgcmVzcG9uc2UsXG4gICAgbm90aWZpY2F0aW9uLFxuICAgIHdlYnJ0Y1xufVxuIiwiZXhwb3J0IGNvbnN0IHBpcGUgPSAoLi4uZm5zKSA9PiB4ID0+IGZucy5yZWR1Y2UoKHksIGYpID0+IGYoeSksIHgpO1xuXG5leHBvcnQgZnVuY3Rpb24gbWVzc2FnZVBhcnNlcihtZXNzYWdlKSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UobWVzc2FnZS5kYXRhKTtcbn1cblxudmFyIGNvdW50ID0gMDtcbmV4cG9ydCBmdW5jdGlvbiB1aWQoc3VmZml4KSB7XG4gICAgcmV0dXJuIGAke2NvdW50fV8ke3N1ZmZpeH1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNFeHRlbnNpb24oKSB7XG4gICAgcmV0dXJuIGxvY2F0aW9uLnByb3RvY29sLmluY2x1ZGVzKFwiY2hyb21lLWV4dGVuc2lvblwiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJhY2tncm91bmQoKSB7XG4gICAgaWYgKGlzRXh0ZW5zaW9uKCkpIHtcbiAgICAgICAgcmV0dXJuIGNocm9tZS5leHRlbnNpb24uZ2V0QmFja2dyb3VuZFBhZ2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gd2luZG93O1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBvcHVwKCkge1xuICAgIGlmIChpc0V4dGVuc2lvbigpKSB7XG4gICAgICAgIHJldHVybiBjaHJvbWUuZXh0ZW5zaW9uLmdldFZpZXdzKHsgdHlwZTogXCJwb3B1cFwiIH0pWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB3aW5kb3c7XG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VXNlclByb2ZpbGUoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgaWYgKGlzRXh0ZW5zaW9uKCkpIHtcbiAgICAgICAgICAgIGNocm9tZS5pZGVudGl0eS5nZXRQcm9maWxlVXNlckluZm8ocmVzb2x2ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2UudXNlclByb2ZpbGVcbiAgICAgICAgICAgICAgICA/IHJlc29sdmUoSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UudXNlclByb2ZpbGUpKVxuICAgICAgICAgICAgICAgIDogcmVzb2x2ZSh7fSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuXG4iLCJmdW5jdGlvbiBfYXJyYXlMaWtlVG9BcnJheShhcnIsIGxlbikge1xuICBpZiAobGVuID09IG51bGwgfHwgbGVuID4gYXJyLmxlbmd0aCkgbGVuID0gYXJyLmxlbmd0aDtcblxuICBmb3IgKHZhciBpID0gMCwgYXJyMiA9IG5ldyBBcnJheShsZW4pOyBpIDwgbGVuOyBpKyspIHtcbiAgICBhcnIyW2ldID0gYXJyW2ldO1xuICB9XG5cbiAgcmV0dXJuIGFycjI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2FycmF5TGlrZVRvQXJyYXk7IiwiZnVuY3Rpb24gX2FycmF5V2l0aEhvbGVzKGFycikge1xuICBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSByZXR1cm4gYXJyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9hcnJheVdpdGhIb2xlczsiLCJmdW5jdGlvbiBhc3luY0dlbmVyYXRvclN0ZXAoZ2VuLCByZXNvbHZlLCByZWplY3QsIF9uZXh0LCBfdGhyb3csIGtleSwgYXJnKSB7XG4gIHRyeSB7XG4gICAgdmFyIGluZm8gPSBnZW5ba2V5XShhcmcpO1xuICAgIHZhciB2YWx1ZSA9IGluZm8udmFsdWU7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmVqZWN0KGVycm9yKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoaW5mby5kb25lKSB7XG4gICAgcmVzb2x2ZSh2YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgUHJvbWlzZS5yZXNvbHZlKHZhbHVlKS50aGVuKF9uZXh0LCBfdGhyb3cpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9hc3luY1RvR2VuZXJhdG9yKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgZ2VuID0gZm4uYXBwbHkoc2VsZiwgYXJncyk7XG5cbiAgICAgIGZ1bmN0aW9uIF9uZXh0KHZhbHVlKSB7XG4gICAgICAgIGFzeW5jR2VuZXJhdG9yU3RlcChnZW4sIHJlc29sdmUsIHJlamVjdCwgX25leHQsIF90aHJvdywgXCJuZXh0XCIsIHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gX3Rocm93KGVycikge1xuICAgICAgICBhc3luY0dlbmVyYXRvclN0ZXAoZ2VuLCByZXNvbHZlLCByZWplY3QsIF9uZXh0LCBfdGhyb3csIFwidGhyb3dcIiwgZXJyKTtcbiAgICAgIH1cblxuICAgICAgX25leHQodW5kZWZpbmVkKTtcbiAgICB9KTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfYXN5bmNUb0dlbmVyYXRvcjsiLCJmdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9jbGFzc0NhbGxDaGVjazsiLCJmdW5jdGlvbiBfZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2NyZWF0ZUNsYXNzKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICBpZiAocHJvdG9Qcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgaWYgKHN0YXRpY1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICByZXR1cm4gQ29uc3RydWN0b3I7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2NyZWF0ZUNsYXNzOyIsImZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7XG4gIHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7XG4gICAgXCJkZWZhdWx0XCI6IG9ialxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQ7IiwidmFyIF90eXBlb2YgPSByZXF1aXJlKFwiLi4vaGVscGVycy90eXBlb2ZcIik7XG5cbmZ1bmN0aW9uIF9nZXRSZXF1aXJlV2lsZGNhcmRDYWNoZSgpIHtcbiAgaWYgKHR5cGVvZiBXZWFrTWFwICE9PSBcImZ1bmN0aW9uXCIpIHJldHVybiBudWxsO1xuICB2YXIgY2FjaGUgPSBuZXcgV2Vha01hcCgpO1xuXG4gIF9nZXRSZXF1aXJlV2lsZGNhcmRDYWNoZSA9IGZ1bmN0aW9uIF9nZXRSZXF1aXJlV2lsZGNhcmRDYWNoZSgpIHtcbiAgICByZXR1cm4gY2FjaGU7XG4gIH07XG5cbiAgcmV0dXJuIGNhY2hlO1xufVxuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChvYmopIHtcbiAgaWYgKG9iaiAmJiBvYmouX19lc01vZHVsZSkge1xuICAgIHJldHVybiBvYmo7XG4gIH1cblxuICBpZiAob2JqID09PSBudWxsIHx8IF90eXBlb2Yob2JqKSAhPT0gXCJvYmplY3RcIiAmJiB0eXBlb2Ygb2JqICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgXCJkZWZhdWx0XCI6IG9ialxuICAgIH07XG4gIH1cblxuICB2YXIgY2FjaGUgPSBfZ2V0UmVxdWlyZVdpbGRjYXJkQ2FjaGUoKTtcblxuICBpZiAoY2FjaGUgJiYgY2FjaGUuaGFzKG9iaikpIHtcbiAgICByZXR1cm4gY2FjaGUuZ2V0KG9iaik7XG4gIH1cblxuICB2YXIgbmV3T2JqID0ge307XG4gIHZhciBoYXNQcm9wZXJ0eURlc2NyaXB0b3IgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkgJiYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcblxuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcbiAgICAgIHZhciBkZXNjID0gaGFzUHJvcGVydHlEZXNjcmlwdG9yID8gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmosIGtleSkgOiBudWxsO1xuXG4gICAgICBpZiAoZGVzYyAmJiAoZGVzYy5nZXQgfHwgZGVzYy5zZXQpKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShuZXdPYmosIGtleSwgZGVzYyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdPYmpba2V5XSA9IG9ialtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG5ld09ialtcImRlZmF1bHRcIl0gPSBvYmo7XG5cbiAgaWYgKGNhY2hlKSB7XG4gICAgY2FjaGUuc2V0KG9iaiwgbmV3T2JqKTtcbiAgfVxuXG4gIHJldHVybiBuZXdPYmo7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQ7IiwiZnVuY3Rpb24gX2l0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkge1xuICBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJ1bmRlZmluZWRcIiB8fCAhKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkpIHJldHVybjtcbiAgdmFyIF9hcnIgPSBbXTtcbiAgdmFyIF9uID0gdHJ1ZTtcbiAgdmFyIF9kID0gZmFsc2U7XG4gIHZhciBfZSA9IHVuZGVmaW5lZDtcblxuICB0cnkge1xuICAgIGZvciAodmFyIF9pID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHtcbiAgICAgIF9hcnIucHVzaChfcy52YWx1ZSk7XG5cbiAgICAgIGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhaztcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIF9kID0gdHJ1ZTtcbiAgICBfZSA9IGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSAhPSBudWxsKSBfaVtcInJldHVyblwiXSgpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoX2QpIHRocm93IF9lO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBfYXJyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9pdGVyYWJsZVRvQXJyYXlMaW1pdDsiLCJmdW5jdGlvbiBfbm9uSXRlcmFibGVSZXN0KCkge1xuICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZS5cXG5JbiBvcmRlciB0byBiZSBpdGVyYWJsZSwgbm9uLWFycmF5IG9iamVjdHMgbXVzdCBoYXZlIGEgW1N5bWJvbC5pdGVyYXRvcl0oKSBtZXRob2QuXCIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9ub25JdGVyYWJsZVJlc3Q7IiwidmFyIGFycmF5V2l0aEhvbGVzID0gcmVxdWlyZShcIi4vYXJyYXlXaXRoSG9sZXNcIik7XG5cbnZhciBpdGVyYWJsZVRvQXJyYXlMaW1pdCA9IHJlcXVpcmUoXCIuL2l0ZXJhYmxlVG9BcnJheUxpbWl0XCIpO1xuXG52YXIgdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkgPSByZXF1aXJlKFwiLi91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheVwiKTtcblxudmFyIG5vbkl0ZXJhYmxlUmVzdCA9IHJlcXVpcmUoXCIuL25vbkl0ZXJhYmxlUmVzdFwiKTtcblxuZnVuY3Rpb24gX3NsaWNlZFRvQXJyYXkoYXJyLCBpKSB7XG4gIHJldHVybiBhcnJheVdpdGhIb2xlcyhhcnIpIHx8IGl0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkgfHwgdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkoYXJyLCBpKSB8fCBub25JdGVyYWJsZVJlc3QoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfc2xpY2VkVG9BcnJheTsiLCJmdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7XG5cbiAgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygb2JqO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHtcbiAgICAgIHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gX3R5cGVvZihvYmopO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF90eXBlb2Y7IiwidmFyIGFycmF5TGlrZVRvQXJyYXkgPSByZXF1aXJlKFwiLi9hcnJheUxpa2VUb0FycmF5XCIpO1xuXG5mdW5jdGlvbiBfdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkobywgbWluTGVuKSB7XG4gIGlmICghbykgcmV0dXJuO1xuICBpZiAodHlwZW9mIG8gPT09IFwic3RyaW5nXCIpIHJldHVybiBhcnJheUxpa2VUb0FycmF5KG8sIG1pbkxlbik7XG4gIHZhciBuID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLnNsaWNlKDgsIC0xKTtcbiAgaWYgKG4gPT09IFwiT2JqZWN0XCIgJiYgby5jb25zdHJ1Y3RvcikgbiA9IG8uY29uc3RydWN0b3IubmFtZTtcbiAgaWYgKG4gPT09IFwiTWFwXCIgfHwgbiA9PT0gXCJTZXRcIikgcmV0dXJuIEFycmF5LmZyb20obyk7XG4gIGlmIChuID09PSBcIkFyZ3VtZW50c1wiIHx8IC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pKSByZXR1cm4gYXJyYXlMaWtlVG9BcnJheShvLCBtaW5MZW4pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJyZWdlbmVyYXRvci1ydW50aW1lXCIpO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBvYmplY3RDcmVhdGUgPSBPYmplY3QuY3JlYXRlIHx8IG9iamVjdENyZWF0ZVBvbHlmaWxsXG52YXIgb2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzIHx8IG9iamVjdEtleXNQb2x5ZmlsbFxudmFyIGJpbmQgPSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCB8fCBmdW5jdGlvbkJpbmRQb2x5ZmlsbFxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcywgJ19ldmVudHMnKSkge1xuICAgIHRoaXMuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gIH1cblxuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG52YXIgZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG52YXIgaGFzRGVmaW5lUHJvcGVydHk7XG50cnkge1xuICB2YXIgbyA9IHt9O1xuICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgJ3gnLCB7IHZhbHVlOiAwIH0pO1xuICBoYXNEZWZpbmVQcm9wZXJ0eSA9IG8ueCA9PT0gMDtcbn0gY2F0Y2ggKGVycikgeyBoYXNEZWZpbmVQcm9wZXJ0eSA9IGZhbHNlIH1cbmlmIChoYXNEZWZpbmVQcm9wZXJ0eSkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRXZlbnRFbWl0dGVyLCAnZGVmYXVsdE1heExpc3RlbmVycycsIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24oYXJnKSB7XG4gICAgICAvLyBjaGVjayB3aGV0aGVyIHRoZSBpbnB1dCBpcyBhIHBvc2l0aXZlIG51bWJlciAod2hvc2UgdmFsdWUgaXMgemVybyBvclxuICAgICAgLy8gZ3JlYXRlciBhbmQgbm90IGEgTmFOKS5cbiAgICAgIGlmICh0eXBlb2YgYXJnICE9PSAnbnVtYmVyJyB8fCBhcmcgPCAwIHx8IGFyZyAhPT0gYXJnKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImRlZmF1bHRNYXhMaXN0ZW5lcnNcIiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gICAgICBkZWZhdWx0TWF4TGlzdGVuZXJzID0gYXJnO1xuICAgIH1cbiAgfSk7XG59IGVsc2Uge1xuICBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IGRlZmF1bHRNYXhMaXN0ZW5lcnM7XG59XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycyhuKSB7XG4gIGlmICh0eXBlb2YgbiAhPT0gJ251bWJlcicgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJuXCIgYXJndW1lbnQgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uICRnZXRNYXhMaXN0ZW5lcnModGhhdCkge1xuICBpZiAodGhhdC5fbWF4TGlzdGVuZXJzID09PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICByZXR1cm4gdGhhdC5fbWF4TGlzdGVuZXJzO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmdldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIGdldE1heExpc3RlbmVycygpIHtcbiAgcmV0dXJuICRnZXRNYXhMaXN0ZW5lcnModGhpcyk7XG59O1xuXG4vLyBUaGVzZSBzdGFuZGFsb25lIGVtaXQqIGZ1bmN0aW9ucyBhcmUgdXNlZCB0byBvcHRpbWl6ZSBjYWxsaW5nIG9mIGV2ZW50XG4vLyBoYW5kbGVycyBmb3IgZmFzdCBjYXNlcyBiZWNhdXNlIGVtaXQoKSBpdHNlbGYgb2Z0ZW4gaGFzIGEgdmFyaWFibGUgbnVtYmVyIG9mXG4vLyBhcmd1bWVudHMgYW5kIGNhbiBiZSBkZW9wdGltaXplZCBiZWNhdXNlIG9mIHRoYXQuIFRoZXNlIGZ1bmN0aW9ucyBhbHdheXMgaGF2ZVxuLy8gdGhlIHNhbWUgbnVtYmVyIG9mIGFyZ3VtZW50cyBhbmQgdGh1cyBkbyBub3QgZ2V0IGRlb3B0aW1pemVkLCBzbyB0aGUgY29kZVxuLy8gaW5zaWRlIHRoZW0gY2FuIGV4ZWN1dGUgZmFzdGVyLlxuZnVuY3Rpb24gZW1pdE5vbmUoaGFuZGxlciwgaXNGbiwgc2VsZikge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmNhbGwoc2VsZik7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uY2FsbChzZWxmKTtcbiAgfVxufVxuZnVuY3Rpb24gZW1pdE9uZShoYW5kbGVyLCBpc0ZuLCBzZWxmLCBhcmcxKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuY2FsbChzZWxmLCBhcmcxKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5jYWxsKHNlbGYsIGFyZzEpO1xuICB9XG59XG5mdW5jdGlvbiBlbWl0VHdvKGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZzEsIGFyZzIpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5jYWxsKHNlbGYsIGFyZzEsIGFyZzIpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmNhbGwoc2VsZiwgYXJnMSwgYXJnMik7XG4gIH1cbn1cbmZ1bmN0aW9uIGVtaXRUaHJlZShoYW5kbGVyLCBpc0ZuLCBzZWxmLCBhcmcxLCBhcmcyLCBhcmczKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuY2FsbChzZWxmLCBhcmcxLCBhcmcyLCBhcmczKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5jYWxsKHNlbGYsIGFyZzEsIGFyZzIsIGFyZzMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGVtaXRNYW55KGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZ3MpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5hcHBseShzZWxmLCBhcmdzKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseShzZWxmLCBhcmdzKTtcbiAgfVxufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGV2ZW50cztcbiAgdmFyIGRvRXJyb3IgPSAodHlwZSA9PT0gJ2Vycm9yJyk7XG5cbiAgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICBpZiAoZXZlbnRzKVxuICAgIGRvRXJyb3IgPSAoZG9FcnJvciAmJiBldmVudHMuZXJyb3IgPT0gbnVsbCk7XG4gIGVsc2UgaWYgKCFkb0Vycm9yKVxuICAgIHJldHVybiBmYWxzZTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmIChkb0Vycm9yKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKVxuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBdCBsZWFzdCBnaXZlIHNvbWUga2luZCBvZiBjb250ZXh0IHRvIHRoZSB1c2VyXG4gICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmhhbmRsZWQgXCJlcnJvclwiIGV2ZW50LiAoJyArIGVyICsgJyknKTtcbiAgICAgIGVyci5jb250ZXh0ID0gZXI7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGhhbmRsZXIgPSBldmVudHNbdHlwZV07XG5cbiAgaWYgKCFoYW5kbGVyKVxuICAgIHJldHVybiBmYWxzZTtcblxuICB2YXIgaXNGbiA9IHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nO1xuICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICBzd2l0Y2ggKGxlbikge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgIGNhc2UgMTpcbiAgICAgIGVtaXROb25lKGhhbmRsZXIsIGlzRm4sIHRoaXMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAyOlxuICAgICAgZW1pdE9uZShoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAzOlxuICAgICAgZW1pdFR3byhoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDQ6XG4gICAgICBlbWl0VGhyZWUoaGFuZGxlciwgaXNGbiwgdGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0sIGFyZ3VtZW50c1szXSk7XG4gICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgIGRlZmF1bHQ6XG4gICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIGVtaXRNYW55KGhhbmRsZXIsIGlzRm4sIHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5mdW5jdGlvbiBfYWRkTGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgcHJlcGVuZCkge1xuICB2YXIgbTtcbiAgdmFyIGV2ZW50cztcbiAgdmFyIGV4aXN0aW5nO1xuXG4gIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzO1xuICBpZiAoIWV2ZW50cykge1xuICAgIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgIHRhcmdldC5fZXZlbnRzQ291bnQgPSAwO1xuICB9IGVsc2Uge1xuICAgIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gICAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICAgIGlmIChldmVudHMubmV3TGlzdGVuZXIpIHtcbiAgICAgIHRhcmdldC5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgPyBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICAgICAgLy8gUmUtYXNzaWduIGBldmVudHNgIGJlY2F1c2UgYSBuZXdMaXN0ZW5lciBoYW5kbGVyIGNvdWxkIGhhdmUgY2F1c2VkIHRoZVxuICAgICAgLy8gdGhpcy5fZXZlbnRzIHRvIGJlIGFzc2lnbmVkIHRvIGEgbmV3IG9iamVjdFxuICAgICAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG4gICAgfVxuICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdO1xuICB9XG5cbiAgaWYgKCFleGlzdGluZykge1xuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gICAgKyt0YXJnZXQuX2V2ZW50c0NvdW50O1xuICB9IGVsc2Uge1xuICAgIGlmICh0eXBlb2YgZXhpc3RpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV0gPVxuICAgICAgICAgIHByZXBlbmQgPyBbbGlzdGVuZXIsIGV4aXN0aW5nXSA6IFtleGlzdGluZywgbGlzdGVuZXJdO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgICBpZiAocHJlcGVuZCkge1xuICAgICAgICBleGlzdGluZy51bnNoaWZ0KGxpc3RlbmVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGV4aXN0aW5nLnB1c2gobGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gICAgaWYgKCFleGlzdGluZy53YXJuZWQpIHtcbiAgICAgIG0gPSAkZ2V0TWF4TGlzdGVuZXJzKHRhcmdldCk7XG4gICAgICBpZiAobSAmJiBtID4gMCAmJiBleGlzdGluZy5sZW5ndGggPiBtKSB7XG4gICAgICAgIGV4aXN0aW5nLndhcm5lZCA9IHRydWU7XG4gICAgICAgIHZhciB3ID0gbmV3IEVycm9yKCdQb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5IGxlYWsgZGV0ZWN0ZWQuICcgK1xuICAgICAgICAgICAgZXhpc3RpbmcubGVuZ3RoICsgJyBcIicgKyBTdHJpbmcodHlwZSkgKyAnXCIgbGlzdGVuZXJzICcgK1xuICAgICAgICAgICAgJ2FkZGVkLiBVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byAnICtcbiAgICAgICAgICAgICdpbmNyZWFzZSBsaW1pdC4nKTtcbiAgICAgICAgdy5uYW1lID0gJ01heExpc3RlbmVyc0V4Y2VlZGVkV2FybmluZyc7XG4gICAgICAgIHcuZW1pdHRlciA9IHRhcmdldDtcbiAgICAgICAgdy50eXBlID0gdHlwZTtcbiAgICAgICAgdy5jb3VudCA9IGV4aXN0aW5nLmxlbmd0aDtcbiAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlID09PSAnb2JqZWN0JyAmJiBjb25zb2xlLndhcm4pIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJyVzOiAlcycsIHcubmFtZSwgdy5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbiBhZGRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICByZXR1cm4gX2FkZExpc3RlbmVyKHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBmYWxzZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5wcmVwZW5kTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHByZXBlbmRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgcmV0dXJuIF9hZGRMaXN0ZW5lcih0aGlzLCB0eXBlLCBsaXN0ZW5lciwgdHJ1ZSk7XG4gICAgfTtcblxuZnVuY3Rpb24gb25jZVdyYXBwZXIoKSB7XG4gIGlmICghdGhpcy5maXJlZCkge1xuICAgIHRoaXMudGFyZ2V0LnJlbW92ZUxpc3RlbmVyKHRoaXMudHlwZSwgdGhpcy53cmFwRm4pO1xuICAgIHRoaXMuZmlyZWQgPSB0cnVlO1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0KTtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuY2FsbCh0aGlzLnRhcmdldCwgYXJndW1lbnRzWzBdKTtcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuY2FsbCh0aGlzLnRhcmdldCwgYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0pO1xuICAgICAgY2FzZSAzOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0LCBhcmd1bWVudHNbMF0sIGFyZ3VtZW50c1sxXSxcbiAgICAgICAgICAgIGFyZ3VtZW50c1syXSk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgKytpKVxuICAgICAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIHRoaXMubGlzdGVuZXIuYXBwbHkodGhpcy50YXJnZXQsIGFyZ3MpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBfb25jZVdyYXAodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgc3RhdGUgPSB7IGZpcmVkOiBmYWxzZSwgd3JhcEZuOiB1bmRlZmluZWQsIHRhcmdldDogdGFyZ2V0LCB0eXBlOiB0eXBlLCBsaXN0ZW5lcjogbGlzdGVuZXIgfTtcbiAgdmFyIHdyYXBwZWQgPSBiaW5kLmNhbGwob25jZVdyYXBwZXIsIHN0YXRlKTtcbiAgd3JhcHBlZC5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICBzdGF0ZS53cmFwRm4gPSB3cmFwcGVkO1xuICByZXR1cm4gd3JhcHBlZDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZSh0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgdGhpcy5vbih0eXBlLCBfb25jZVdyYXAodGhpcywgdHlwZSwgbGlzdGVuZXIpKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnByZXBlbmRPbmNlTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHByZXBlbmRPbmNlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICAgIHRoaXMucHJlcGVuZExpc3RlbmVyKHR5cGUsIF9vbmNlV3JhcCh0aGlzLCB0eXBlLCBsaXN0ZW5lcikpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuLy8gRW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmIGFuZCBvbmx5IGlmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgbGlzdCwgZXZlbnRzLCBwb3NpdGlvbiwgaSwgb3JpZ2luYWxMaXN0ZW5lcjtcblxuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gICAgICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gICAgICBpZiAoIWV2ZW50cylcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIGxpc3QgPSBldmVudHNbdHlwZV07XG4gICAgICBpZiAoIWxpc3QpXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHwgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKC0tdGhpcy5fZXZlbnRzQ291bnQgPT09IDApXG4gICAgICAgICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgZXZlbnRzW3R5cGVdO1xuICAgICAgICAgIGlmIChldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdC5saXN0ZW5lciB8fCBsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGxpc3QgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcG9zaXRpb24gPSAtMTtcblxuICAgICAgICBmb3IgKGkgPSBsaXN0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8IGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB7XG4gICAgICAgICAgICBvcmlnaW5hbExpc3RlbmVyID0gbGlzdFtpXS5saXN0ZW5lcjtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uID09PSAwKVxuICAgICAgICAgIGxpc3Quc2hpZnQoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHNwbGljZU9uZShsaXN0LCBwb3NpdGlvbik7XG5cbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKVxuICAgICAgICAgIGV2ZW50c1t0eXBlXSA9IGxpc3RbMF07XG5cbiAgICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgb3JpZ2luYWxMaXN0ZW5lciB8fCBsaXN0ZW5lcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID1cbiAgICBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnModHlwZSkge1xuICAgICAgdmFyIGxpc3RlbmVycywgZXZlbnRzLCBpO1xuXG4gICAgICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gICAgICBpZiAoIWV2ZW50cylcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgICAgIGlmICghZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgICAgICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudHNbdHlwZV0pIHtcbiAgICAgICAgICBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMClcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBkZWxldGUgZXZlbnRzW3R5cGVdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHZhciBrZXlzID0gb2JqZWN0S2V5cyhldmVudHMpO1xuICAgICAgICB2YXIga2V5O1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIGtleSA9IGtleXNbaV07XG4gICAgICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICAgICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgICAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBsaXN0ZW5lcnMgPSBldmVudHNbdHlwZV07XG5cbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgICAgIH0gZWxzZSBpZiAobGlzdGVuZXJzKSB7XG4gICAgICAgIC8vIExJRk8gb3JkZXJcbiAgICAgICAgZm9yIChpID0gbGlzdGVuZXJzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbmZ1bmN0aW9uIF9saXN0ZW5lcnModGFyZ2V0LCB0eXBlLCB1bndyYXApIHtcbiAgdmFyIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzO1xuXG4gIGlmICghZXZlbnRzKVxuICAgIHJldHVybiBbXTtcblxuICB2YXIgZXZsaXN0ZW5lciA9IGV2ZW50c1t0eXBlXTtcbiAgaWYgKCFldmxpc3RlbmVyKVxuICAgIHJldHVybiBbXTtcblxuICBpZiAodHlwZW9mIGV2bGlzdGVuZXIgPT09ICdmdW5jdGlvbicpXG4gICAgcmV0dXJuIHVud3JhcCA/IFtldmxpc3RlbmVyLmxpc3RlbmVyIHx8IGV2bGlzdGVuZXJdIDogW2V2bGlzdGVuZXJdO1xuXG4gIHJldHVybiB1bndyYXAgPyB1bndyYXBMaXN0ZW5lcnMoZXZsaXN0ZW5lcikgOiBhcnJheUNsb25lKGV2bGlzdGVuZXIsIGV2bGlzdGVuZXIubGVuZ3RoKTtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnModHlwZSkge1xuICByZXR1cm4gX2xpc3RlbmVycyh0aGlzLCB0eXBlLCB0cnVlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmF3TGlzdGVuZXJzID0gZnVuY3Rpb24gcmF3TGlzdGVuZXJzKHR5cGUpIHtcbiAgcmV0dXJuIF9saXN0ZW5lcnModGhpcywgdHlwZSwgZmFsc2UpO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIGlmICh0eXBlb2YgZW1pdHRlci5saXN0ZW5lckNvdW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJDb3VudCh0eXBlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbGlzdGVuZXJDb3VudC5jYWxsKGVtaXR0ZXIsIHR5cGUpO1xuICB9XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVyQ291bnQgPSBsaXN0ZW5lckNvdW50O1xuZnVuY3Rpb24gbGlzdGVuZXJDb3VudCh0eXBlKSB7XG4gIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHM7XG5cbiAgaWYgKGV2ZW50cykge1xuICAgIHZhciBldmxpc3RlbmVyID0gZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKHR5cGVvZiBldmxpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9IGVsc2UgaWYgKGV2bGlzdGVuZXIpIHtcbiAgICAgIHJldHVybiBldmxpc3RlbmVyLmxlbmd0aDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gMDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5ldmVudE5hbWVzID0gZnVuY3Rpb24gZXZlbnROYW1lcygpIHtcbiAgcmV0dXJuIHRoaXMuX2V2ZW50c0NvdW50ID4gMCA/IFJlZmxlY3Qub3duS2V5cyh0aGlzLl9ldmVudHMpIDogW107XG59O1xuXG4vLyBBYm91dCAxLjV4IGZhc3RlciB0aGFuIHRoZSB0d28tYXJnIHZlcnNpb24gb2YgQXJyYXkjc3BsaWNlKCkuXG5mdW5jdGlvbiBzcGxpY2VPbmUobGlzdCwgaW5kZXgpIHtcbiAgZm9yICh2YXIgaSA9IGluZGV4LCBrID0gaSArIDEsIG4gPSBsaXN0Lmxlbmd0aDsgayA8IG47IGkgKz0gMSwgayArPSAxKVxuICAgIGxpc3RbaV0gPSBsaXN0W2tdO1xuICBsaXN0LnBvcCgpO1xufVxuXG5mdW5jdGlvbiBhcnJheUNsb25lKGFyciwgbikge1xuICB2YXIgY29weSA9IG5ldyBBcnJheShuKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyArK2kpXG4gICAgY29weVtpXSA9IGFycltpXTtcbiAgcmV0dXJuIGNvcHk7XG59XG5cbmZ1bmN0aW9uIHVud3JhcExpc3RlbmVycyhhcnIpIHtcbiAgdmFyIHJldCA9IG5ldyBBcnJheShhcnIubGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXQubGVuZ3RoOyArK2kpIHtcbiAgICByZXRbaV0gPSBhcnJbaV0ubGlzdGVuZXIgfHwgYXJyW2ldO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIG9iamVjdENyZWF0ZVBvbHlmaWxsKHByb3RvKSB7XG4gIHZhciBGID0gZnVuY3Rpb24oKSB7fTtcbiAgRi5wcm90b3R5cGUgPSBwcm90bztcbiAgcmV0dXJuIG5ldyBGO1xufVxuZnVuY3Rpb24gb2JqZWN0S2V5c1BvbHlmaWxsKG9iaikge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrIGluIG9iaikgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGspKSB7XG4gICAga2V5cy5wdXNoKGspO1xuICB9XG4gIHJldHVybiBrO1xufVxuZnVuY3Rpb24gZnVuY3Rpb25CaW5kUG9seWZpbGwoY29udGV4dCkge1xuICB2YXIgZm4gPSB0aGlzO1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmbi5hcHBseShjb250ZXh0LCBhcmd1bWVudHMpO1xuICB9O1xufVxuIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG52YXIgcnVudGltZSA9IChmdW5jdGlvbiAoZXhwb3J0cykge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgT3AgPSBPYmplY3QucHJvdG90eXBlO1xuICB2YXIgaGFzT3duID0gT3AuaGFzT3duUHJvcGVydHk7XG4gIHZhciB1bmRlZmluZWQ7IC8vIE1vcmUgY29tcHJlc3NpYmxlIHRoYW4gdm9pZCAwLlxuICB2YXIgJFN5bWJvbCA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiA/IFN5bWJvbCA6IHt9O1xuICB2YXIgaXRlcmF0b3JTeW1ib2wgPSAkU3ltYm9sLml0ZXJhdG9yIHx8IFwiQEBpdGVyYXRvclwiO1xuICB2YXIgYXN5bmNJdGVyYXRvclN5bWJvbCA9ICRTeW1ib2wuYXN5bmNJdGVyYXRvciB8fCBcIkBAYXN5bmNJdGVyYXRvclwiO1xuICB2YXIgdG9TdHJpbmdUYWdTeW1ib2wgPSAkU3ltYm9sLnRvU3RyaW5nVGFnIHx8IFwiQEB0b1N0cmluZ1RhZ1wiO1xuXG4gIGZ1bmN0aW9uIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBJZiBvdXRlckZuIHByb3ZpZGVkIGFuZCBvdXRlckZuLnByb3RvdHlwZSBpcyBhIEdlbmVyYXRvciwgdGhlbiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvci5cbiAgICB2YXIgcHJvdG9HZW5lcmF0b3IgPSBvdXRlckZuICYmIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yID8gb3V0ZXJGbiA6IEdlbmVyYXRvcjtcbiAgICB2YXIgZ2VuZXJhdG9yID0gT2JqZWN0LmNyZWF0ZShwcm90b0dlbmVyYXRvci5wcm90b3R5cGUpO1xuICAgIHZhciBjb250ZXh0ID0gbmV3IENvbnRleHQodHJ5TG9jc0xpc3QgfHwgW10pO1xuXG4gICAgLy8gVGhlIC5faW52b2tlIG1ldGhvZCB1bmlmaWVzIHRoZSBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlIC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcy5cbiAgICBnZW5lcmF0b3IuX2ludm9rZSA9IG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG5cbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9XG4gIGV4cG9ydHMud3JhcCA9IHdyYXA7XG5cbiAgLy8gVHJ5L2NhdGNoIGhlbHBlciB0byBtaW5pbWl6ZSBkZW9wdGltaXphdGlvbnMuIFJldHVybnMgYSBjb21wbGV0aW9uXG4gIC8vIHJlY29yZCBsaWtlIGNvbnRleHQudHJ5RW50cmllc1tpXS5jb21wbGV0aW9uLiBUaGlzIGludGVyZmFjZSBjb3VsZFxuICAvLyBoYXZlIGJlZW4gKGFuZCB3YXMgcHJldmlvdXNseSkgZGVzaWduZWQgdG8gdGFrZSBhIGNsb3N1cmUgdG8gYmVcbiAgLy8gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50cywgYnV0IGluIGFsbCB0aGUgY2FzZXMgd2UgY2FyZSBhYm91dCB3ZVxuICAvLyBhbHJlYWR5IGhhdmUgYW4gZXhpc3RpbmcgbWV0aG9kIHdlIHdhbnQgdG8gY2FsbCwgc28gdGhlcmUncyBubyBuZWVkXG4gIC8vIHRvIGNyZWF0ZSBhIG5ldyBmdW5jdGlvbiBvYmplY3QuIFdlIGNhbiBldmVuIGdldCBhd2F5IHdpdGggYXNzdW1pbmdcbiAgLy8gdGhlIG1ldGhvZCB0YWtlcyBleGFjdGx5IG9uZSBhcmd1bWVudCwgc2luY2UgdGhhdCBoYXBwZW5zIHRvIGJlIHRydWVcbiAgLy8gaW4gZXZlcnkgY2FzZSwgc28gd2UgZG9uJ3QgaGF2ZSB0byB0b3VjaCB0aGUgYXJndW1lbnRzIG9iamVjdC4gVGhlXG4gIC8vIG9ubHkgYWRkaXRpb25hbCBhbGxvY2F0aW9uIHJlcXVpcmVkIGlzIHRoZSBjb21wbGV0aW9uIHJlY29yZCwgd2hpY2hcbiAgLy8gaGFzIGEgc3RhYmxlIHNoYXBlIGFuZCBzbyBob3BlZnVsbHkgc2hvdWxkIGJlIGNoZWFwIHRvIGFsbG9jYXRlLlxuICBmdW5jdGlvbiB0cnlDYXRjaChmbiwgb2JqLCBhcmcpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJub3JtYWxcIiwgYXJnOiBmbi5jYWxsKG9iaiwgYXJnKSB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJ0aHJvd1wiLCBhcmc6IGVyciB9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0ID0gXCJzdXNwZW5kZWRTdGFydFwiO1xuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCA9IFwic3VzcGVuZGVkWWllbGRcIjtcbiAgdmFyIEdlblN0YXRlRXhlY3V0aW5nID0gXCJleGVjdXRpbmdcIjtcbiAgdmFyIEdlblN0YXRlQ29tcGxldGVkID0gXCJjb21wbGV0ZWRcIjtcblxuICAvLyBSZXR1cm5pbmcgdGhpcyBvYmplY3QgZnJvbSB0aGUgaW5uZXJGbiBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzXG4gIC8vIGJyZWFraW5nIG91dCBvZiB0aGUgZGlzcGF0Y2ggc3dpdGNoIHN0YXRlbWVudC5cbiAgdmFyIENvbnRpbnVlU2VudGluZWwgPSB7fTtcblxuICAvLyBEdW1teSBjb25zdHJ1Y3RvciBmdW5jdGlvbnMgdGhhdCB3ZSB1c2UgYXMgdGhlIC5jb25zdHJ1Y3RvciBhbmRcbiAgLy8gLmNvbnN0cnVjdG9yLnByb3RvdHlwZSBwcm9wZXJ0aWVzIGZvciBmdW5jdGlvbnMgdGhhdCByZXR1cm4gR2VuZXJhdG9yXG4gIC8vIG9iamVjdHMuIEZvciBmdWxsIHNwZWMgY29tcGxpYW5jZSwgeW91IG1heSB3aXNoIHRvIGNvbmZpZ3VyZSB5b3VyXG4gIC8vIG1pbmlmaWVyIG5vdCB0byBtYW5nbGUgdGhlIG5hbWVzIG9mIHRoZXNlIHR3byBmdW5jdGlvbnMuXG4gIGZ1bmN0aW9uIEdlbmVyYXRvcigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fVxuXG4gIC8vIFRoaXMgaXMgYSBwb2x5ZmlsbCBmb3IgJUl0ZXJhdG9yUHJvdG90eXBlJSBmb3IgZW52aXJvbm1lbnRzIHRoYXRcbiAgLy8gZG9uJ3QgbmF0aXZlbHkgc3VwcG9ydCBpdC5cbiAgdmFyIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG4gIEl0ZXJhdG9yUHJvdG90eXBlW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB2YXIgZ2V0UHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG4gIHZhciBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSA9IGdldFByb3RvICYmIGdldFByb3RvKGdldFByb3RvKHZhbHVlcyhbXSkpKTtcbiAgaWYgKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICYmXG4gICAgICBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAhPT0gT3AgJiZcbiAgICAgIGhhc093bi5jYWxsKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlLCBpdGVyYXRvclN5bWJvbCkpIHtcbiAgICAvLyBUaGlzIGVudmlyb25tZW50IGhhcyBhIG5hdGl2ZSAlSXRlcmF0b3JQcm90b3R5cGUlOyB1c2UgaXQgaW5zdGVhZFxuICAgIC8vIG9mIHRoZSBwb2x5ZmlsbC5cbiAgICBJdGVyYXRvclByb3RvdHlwZSA9IE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlO1xuICB9XG5cbiAgdmFyIEdwID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlID1cbiAgICBHZW5lcmF0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShJdGVyYXRvclByb3RvdHlwZSk7XG4gIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdwLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb247XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlW3RvU3RyaW5nVGFnU3ltYm9sXSA9XG4gICAgR2VuZXJhdG9yRnVuY3Rpb24uZGlzcGxheU5hbWUgPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG5cbiAgLy8gSGVscGVyIGZvciBkZWZpbmluZyB0aGUgLm5leHQsIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcyBvZiB0aGVcbiAgLy8gSXRlcmF0b3IgaW50ZXJmYWNlIGluIHRlcm1zIG9mIGEgc2luZ2xlIC5faW52b2tlIG1ldGhvZC5cbiAgZnVuY3Rpb24gZGVmaW5lSXRlcmF0b3JNZXRob2RzKHByb3RvdHlwZSkge1xuICAgIFtcIm5leHRcIiwgXCJ0aHJvd1wiLCBcInJldHVyblwiXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgcHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZShtZXRob2QsIGFyZyk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgZXhwb3J0cy5pc0dlbmVyYXRvckZ1bmN0aW9uID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgdmFyIGN0b3IgPSB0eXBlb2YgZ2VuRnVuID09PSBcImZ1bmN0aW9uXCIgJiYgZ2VuRnVuLmNvbnN0cnVjdG9yO1xuICAgIHJldHVybiBjdG9yXG4gICAgICA/IGN0b3IgPT09IEdlbmVyYXRvckZ1bmN0aW9uIHx8XG4gICAgICAgIC8vIEZvciB0aGUgbmF0aXZlIEdlbmVyYXRvckZ1bmN0aW9uIGNvbnN0cnVjdG9yLCB0aGUgYmVzdCB3ZSBjYW5cbiAgICAgICAgLy8gZG8gaXMgdG8gY2hlY2sgaXRzIC5uYW1lIHByb3BlcnR5LlxuICAgICAgICAoY3Rvci5kaXNwbGF5TmFtZSB8fCBjdG9yLm5hbWUpID09PSBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgICAgIDogZmFsc2U7XG4gIH07XG5cbiAgZXhwb3J0cy5tYXJrID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgaWYgKE9iamVjdC5zZXRQcm90b3R5cGVPZikge1xuICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGdlbkZ1biwgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZW5GdW4uX19wcm90b19fID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gICAgICBpZiAoISh0b1N0cmluZ1RhZ1N5bWJvbCBpbiBnZW5GdW4pKSB7XG4gICAgICAgIGdlbkZ1blt0b1N0cmluZ1RhZ1N5bWJvbF0gPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG4gICAgICB9XG4gICAgfVxuICAgIGdlbkZ1bi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEdwKTtcbiAgICByZXR1cm4gZ2VuRnVuO1xuICB9O1xuXG4gIC8vIFdpdGhpbiB0aGUgYm9keSBvZiBhbnkgYXN5bmMgZnVuY3Rpb24sIGBhd2FpdCB4YCBpcyB0cmFuc2Zvcm1lZCB0b1xuICAvLyBgeWllbGQgcmVnZW5lcmF0b3JSdW50aW1lLmF3cmFwKHgpYCwgc28gdGhhdCB0aGUgcnVudGltZSBjYW4gdGVzdFxuICAvLyBgaGFzT3duLmNhbGwodmFsdWUsIFwiX19hd2FpdFwiKWAgdG8gZGV0ZXJtaW5lIGlmIHRoZSB5aWVsZGVkIHZhbHVlIGlzXG4gIC8vIG1lYW50IHRvIGJlIGF3YWl0ZWQuXG4gIGV4cG9ydHMuYXdyYXAgPSBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4geyBfX2F3YWl0OiBhcmcgfTtcbiAgfTtcblxuICBmdW5jdGlvbiBBc3luY0l0ZXJhdG9yKGdlbmVyYXRvciwgUHJvbWlzZUltcGwpIHtcbiAgICBmdW5jdGlvbiBpbnZva2UobWV0aG9kLCBhcmcsIHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGdlbmVyYXRvclttZXRob2RdLCBnZW5lcmF0b3IsIGFyZyk7XG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICByZWplY3QocmVjb3JkLmFyZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcmVzdWx0ID0gcmVjb3JkLmFyZztcbiAgICAgICAgdmFyIHZhbHVlID0gcmVzdWx0LnZhbHVlO1xuICAgICAgICBpZiAodmFsdWUgJiZcbiAgICAgICAgICAgIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJlxuICAgICAgICAgICAgaGFzT3duLmNhbGwodmFsdWUsIFwiX19hd2FpdFwiKSkge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlSW1wbC5yZXNvbHZlKHZhbHVlLl9fYXdhaXQpLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIGludm9rZShcIm5leHRcIiwgdmFsdWUsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJ0aHJvd1wiLCBlcnIsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gUHJvbWlzZUltcGwucmVzb2x2ZSh2YWx1ZSkudGhlbihmdW5jdGlvbih1bndyYXBwZWQpIHtcbiAgICAgICAgICAvLyBXaGVuIGEgeWllbGRlZCBQcm9taXNlIGlzIHJlc29sdmVkLCBpdHMgZmluYWwgdmFsdWUgYmVjb21lc1xuICAgICAgICAgIC8vIHRoZSAudmFsdWUgb2YgdGhlIFByb21pc2U8e3ZhbHVlLGRvbmV9PiByZXN1bHQgZm9yIHRoZVxuICAgICAgICAgIC8vIGN1cnJlbnQgaXRlcmF0aW9uLlxuICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IHVud3JhcHBlZDtcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgLy8gSWYgYSByZWplY3RlZCBQcm9taXNlIHdhcyB5aWVsZGVkLCB0aHJvdyB0aGUgcmVqZWN0aW9uIGJhY2tcbiAgICAgICAgICAvLyBpbnRvIHRoZSBhc3luYyBnZW5lcmF0b3IgZnVuY3Rpb24gc28gaXQgY2FuIGJlIGhhbmRsZWQgdGhlcmUuXG4gICAgICAgICAgcmV0dXJuIGludm9rZShcInRocm93XCIsIGVycm9yLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcHJldmlvdXNQcm9taXNlO1xuXG4gICAgZnVuY3Rpb24gZW5xdWV1ZShtZXRob2QsIGFyZykge1xuICAgICAgZnVuY3Rpb24gY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZUltcGwoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgaW52b2tlKG1ldGhvZCwgYXJnLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByZXZpb3VzUHJvbWlzZSA9XG4gICAgICAgIC8vIElmIGVucXVldWUgaGFzIGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiB3ZSB3YW50IHRvIHdhaXQgdW50aWxcbiAgICAgICAgLy8gYWxsIHByZXZpb3VzIFByb21pc2VzIGhhdmUgYmVlbiByZXNvbHZlZCBiZWZvcmUgY2FsbGluZyBpbnZva2UsXG4gICAgICAgIC8vIHNvIHRoYXQgcmVzdWx0cyBhcmUgYWx3YXlzIGRlbGl2ZXJlZCBpbiB0aGUgY29ycmVjdCBvcmRlci4gSWZcbiAgICAgICAgLy8gZW5xdWV1ZSBoYXMgbm90IGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiBpdCBpcyBpbXBvcnRhbnQgdG9cbiAgICAgICAgLy8gY2FsbCBpbnZva2UgaW1tZWRpYXRlbHksIHdpdGhvdXQgd2FpdGluZyBvbiBhIGNhbGxiYWNrIHRvIGZpcmUsXG4gICAgICAgIC8vIHNvIHRoYXQgdGhlIGFzeW5jIGdlbmVyYXRvciBmdW5jdGlvbiBoYXMgdGhlIG9wcG9ydHVuaXR5IHRvIGRvXG4gICAgICAgIC8vIGFueSBuZWNlc3Nhcnkgc2V0dXAgaW4gYSBwcmVkaWN0YWJsZSB3YXkuIFRoaXMgcHJlZGljdGFiaWxpdHlcbiAgICAgICAgLy8gaXMgd2h5IHRoZSBQcm9taXNlIGNvbnN0cnVjdG9yIHN5bmNocm9ub3VzbHkgaW52b2tlcyBpdHNcbiAgICAgICAgLy8gZXhlY3V0b3IgY2FsbGJhY2ssIGFuZCB3aHkgYXN5bmMgZnVuY3Rpb25zIHN5bmNocm9ub3VzbHlcbiAgICAgICAgLy8gZXhlY3V0ZSBjb2RlIGJlZm9yZSB0aGUgZmlyc3QgYXdhaXQuIFNpbmNlIHdlIGltcGxlbWVudCBzaW1wbGVcbiAgICAgICAgLy8gYXN5bmMgZnVuY3Rpb25zIGluIHRlcm1zIG9mIGFzeW5jIGdlbmVyYXRvcnMsIGl0IGlzIGVzcGVjaWFsbHlcbiAgICAgICAgLy8gaW1wb3J0YW50IHRvIGdldCB0aGlzIHJpZ2h0LCBldmVuIHRob3VnaCBpdCByZXF1aXJlcyBjYXJlLlxuICAgICAgICBwcmV2aW91c1Byb21pc2UgPyBwcmV2aW91c1Byb21pc2UudGhlbihcbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZyxcbiAgICAgICAgICAvLyBBdm9pZCBwcm9wYWdhdGluZyBmYWlsdXJlcyB0byBQcm9taXNlcyByZXR1cm5lZCBieSBsYXRlclxuICAgICAgICAgIC8vIGludm9jYXRpb25zIG9mIHRoZSBpdGVyYXRvci5cbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZ1xuICAgICAgICApIDogY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKTtcbiAgICB9XG5cbiAgICAvLyBEZWZpbmUgdGhlIHVuaWZpZWQgaGVscGVyIG1ldGhvZCB0aGF0IGlzIHVzZWQgdG8gaW1wbGVtZW50IC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gKHNlZSBkZWZpbmVJdGVyYXRvck1ldGhvZHMpLlxuICAgIHRoaXMuX2ludm9rZSA9IGVucXVldWU7XG4gIH1cblxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoQXN5bmNJdGVyYXRvci5wcm90b3R5cGUpO1xuICBBc3luY0l0ZXJhdG9yLnByb3RvdHlwZVthc3luY0l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgZXhwb3J0cy5Bc3luY0l0ZXJhdG9yID0gQXN5bmNJdGVyYXRvcjtcblxuICAvLyBOb3RlIHRoYXQgc2ltcGxlIGFzeW5jIGZ1bmN0aW9ucyBhcmUgaW1wbGVtZW50ZWQgb24gdG9wIG9mXG4gIC8vIEFzeW5jSXRlcmF0b3Igb2JqZWN0czsgdGhleSBqdXN0IHJldHVybiBhIFByb21pc2UgZm9yIHRoZSB2YWx1ZSBvZlxuICAvLyB0aGUgZmluYWwgcmVzdWx0IHByb2R1Y2VkIGJ5IHRoZSBpdGVyYXRvci5cbiAgZXhwb3J0cy5hc3luYyA9IGZ1bmN0aW9uKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0LCBQcm9taXNlSW1wbCkge1xuICAgIGlmIChQcm9taXNlSW1wbCA9PT0gdm9pZCAwKSBQcm9taXNlSW1wbCA9IFByb21pc2U7XG5cbiAgICB2YXIgaXRlciA9IG5ldyBBc3luY0l0ZXJhdG9yKFxuICAgICAgd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCksXG4gICAgICBQcm9taXNlSW1wbFxuICAgICk7XG5cbiAgICByZXR1cm4gZXhwb3J0cy5pc0dlbmVyYXRvckZ1bmN0aW9uKG91dGVyRm4pXG4gICAgICA/IGl0ZXIgLy8gSWYgb3V0ZXJGbiBpcyBhIGdlbmVyYXRvciwgcmV0dXJuIHRoZSBmdWxsIGl0ZXJhdG9yLlxuICAgICAgOiBpdGVyLm5leHQoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgIHJldHVybiByZXN1bHQuZG9uZSA/IHJlc3VsdC52YWx1ZSA6IGl0ZXIubmV4dCgpO1xuICAgICAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpIHtcbiAgICB2YXIgc3RhdGUgPSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZykge1xuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUV4ZWN1dGluZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBydW5uaW5nXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlQ29tcGxldGVkKSB7XG4gICAgICAgIGlmIChtZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHRocm93IGFyZztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJlIGZvcmdpdmluZywgcGVyIDI1LjMuMy4zLjMgb2YgdGhlIHNwZWM6XG4gICAgICAgIC8vIGh0dHBzOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1nZW5lcmF0b3JyZXN1bWVcbiAgICAgICAgcmV0dXJuIGRvbmVSZXN1bHQoKTtcbiAgICAgIH1cblxuICAgICAgY29udGV4dC5tZXRob2QgPSBtZXRob2Q7XG4gICAgICBjb250ZXh0LmFyZyA9IGFyZztcblxuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdmFyIGRlbGVnYXRlID0gY29udGV4dC5kZWxlZ2F0ZTtcbiAgICAgICAgaWYgKGRlbGVnYXRlKSB7XG4gICAgICAgICAgdmFyIGRlbGVnYXRlUmVzdWx0ID0gbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCk7XG4gICAgICAgICAgaWYgKGRlbGVnYXRlUmVzdWx0KSB7XG4gICAgICAgICAgICBpZiAoZGVsZWdhdGVSZXN1bHQgPT09IENvbnRpbnVlU2VudGluZWwpIGNvbnRpbnVlO1xuICAgICAgICAgICAgcmV0dXJuIGRlbGVnYXRlUmVzdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgICAvLyBTZXR0aW5nIGNvbnRleHQuX3NlbnQgZm9yIGxlZ2FjeSBzdXBwb3J0IG9mIEJhYmVsJ3NcbiAgICAgICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgICAgIGNvbnRleHQuc2VudCA9IGNvbnRleHQuX3NlbnQgPSBjb250ZXh0LmFyZztcblxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQpIHtcbiAgICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgICB0aHJvdyBjb250ZXh0LmFyZztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGNvbnRleHQuYXJnKTtcblxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInJldHVyblwiKSB7XG4gICAgICAgICAgY29udGV4dC5hYnJ1cHQoXCJyZXR1cm5cIiwgY29udGV4dC5hcmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUV4ZWN1dGluZztcblxuICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG4gICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIikge1xuICAgICAgICAgIC8vIElmIGFuIGV4Y2VwdGlvbiBpcyB0aHJvd24gZnJvbSBpbm5lckZuLCB3ZSBsZWF2ZSBzdGF0ZSA9PT1cbiAgICAgICAgICAvLyBHZW5TdGF0ZUV4ZWN1dGluZyBhbmQgbG9vcCBiYWNrIGZvciBhbm90aGVyIGludm9jYXRpb24uXG4gICAgICAgICAgc3RhdGUgPSBjb250ZXh0LmRvbmVcbiAgICAgICAgICAgID8gR2VuU3RhdGVDb21wbGV0ZWRcbiAgICAgICAgICAgIDogR2VuU3RhdGVTdXNwZW5kZWRZaWVsZDtcblxuICAgICAgICAgIGlmIChyZWNvcmQuYXJnID09PSBDb250aW51ZVNlbnRpbmVsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IHJlY29yZC5hcmcsXG4gICAgICAgICAgICBkb25lOiBjb250ZXh0LmRvbmVcbiAgICAgICAgICB9O1xuXG4gICAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgLy8gRGlzcGF0Y2ggdGhlIGV4Y2VwdGlvbiBieSBsb29waW5nIGJhY2sgYXJvdW5kIHRvIHRoZVxuICAgICAgICAgIC8vIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpIGNhbGwgYWJvdmUuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8vIENhbGwgZGVsZWdhdGUuaXRlcmF0b3JbY29udGV4dC5tZXRob2RdKGNvbnRleHQuYXJnKSBhbmQgaGFuZGxlIHRoZVxuICAvLyByZXN1bHQsIGVpdGhlciBieSByZXR1cm5pbmcgYSB7IHZhbHVlLCBkb25lIH0gcmVzdWx0IGZyb20gdGhlXG4gIC8vIGRlbGVnYXRlIGl0ZXJhdG9yLCBvciBieSBtb2RpZnlpbmcgY29udGV4dC5tZXRob2QgYW5kIGNvbnRleHQuYXJnLFxuICAvLyBzZXR0aW5nIGNvbnRleHQuZGVsZWdhdGUgdG8gbnVsbCwgYW5kIHJldHVybmluZyB0aGUgQ29udGludWVTZW50aW5lbC5cbiAgZnVuY3Rpb24gbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCkge1xuICAgIHZhciBtZXRob2QgPSBkZWxlZ2F0ZS5pdGVyYXRvcltjb250ZXh0Lm1ldGhvZF07XG4gICAgaWYgKG1ldGhvZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBBIC50aHJvdyBvciAucmV0dXJuIHdoZW4gdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBubyAudGhyb3dcbiAgICAgIC8vIG1ldGhvZCBhbHdheXMgdGVybWluYXRlcyB0aGUgeWllbGQqIGxvb3AuXG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgLy8gTm90ZTogW1wicmV0dXJuXCJdIG11c3QgYmUgdXNlZCBmb3IgRVMzIHBhcnNpbmcgY29tcGF0aWJpbGl0eS5cbiAgICAgICAgaWYgKGRlbGVnYXRlLml0ZXJhdG9yW1wicmV0dXJuXCJdKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBhIHJldHVybiBtZXRob2QsIGdpdmUgaXQgYVxuICAgICAgICAgIC8vIGNoYW5jZSB0byBjbGVhbiB1cC5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwicmV0dXJuXCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCk7XG5cbiAgICAgICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgLy8gSWYgbWF5YmVJbnZva2VEZWxlZ2F0ZShjb250ZXh0KSBjaGFuZ2VkIGNvbnRleHQubWV0aG9kIGZyb21cbiAgICAgICAgICAgIC8vIFwicmV0dXJuXCIgdG8gXCJ0aHJvd1wiLCBsZXQgdGhhdCBvdmVycmlkZSB0aGUgVHlwZUVycm9yIGJlbG93LlxuICAgICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgIGNvbnRleHQuYXJnID0gbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBcIlRoZSBpdGVyYXRvciBkb2VzIG5vdCBwcm92aWRlIGEgJ3Rocm93JyBtZXRob2RcIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChtZXRob2QsIGRlbGVnYXRlLml0ZXJhdG9yLCBjb250ZXh0LmFyZyk7XG5cbiAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciBpbmZvID0gcmVjb3JkLmFyZztcblxuICAgIGlmICghIGluZm8pIHtcbiAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFwiaXRlcmF0b3IgcmVzdWx0IGlzIG5vdCBhbiBvYmplY3RcIik7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIGlmIChpbmZvLmRvbmUpIHtcbiAgICAgIC8vIEFzc2lnbiB0aGUgcmVzdWx0IG9mIHRoZSBmaW5pc2hlZCBkZWxlZ2F0ZSB0byB0aGUgdGVtcG9yYXJ5XG4gICAgICAvLyB2YXJpYWJsZSBzcGVjaWZpZWQgYnkgZGVsZWdhdGUucmVzdWx0TmFtZSAoc2VlIGRlbGVnYXRlWWllbGQpLlxuICAgICAgY29udGV4dFtkZWxlZ2F0ZS5yZXN1bHROYW1lXSA9IGluZm8udmFsdWU7XG5cbiAgICAgIC8vIFJlc3VtZSBleGVjdXRpb24gYXQgdGhlIGRlc2lyZWQgbG9jYXRpb24gKHNlZSBkZWxlZ2F0ZVlpZWxkKS5cbiAgICAgIGNvbnRleHQubmV4dCA9IGRlbGVnYXRlLm5leHRMb2M7XG5cbiAgICAgIC8vIElmIGNvbnRleHQubWV0aG9kIHdhcyBcInRocm93XCIgYnV0IHRoZSBkZWxlZ2F0ZSBoYW5kbGVkIHRoZVxuICAgICAgLy8gZXhjZXB0aW9uLCBsZXQgdGhlIG91dGVyIGdlbmVyYXRvciBwcm9jZWVkIG5vcm1hbGx5LiBJZlxuICAgICAgLy8gY29udGV4dC5tZXRob2Qgd2FzIFwibmV4dFwiLCBmb3JnZXQgY29udGV4dC5hcmcgc2luY2UgaXQgaGFzIGJlZW5cbiAgICAgIC8vIFwiY29uc3VtZWRcIiBieSB0aGUgZGVsZWdhdGUgaXRlcmF0b3IuIElmIGNvbnRleHQubWV0aG9kIHdhc1xuICAgICAgLy8gXCJyZXR1cm5cIiwgYWxsb3cgdGhlIG9yaWdpbmFsIC5yZXR1cm4gY2FsbCB0byBjb250aW51ZSBpbiB0aGVcbiAgICAgIC8vIG91dGVyIGdlbmVyYXRvci5cbiAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCAhPT0gXCJyZXR1cm5cIikge1xuICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZS15aWVsZCB0aGUgcmVzdWx0IHJldHVybmVkIGJ5IHRoZSBkZWxlZ2F0ZSBtZXRob2QuXG4gICAgICByZXR1cm4gaW5mbztcbiAgICB9XG5cbiAgICAvLyBUaGUgZGVsZWdhdGUgaXRlcmF0b3IgaXMgZmluaXNoZWQsIHNvIGZvcmdldCBpdCBhbmQgY29udGludWUgd2l0aFxuICAgIC8vIHRoZSBvdXRlciBnZW5lcmF0b3IuXG4gICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gIH1cblxuICAvLyBEZWZpbmUgR2VuZXJhdG9yLnByb3RvdHlwZS57bmV4dCx0aHJvdyxyZXR1cm59IGluIHRlcm1zIG9mIHRoZVxuICAvLyB1bmlmaWVkIC5faW52b2tlIGhlbHBlciBtZXRob2QuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhHcCk7XG5cbiAgR3BbdG9TdHJpbmdUYWdTeW1ib2xdID0gXCJHZW5lcmF0b3JcIjtcblxuICAvLyBBIEdlbmVyYXRvciBzaG91bGQgYWx3YXlzIHJldHVybiBpdHNlbGYgYXMgdGhlIGl0ZXJhdG9yIG9iamVjdCB3aGVuIHRoZVxuICAvLyBAQGl0ZXJhdG9yIGZ1bmN0aW9uIGlzIGNhbGxlZCBvbiBpdC4gU29tZSBicm93c2VycycgaW1wbGVtZW50YXRpb25zIG9mIHRoZVxuICAvLyBpdGVyYXRvciBwcm90b3R5cGUgY2hhaW4gaW5jb3JyZWN0bHkgaW1wbGVtZW50IHRoaXMsIGNhdXNpbmcgdGhlIEdlbmVyYXRvclxuICAvLyBvYmplY3QgdG8gbm90IGJlIHJldHVybmVkIGZyb20gdGhpcyBjYWxsLiBUaGlzIGVuc3VyZXMgdGhhdCBkb2Vzbid0IGhhcHBlbi5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWdlbmVyYXRvci9pc3N1ZXMvMjc0IGZvciBtb3JlIGRldGFpbHMuXG4gIEdwW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEdwLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBHZW5lcmF0b3JdXCI7XG4gIH07XG5cbiAgZnVuY3Rpb24gcHVzaFRyeUVudHJ5KGxvY3MpIHtcbiAgICB2YXIgZW50cnkgPSB7IHRyeUxvYzogbG9jc1swXSB9O1xuXG4gICAgaWYgKDEgaW4gbG9jcykge1xuICAgICAgZW50cnkuY2F0Y2hMb2MgPSBsb2NzWzFdO1xuICAgIH1cblxuICAgIGlmICgyIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmZpbmFsbHlMb2MgPSBsb2NzWzJdO1xuICAgICAgZW50cnkuYWZ0ZXJMb2MgPSBsb2NzWzNdO1xuICAgIH1cblxuICAgIHRoaXMudHJ5RW50cmllcy5wdXNoKGVudHJ5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0VHJ5RW50cnkoZW50cnkpIHtcbiAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbiB8fCB7fTtcbiAgICByZWNvcmQudHlwZSA9IFwibm9ybWFsXCI7XG4gICAgZGVsZXRlIHJlY29yZC5hcmc7XG4gICAgZW50cnkuY29tcGxldGlvbiA9IHJlY29yZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQodHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBUaGUgcm9vdCBlbnRyeSBvYmplY3QgKGVmZmVjdGl2ZWx5IGEgdHJ5IHN0YXRlbWVudCB3aXRob3V0IGEgY2F0Y2hcbiAgICAvLyBvciBhIGZpbmFsbHkgYmxvY2spIGdpdmVzIHVzIGEgcGxhY2UgdG8gc3RvcmUgdmFsdWVzIHRocm93biBmcm9tXG4gICAgLy8gbG9jYXRpb25zIHdoZXJlIHRoZXJlIGlzIG5vIGVuY2xvc2luZyB0cnkgc3RhdGVtZW50LlxuICAgIHRoaXMudHJ5RW50cmllcyA9IFt7IHRyeUxvYzogXCJyb290XCIgfV07XG4gICAgdHJ5TG9jc0xpc3QuZm9yRWFjaChwdXNoVHJ5RW50cnksIHRoaXMpO1xuICAgIHRoaXMucmVzZXQodHJ1ZSk7XG4gIH1cblxuICBleHBvcnRzLmtleXMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGtleXMucHVzaChrZXkpO1xuICAgIH1cbiAgICBrZXlzLnJldmVyc2UoKTtcblxuICAgIC8vIFJhdGhlciB0aGFuIHJldHVybmluZyBhbiBvYmplY3Qgd2l0aCBhIG5leHQgbWV0aG9kLCB3ZSBrZWVwXG4gICAgLy8gdGhpbmdzIHNpbXBsZSBhbmQgcmV0dXJuIHRoZSBuZXh0IGZ1bmN0aW9uIGl0c2VsZi5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgIHdoaWxlIChrZXlzLmxlbmd0aCkge1xuICAgICAgICB2YXIga2V5ID0ga2V5cy5wb3AoKTtcbiAgICAgICAgaWYgKGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICBuZXh0LnZhbHVlID0ga2V5O1xuICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRvIGF2b2lkIGNyZWF0aW5nIGFuIGFkZGl0aW9uYWwgb2JqZWN0LCB3ZSBqdXN0IGhhbmcgdGhlIC52YWx1ZVxuICAgICAgLy8gYW5kIC5kb25lIHByb3BlcnRpZXMgb2ZmIHRoZSBuZXh0IGZ1bmN0aW9uIG9iamVjdCBpdHNlbGYuIFRoaXNcbiAgICAgIC8vIGFsc28gZW5zdXJlcyB0aGF0IHRoZSBtaW5pZmllciB3aWxsIG5vdCBhbm9ueW1pemUgdGhlIGZ1bmN0aW9uLlxuICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsdWVzKGl0ZXJhYmxlKSB7XG4gICAgaWYgKGl0ZXJhYmxlKSB7XG4gICAgICB2YXIgaXRlcmF0b3JNZXRob2QgPSBpdGVyYWJsZVtpdGVyYXRvclN5bWJvbF07XG4gICAgICBpZiAoaXRlcmF0b3JNZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yTWV0aG9kLmNhbGwoaXRlcmFibGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGl0ZXJhYmxlLm5leHQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gaXRlcmFibGU7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNOYU4oaXRlcmFibGUubGVuZ3RoKSkge1xuICAgICAgICB2YXIgaSA9IC0xLCBuZXh0ID0gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgaXRlcmFibGUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duLmNhbGwoaXRlcmFibGUsIGkpKSB7XG4gICAgICAgICAgICAgIG5leHQudmFsdWUgPSBpdGVyYWJsZVtpXTtcbiAgICAgICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHQudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXh0Lm5leHQgPSBuZXh0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybiBhbiBpdGVyYXRvciB3aXRoIG5vIHZhbHVlcy5cbiAgICByZXR1cm4geyBuZXh0OiBkb25lUmVzdWx0IH07XG4gIH1cbiAgZXhwb3J0cy52YWx1ZXMgPSB2YWx1ZXM7XG5cbiAgZnVuY3Rpb24gZG9uZVJlc3VsdCgpIHtcbiAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIH1cblxuICBDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogQ29udGV4dCxcblxuICAgIHJlc2V0OiBmdW5jdGlvbihza2lwVGVtcFJlc2V0KSB7XG4gICAgICB0aGlzLnByZXYgPSAwO1xuICAgICAgdGhpcy5uZXh0ID0gMDtcbiAgICAgIC8vIFJlc2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgdGhpcy5zZW50ID0gdGhpcy5fc2VudCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICB0aGlzLmFyZyA9IHVuZGVmaW5lZDtcblxuICAgICAgdGhpcy50cnlFbnRyaWVzLmZvckVhY2gocmVzZXRUcnlFbnRyeSk7XG5cbiAgICAgIGlmICghc2tpcFRlbXBSZXNldCkge1xuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMpIHtcbiAgICAgICAgICAvLyBOb3Qgc3VyZSBhYm91dCB0aGUgb3B0aW1hbCBvcmRlciBvZiB0aGVzZSBjb25kaXRpb25zOlxuICAgICAgICAgIGlmIChuYW1lLmNoYXJBdCgwKSA9PT0gXCJ0XCIgJiZcbiAgICAgICAgICAgICAgaGFzT3duLmNhbGwodGhpcywgbmFtZSkgJiZcbiAgICAgICAgICAgICAgIWlzTmFOKCtuYW1lLnNsaWNlKDEpKSkge1xuICAgICAgICAgICAgdGhpc1tuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICB2YXIgcm9vdEVudHJ5ID0gdGhpcy50cnlFbnRyaWVzWzBdO1xuICAgICAgdmFyIHJvb3RSZWNvcmQgPSByb290RW50cnkuY29tcGxldGlvbjtcbiAgICAgIGlmIChyb290UmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByb290UmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucnZhbDtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hFeGNlcHRpb246IGZ1bmN0aW9uKGV4Y2VwdGlvbikge1xuICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICB9XG5cbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZShsb2MsIGNhdWdodCkge1xuICAgICAgICByZWNvcmQudHlwZSA9IFwidGhyb3dcIjtcbiAgICAgICAgcmVjb3JkLmFyZyA9IGV4Y2VwdGlvbjtcbiAgICAgICAgY29udGV4dC5uZXh0ID0gbG9jO1xuXG4gICAgICAgIGlmIChjYXVnaHQpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGlzcGF0Y2hlZCBleGNlcHRpb24gd2FzIGNhdWdodCBieSBhIGNhdGNoIGJsb2NrLFxuICAgICAgICAgIC8vIHRoZW4gbGV0IHRoYXQgY2F0Y2ggYmxvY2sgaGFuZGxlIHRoZSBleGNlcHRpb24gbm9ybWFsbHkuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAhISBjYXVnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSBcInJvb3RcIikge1xuICAgICAgICAgIC8vIEV4Y2VwdGlvbiB0aHJvd24gb3V0c2lkZSBvZiBhbnkgdHJ5IGJsb2NrIHRoYXQgY291bGQgaGFuZGxlXG4gICAgICAgICAgLy8gaXQsIHNvIHNldCB0aGUgY29tcGxldGlvbiB2YWx1ZSBvZiB0aGUgZW50aXJlIGZ1bmN0aW9uIHRvXG4gICAgICAgICAgLy8gdGhyb3cgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICByZXR1cm4gaGFuZGxlKFwiZW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYpIHtcbiAgICAgICAgICB2YXIgaGFzQ2F0Y2ggPSBoYXNPd24uY2FsbChlbnRyeSwgXCJjYXRjaExvY1wiKTtcbiAgICAgICAgICB2YXIgaGFzRmluYWxseSA9IGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIik7XG5cbiAgICAgICAgICBpZiAoaGFzQ2F0Y2ggJiYgaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0NhdGNoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHJ5IHN0YXRlbWVudCB3aXRob3V0IGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFicnVwdDogZnVuY3Rpb24odHlwZSwgYXJnKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIikgJiZcbiAgICAgICAgICAgIHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB2YXIgZmluYWxseUVudHJ5ID0gZW50cnk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSAmJlxuICAgICAgICAgICh0eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICAgdHlwZSA9PT0gXCJjb250aW51ZVwiKSAmJlxuICAgICAgICAgIGZpbmFsbHlFbnRyeS50cnlMb2MgPD0gYXJnICYmXG4gICAgICAgICAgYXJnIDw9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgIC8vIElnbm9yZSB0aGUgZmluYWxseSBlbnRyeSBpZiBjb250cm9sIGlzIG5vdCBqdW1waW5nIHRvIGFcbiAgICAgICAgLy8gbG9jYXRpb24gb3V0c2lkZSB0aGUgdHJ5L2NhdGNoIGJsb2NrLlxuICAgICAgICBmaW5hbGx5RW50cnkgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVjb3JkID0gZmluYWxseUVudHJ5ID8gZmluYWxseUVudHJ5LmNvbXBsZXRpb24gOiB7fTtcbiAgICAgIHJlY29yZC50eXBlID0gdHlwZTtcbiAgICAgIHJlY29yZC5hcmcgPSBhcmc7XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkpIHtcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2M7XG4gICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5jb21wbGV0ZShyZWNvcmQpO1xuICAgIH0sXG5cbiAgICBjb21wbGV0ZTogZnVuY3Rpb24ocmVjb3JkLCBhZnRlckxvYykge1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICByZWNvcmQudHlwZSA9PT0gXCJjb250aW51ZVwiKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IHJlY29yZC5hcmc7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInJldHVyblwiKSB7XG4gICAgICAgIHRoaXMucnZhbCA9IHRoaXMuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICB0aGlzLm5leHQgPSBcImVuZFwiO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIiAmJiBhZnRlckxvYykge1xuICAgICAgICB0aGlzLm5leHQgPSBhZnRlckxvYztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfSxcblxuICAgIGZpbmlzaDogZnVuY3Rpb24oZmluYWxseUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS5maW5hbGx5TG9jID09PSBmaW5hbGx5TG9jKSB7XG4gICAgICAgICAgdGhpcy5jb21wbGV0ZShlbnRyeS5jb21wbGV0aW9uLCBlbnRyeS5hZnRlckxvYyk7XG4gICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJjYXRjaFwiOiBmdW5jdGlvbih0cnlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSB0cnlMb2MpIHtcbiAgICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgdmFyIHRocm93biA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRocm93bjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29udGV4dC5jYXRjaCBtZXRob2QgbXVzdCBvbmx5IGJlIGNhbGxlZCB3aXRoIGEgbG9jYXRpb25cbiAgICAgIC8vIGFyZ3VtZW50IHRoYXQgY29ycmVzcG9uZHMgdG8gYSBrbm93biBjYXRjaCBibG9jay5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgY2F0Y2ggYXR0ZW1wdFwiKTtcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVZaWVsZDogZnVuY3Rpb24oaXRlcmFibGUsIHJlc3VsdE5hbWUsIG5leHRMb2MpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSB7XG4gICAgICAgIGl0ZXJhdG9yOiB2YWx1ZXMoaXRlcmFibGUpLFxuICAgICAgICByZXN1bHROYW1lOiByZXN1bHROYW1lLFxuICAgICAgICBuZXh0TG9jOiBuZXh0TG9jXG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5tZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgIC8vIERlbGliZXJhdGVseSBmb3JnZXQgdGhlIGxhc3Qgc2VudCB2YWx1ZSBzbyB0aGF0IHdlIGRvbid0XG4gICAgICAgIC8vIGFjY2lkZW50YWxseSBwYXNzIGl0IG9uIHRvIHRoZSBkZWxlZ2F0ZS5cbiAgICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cbiAgfTtcblxuICAvLyBSZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhpcyBzY3JpcHQgaXMgZXhlY3V0aW5nIGFzIGEgQ29tbW9uSlMgbW9kdWxlXG4gIC8vIG9yIG5vdCwgcmV0dXJuIHRoZSBydW50aW1lIG9iamVjdCBzbyB0aGF0IHdlIGNhbiBkZWNsYXJlIHRoZSB2YXJpYWJsZVxuICAvLyByZWdlbmVyYXRvclJ1bnRpbWUgaW4gdGhlIG91dGVyIHNjb3BlLCB3aGljaCBhbGxvd3MgdGhpcyBtb2R1bGUgdG8gYmVcbiAgLy8gaW5qZWN0ZWQgZWFzaWx5IGJ5IGBiaW4vcmVnZW5lcmF0b3IgLS1pbmNsdWRlLXJ1bnRpbWUgc2NyaXB0LmpzYC5cbiAgcmV0dXJuIGV4cG9ydHM7XG5cbn0oXG4gIC8vIElmIHRoaXMgc2NyaXB0IGlzIGV4ZWN1dGluZyBhcyBhIENvbW1vbkpTIG1vZHVsZSwgdXNlIG1vZHVsZS5leHBvcnRzXG4gIC8vIGFzIHRoZSByZWdlbmVyYXRvclJ1bnRpbWUgbmFtZXNwYWNlLiBPdGhlcndpc2UgY3JlYXRlIGEgbmV3IGVtcHR5XG4gIC8vIG9iamVjdC4gRWl0aGVyIHdheSwgdGhlIHJlc3VsdGluZyBvYmplY3Qgd2lsbCBiZSB1c2VkIHRvIGluaXRpYWxpemVcbiAgLy8gdGhlIHJlZ2VuZXJhdG9yUnVudGltZSB2YXJpYWJsZSBhdCB0aGUgdG9wIG9mIHRoaXMgZmlsZS5cbiAgdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiA/IG1vZHVsZS5leHBvcnRzIDoge31cbikpO1xuXG50cnkge1xuICByZWdlbmVyYXRvclJ1bnRpbWUgPSBydW50aW1lO1xufSBjYXRjaCAoYWNjaWRlbnRhbFN0cmljdE1vZGUpIHtcbiAgLy8gVGhpcyBtb2R1bGUgc2hvdWxkIG5vdCBiZSBydW5uaW5nIGluIHN0cmljdCBtb2RlLCBzbyB0aGUgYWJvdmVcbiAgLy8gYXNzaWdubWVudCBzaG91bGQgYWx3YXlzIHdvcmsgdW5sZXNzIHNvbWV0aGluZyBpcyBtaXNjb25maWd1cmVkLiBKdXN0XG4gIC8vIGluIGNhc2UgcnVudGltZS5qcyBhY2NpZGVudGFsbHkgcnVucyBpbiBzdHJpY3QgbW9kZSwgd2UgY2FuIGVzY2FwZVxuICAvLyBzdHJpY3QgbW9kZSB1c2luZyBhIGdsb2JhbCBGdW5jdGlvbiBjYWxsLiBUaGlzIGNvdWxkIGNvbmNlaXZhYmx5IGZhaWxcbiAgLy8gaWYgYSBDb250ZW50IFNlY3VyaXR5IFBvbGljeSBmb3JiaWRzIHVzaW5nIEZ1bmN0aW9uLCBidXQgaW4gdGhhdCBjYXNlXG4gIC8vIHRoZSBwcm9wZXIgc29sdXRpb24gaXMgdG8gZml4IHRoZSBhY2NpZGVudGFsIHN0cmljdCBtb2RlIHByb2JsZW0uIElmXG4gIC8vIHlvdSd2ZSBtaXNjb25maWd1cmVkIHlvdXIgYnVuZGxlciB0byBmb3JjZSBzdHJpY3QgbW9kZSBhbmQgYXBwbGllZCBhXG4gIC8vIENTUCB0byBmb3JiaWQgRnVuY3Rpb24sIGFuZCB5b3UncmUgbm90IHdpbGxpbmcgdG8gZml4IGVpdGhlciBvZiB0aG9zZVxuICAvLyBwcm9ibGVtcywgcGxlYXNlIGRldGFpbCB5b3VyIHVuaXF1ZSBwcmVkaWNhbWVudCBpbiBhIEdpdEh1YiBpc3N1ZS5cbiAgRnVuY3Rpb24oXCJyXCIsIFwicmVnZW5lcmF0b3JSdW50aW1lID0gclwiKShydW50aW1lKTtcbn1cbiJdfQ==
