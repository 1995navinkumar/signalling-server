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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvYmFja2dyb3VuZC9hdWRpby1wbGF5ZXIuanMiLCJjbGllbnQvYmFja2dyb3VuZC9jb25uZWN0aW9uLW1hbmFnZXIuanMiLCJjbGllbnQvYmFja2dyb3VuZC9oYXJrLmpzIiwiY2xpZW50L2JhY2tncm91bmQvaW5kZXguanMiLCJjbGllbnQvYmFja2dyb3VuZC9wZWVyLmpzIiwiY2xpZW50L2JhY2tncm91bmQvcnRjLmpzIiwiY2xpZW50L2JhY2tncm91bmQvd3MtaGFuZGxlci5qcyIsImNsaWVudC91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2FycmF5TGlrZVRvQXJyYXkuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9hcnJheVdpdGhIb2xlcy5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2FzeW5jVG9HZW5lcmF0b3IuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jbGFzc0NhbGxDaGVjay5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2NyZWF0ZUNsYXNzLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVXaWxkY2FyZC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2l0ZXJhYmxlVG9BcnJheUxpbWl0LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvbm9uSXRlcmFibGVSZXN0LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZi5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL3JlZ2VuZXJhdG9yL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCJub2RlX21vZHVsZXMvcmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7OztBQ0FBLFNBQVMsV0FBVCxHQUF1QjtBQUNuQixNQUFJLEtBQUssR0FBRyxJQUFJLEtBQUosRUFBWjs7QUFDQSxXQUFTLElBQVQsR0FBZ0I7QUFDWixJQUFBLEtBQUssQ0FBQyxJQUFOO0FBRUg7O0FBQ0QsV0FBUyxLQUFULEdBQWlCO0FBQ2IsSUFBQSxLQUFLLENBQUMsS0FBTjtBQUVIOztBQUNELFdBQVMsU0FBVCxDQUFtQixNQUFuQixFQUEyQjtBQUN2QixJQUFBLEtBQUssQ0FBQyxTQUFOLEdBQWtCLE1BQWxCO0FBQ0g7O0FBQ0QsV0FBUyxTQUFULEdBQXFCO0FBQ2pCLElBQUEsS0FBSyxDQUFDLFNBQU47QUFDSDs7QUFDRCxTQUFPO0FBQ0gsSUFBQSxJQUFJLEVBQUosSUFERztBQUVILElBQUEsS0FBSyxFQUFMLEtBRkc7QUFHSCxJQUFBLFNBQVMsRUFBVCxTQUhHO0FBSUgsSUFBQSxTQUFTLEVBQVQ7QUFKRyxHQUFQO0FBTUg7O0FBQ0QsSUFBSSxNQUFNLEdBQUcsV0FBVyxFQUF4QjtBQUNBLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLE1BQXJCO2VBQ2UsTTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN6QmY7O0FBQ0E7O0FBRUEsSUFBTSxpQkFBaUIsR0FBSSxTQUFTLGlCQUFULEdBQTZCO0FBQ3BELE1BQUksZ0JBQUo7O0FBRG9ELFdBRXJDLGdCQUZxQztBQUFBO0FBQUE7O0FBQUE7QUFB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Q0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM2dCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImZ1bmN0aW9uIEF1ZGlvUGxheWVyKCkge1xuICAgIHZhciBhdWRpbyA9IG5ldyBBdWRpbygpO1xuICAgIGZ1bmN0aW9uIHBsYXkoKSB7XG4gICAgICAgIGF1ZGlvLnBsYXkoKTtcblxuICAgIH1cbiAgICBmdW5jdGlvbiBwYXVzZSgpIHtcbiAgICAgICAgYXVkaW8ucGF1c2UoKTtcblxuICAgIH1cbiAgICBmdW5jdGlvbiBzZXRTdHJlYW0oc3RyZWFtKSB7XG4gICAgICAgIGF1ZGlvLnNyY09iamVjdCA9IHN0cmVhbTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZ2V0U3RyZWFtKCkge1xuICAgICAgICBhdWRpby5zcmNPYmplY3Q7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHBsYXksXG4gICAgICAgIHBhdXNlLFxuICAgICAgICBzZXRTdHJlYW0sXG4gICAgICAgIGdldFN0cmVhbVxuICAgIH1cbn1cbnZhciBwbGF5ZXIgPSBBdWRpb1BsYXllcigpO1xud2luZG93LkF1ZGlvUGxheWVyID0gcGxheWVyO1xuZXhwb3J0IGRlZmF1bHQgcGxheWVyOyIsImltcG9ydCB7IHBpcGUsIG1lc3NhZ2VQYXJzZXIgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cyc7XG5cbmNvbnN0IENvbm5lY3Rpb25NYW5hZ2VyID0gKGZ1bmN0aW9uIENvbm5lY3Rpb25NYW5hZ2VyKCkge1xuICAgIHZhciBhY3RpdmVDb25uZWN0aW9uO1xuICAgIGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUNvbm5lY3Rpb24odXJsLCBxdWVyeVBhcmFtcywgaGFuZGxlcikge1xuICAgICAgICB2YXIgd3MgPSBhd2FpdCBtYWtlQ29ubmVjdGlvbih1cmwsIHF1ZXJ5UGFyYW1zKTtcbiAgICAgICAgYWN0aXZlQ29ubmVjdGlvbiA9IG5ldyBDb25uZWN0aW9uKHdzLCBoYW5kbGVyKTtcbiAgICAgICAgcmV0dXJuIGFjdGl2ZUNvbm5lY3Rpb247XG4gICAgfVxuICAgIGZ1bmN0aW9uIHRlcm1pbmF0ZUNvbm5lY3Rpb24oKSB7XG4gICAgICAgIGlmICghYWN0aXZlQ29ubmVjdGlvbikgeyByZXR1cm4gfTtcbiAgICAgICAgYWN0aXZlQ29ubmVjdGlvbi5ldmVudHMuZW1pdChcImNsb3NlXCIpO1xuICAgICAgICBhY3RpdmVDb25uZWN0aW9uLmNsb3NlKCk7XG4gICAgICAgIGFjdGl2ZUNvbm5lY3Rpb24gPSB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiY29ubmVjdGlvbiB0ZXJtaW5hdGVkXCIpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnZXRDb25uZWN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYWN0aXZlQ29ubmVjdGlvbjtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY3JlYXRlQ29ubmVjdGlvbixcbiAgICAgICAgdGVybWluYXRlQ29ubmVjdGlvbixcbiAgICAgICAgZ2V0Q29ubmVjdGlvblxuICAgIH1cbn0pKCk7XG5cbndpbmRvdy5Db25uZWN0aW9uTWFuYWdlciA9IENvbm5lY3Rpb25NYW5hZ2VyO1xuXG5hc3luYyBmdW5jdGlvbiBtYWtlQ29ubmVjdGlvbih1cmwsIHF1ZXJ5UGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgdmFyIHdzID0gbmV3IFdlYlNvY2tldChgd3M6Ly8ke3VybH0/JHtxdWVyeVBhcmFtc31gKTtcbiAgICAgICAgd3Mub25vcGVuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJzb2NrZXQgY29ubmVjdGlvbiBlc3RhYmxpc2hlZCBcIik7XG4gICAgICAgICAgICByZXNvbHZlKHdzKTtcbiAgICAgICAgfTtcbiAgICAgICAgd3Mub25lcnJvciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImVycm9yIGluIGNvbm5lY3Rpb24gZXN0YWJsaXNobWVudFwiLCBlKTtcbiAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgfVxuICAgICAgICB3cy5vbmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJzb2NrZXQgY2xvc2VkXCIpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIENvbm5lY3Rpb24od3MsIGhhbmRsZXIpIHtcbiAgICB0aGlzLndzID0gd3M7XG4gICAgdGhpcy5oYW5kbGVyID0gTWVzc2FnZUhhbmRsZXIuY2FsbCh0aGlzLCBoYW5kbGVyKTtcbiAgICB0aGlzLmV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB3cy5vbm1lc3NhZ2UgPSBwaXBlKG1lc3NhZ2VQYXJzZXIsIHRoaXMuaGFuZGxlcik7XG59XG5cbkNvbm5lY3Rpb24ucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgdGhpcy53cy5jbG9zZSgxMDAwLCBcImxvZ2dlZCBvdXRcIik7XG59XG5cbkNvbm5lY3Rpb24ucHJvdG90eXBlLnNpZ25hbCA9IGZ1bmN0aW9uIHNpZ25hbChtZXNzYWdlKSB7XG4gICAgdGhpcy53cy5zZW5kKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpKVxufVxuXG5Db25uZWN0aW9uLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChtZXNzYWdlKSB7XG4gICAgbWVzc2FnZS5jYXRlZ29yeSA9IFwicmVxdWVzdFwiO1xuICAgIHRoaXMuc2lnbmFsKG1lc3NhZ2UpO1xufVxuXG5Db25uZWN0aW9uLnByb3RvdHlwZS5yZXNwb25kID0gZnVuY3Rpb24gcmVzcG9uZCh0bywgbWVzc2FnZSkge1xuICAgIG1lc3NhZ2UuY2F0ZWdvcnkgPSBcInJlc3BvbnNlXCI7XG4gICAgbWVzc2FnZS5kYXRhLm1lbWJlcklkID0gdG87XG4gICAgdGhpcy5zaWduYWwobWVzc2FnZSk7XG59XG5cbkNvbm5lY3Rpb24ucHJvdG90eXBlLmFjdGlvbiA9IGZ1bmN0aW9uIGFjdGlvbihtZXNzYWdlKSB7XG4gICAgbWVzc2FnZS5jYXRlZ29yeSA9IFwiYWN0aW9uXCI7XG4gICAgdGhpcy5zaWduYWwobWVzc2FnZSk7XG59XG5cbkNvbm5lY3Rpb24ucHJvdG90eXBlLndlYnJ0YyA9IGZ1bmN0aW9uIHdlYnJ0YyhtZXNzYWdlKSB7XG4gICAgbWVzc2FnZS5jYXRlZ29yeSA9IFwid2VicnRjXCI7XG4gICAgdGhpcy5zaWduYWwobWVzc2FnZSk7XG59XG5cbmZ1bmN0aW9uIE1lc3NhZ2VIYW5kbGVyKGNhdGVnb3J5TWFwcGVyKSB7XG4gICAgcmV0dXJuIChtZXNzYWdlKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuICAgICAgICB2YXIgeyBjYXRlZ29yeSwgdHlwZSwgZGF0YSB9ID0gbWVzc2FnZTtcbiAgICAgICAgaWYgKGNhdGVnb3J5ICYmIHR5cGUpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhdGVnb3J5TWFwcGVyW2NhdGVnb3J5XVt0eXBlXSh0aGlzLCBkYXRhKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBDb25uZWN0aW9uTWFuYWdlcjsiLCIvLyBvcmlnaW5hbCBzb3VyY2UgY29kZSBpcyB0YWtlbiBmcm9tOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL1NpbXBsZVdlYlJUQy9oYXJrXG4vLyBjb3B5cmlnaHQgZ29lcyB0byAmeWV0IHRlYW1cbi8vIGVkaXRlZCBieSBNdWF6IEtoYW4gZm9yIFJUQ011bHRpQ29ubmVjdGlvbi5qc1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaGFyayhzdHJlYW0sIG9wdGlvbnMpIHtcbiAgICB2YXIgYXVkaW9Db250ZXh0VHlwZSA9IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQgfHwgd2luZG93LkF1ZGlvQ29udGV4dDtcblxuICAgIHZhciBoYXJrZXIgPSB0aGlzO1xuICAgIGhhcmtlci5ldmVudHMgPSB7fTtcbiAgICBoYXJrZXIub24gPSBmdW5jdGlvbiAoZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgICAgIGhhcmtlci5ldmVudHNbZXZlbnRdID0gY2FsbGJhY2s7XG4gICAgfTtcblxuICAgIGhhcmtlci5lbWl0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoaGFya2VyLmV2ZW50c1thcmd1bWVudHNbMF1dKSB7XG4gICAgICAgICAgICBoYXJrZXIuZXZlbnRzW2FyZ3VtZW50c1swXV0oYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0sIGFyZ3VtZW50c1szXSwgYXJndW1lbnRzWzRdKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBtYWtlIGl0IG5vdCBicmVhayBpbiBub24tc3VwcG9ydGVkIGJyb3dzZXJzXG4gICAgaWYgKCFhdWRpb0NvbnRleHRUeXBlKSByZXR1cm4gaGFya2VyO1xuXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgLy8gQ29uZmlnXG4gICAgdmFyIHNtb290aGluZyA9IChvcHRpb25zLnNtb290aGluZyB8fCAwLjEpLFxuICAgICAgICBpbnRlcnZhbCA9IChvcHRpb25zLmludGVydmFsIHx8IDUwKSxcbiAgICAgICAgdGhyZXNob2xkID0gb3B0aW9ucy50aHJlc2hvbGQsXG4gICAgICAgIHBsYXkgPSBvcHRpb25zLnBsYXksXG4gICAgICAgIGhpc3RvcnkgPSBvcHRpb25zLmhpc3RvcnkgfHwgMTAsXG4gICAgICAgIHJ1bm5pbmcgPSB0cnVlO1xuXG4gICAgLy8gU2V0dXAgQXVkaW8gQ29udGV4dFxuICAgIGlmICghd2luZG93LmF1ZGlvQ29udGV4dDAwKSB7XG4gICAgICAgIHdpbmRvdy5hdWRpb0NvbnRleHQwMCA9IG5ldyBhdWRpb0NvbnRleHRUeXBlKCk7XG4gICAgfVxuXG4gICAgdmFyIGdhaW5Ob2RlID0gYXVkaW9Db250ZXh0MDAuY3JlYXRlR2FpbigpO1xuICAgIGdhaW5Ob2RlLmNvbm5lY3QoYXVkaW9Db250ZXh0MDAuZGVzdGluYXRpb24pO1xuICAgIC8vIGRvbid0IHBsYXkgZm9yIHNlbGZcbiAgICBnYWluTm9kZS5nYWluLnZhbHVlID0gMDtcblxuICAgIHZhciBzb3VyY2VOb2RlLCBmZnRCaW5zLCBhbmFseXNlcjtcblxuICAgIGFuYWx5c2VyID0gYXVkaW9Db250ZXh0MDAuY3JlYXRlQW5hbHlzZXIoKTtcbiAgICBhbmFseXNlci5mZnRTaXplID0gNTEyO1xuICAgIGFuYWx5c2VyLnNtb290aGluZ1RpbWVDb25zdGFudCA9IHNtb290aGluZztcbiAgICBmZnRCaW5zID0gbmV3IEZsb2F0MzJBcnJheShhbmFseXNlci5mZnRTaXplKTtcblxuICAgIC8vV2ViUlRDIFN0cmVhbVxuICAgIHNvdXJjZU5vZGUgPSBhdWRpb0NvbnRleHQwMC5jcmVhdGVNZWRpYVN0cmVhbVNvdXJjZShzdHJlYW0pO1xuICAgIHRocmVzaG9sZCA9IHRocmVzaG9sZCB8fCAtNTA7XG5cbiAgICBzb3VyY2VOb2RlLmNvbm5lY3QoYW5hbHlzZXIpO1xuICAgIGlmIChwbGF5KSBhbmFseXNlci5jb25uZWN0KGF1ZGlvQ29udGV4dDAwLmRlc3RpbmF0aW9uKTtcblxuICAgIGhhcmtlci5zcGVha2luZyA9IGZhbHNlO1xuXG4gICAgaGFya2VyLnNldFRocmVzaG9sZCA9IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgIHRocmVzaG9sZCA9IHQ7XG4gICAgfTtcblxuICAgIGhhcmtlci5zZXRJbnRlcnZhbCA9IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgIGludGVydmFsID0gaTtcbiAgICB9O1xuXG4gICAgaGFya2VyLnN0b3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgaGFya2VyLmVtaXQoJ3ZvbHVtZV9jaGFuZ2UnLCAtMTAwLCB0aHJlc2hvbGQpO1xuICAgICAgICBpZiAoaGFya2VyLnNwZWFraW5nKSB7XG4gICAgICAgICAgICBoYXJrZXIuc3BlYWtpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGhhcmtlci5lbWl0KCdzdG9wcGVkX3NwZWFraW5nJyk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGhhcmtlci5zcGVha2luZ0hpc3RvcnkgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhpc3Rvcnk7IGkrKykge1xuICAgICAgICBoYXJrZXIuc3BlYWtpbmdIaXN0b3J5LnB1c2goMCk7XG4gICAgfVxuXG4gICAgLy8gUG9sbCB0aGUgYW5hbHlzZXIgbm9kZSB0byBkZXRlcm1pbmUgaWYgc3BlYWtpbmdcbiAgICAvLyBhbmQgZW1pdCBldmVudHMgaWYgY2hhbmdlZFxuICAgIHZhciBsb29wZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAvL2NoZWNrIGlmIHN0b3AgaGFzIGJlZW4gY2FsbGVkXG4gICAgICAgICAgICBpZiAoIXJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBjdXJyZW50Vm9sdW1lID0gZ2V0TWF4Vm9sdW1lKGFuYWx5c2VyLCBmZnRCaW5zKTtcblxuICAgICAgICAgICAgaGFya2VyLmVtaXQoJ3ZvbHVtZV9jaGFuZ2UnLCBjdXJyZW50Vm9sdW1lLCB0aHJlc2hvbGQpO1xuXG4gICAgICAgICAgICB2YXIgaGlzdG9yeSA9IDA7XG4gICAgICAgICAgICBpZiAoY3VycmVudFZvbHVtZSA+IHRocmVzaG9sZCAmJiAhaGFya2VyLnNwZWFraW5nKSB7XG4gICAgICAgICAgICAgICAgLy8gdHJpZ2dlciBxdWlja2x5LCBzaG9ydCBoaXN0b3J5XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IGhhcmtlci5zcGVha2luZ0hpc3RvcnkubGVuZ3RoIC0gMzsgaSA8IGhhcmtlci5zcGVha2luZ0hpc3RvcnkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaGlzdG9yeSArPSBoYXJrZXIuc3BlYWtpbmdIaXN0b3J5W2ldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaGlzdG9yeSA+PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhcmtlci5zcGVha2luZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGhhcmtlci5lbWl0KCdzcGVha2luZycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFZvbHVtZSA8IHRocmVzaG9sZCAmJiBoYXJrZXIuc3BlYWtpbmcpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGhhcmtlci5zcGVha2luZ0hpc3RvcnkubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaGlzdG9yeSArPSBoYXJrZXIuc3BlYWtpbmdIaXN0b3J5W2pdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaGlzdG9yeSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBoYXJrZXIuc3BlYWtpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgaGFya2VyLmVtaXQoJ3N0b3BwZWRfc3BlYWtpbmcnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBoYXJrZXIuc3BlYWtpbmdIaXN0b3J5LnNoaWZ0KCk7XG4gICAgICAgICAgICBoYXJrZXIuc3BlYWtpbmdIaXN0b3J5LnB1c2goMCArIChjdXJyZW50Vm9sdW1lID4gdGhyZXNob2xkKSk7XG5cbiAgICAgICAgICAgIGxvb3BlcigpO1xuICAgICAgICB9LCBpbnRlcnZhbCk7XG4gICAgfTtcbiAgICBsb29wZXIoKTtcblxuICAgIGZ1bmN0aW9uIGdldE1heFZvbHVtZShhbmFseXNlciwgZmZ0Qmlucykge1xuICAgICAgICB2YXIgbWF4Vm9sdW1lID0gLUluZmluaXR5O1xuICAgICAgICBhbmFseXNlci5nZXRGbG9hdEZyZXF1ZW5jeURhdGEoZmZ0Qmlucyk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDQsIGlpID0gZmZ0Qmlucy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZmZ0Qmluc1tpXSA+IG1heFZvbHVtZSAmJiBmZnRCaW5zW2ldIDwgMCkge1xuICAgICAgICAgICAgICAgIG1heFZvbHVtZSA9IGZmdEJpbnNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWF4Vm9sdW1lO1xuICAgIH1cblxuICAgIHJldHVybiBoYXJrZXI7XG59IiwiaW1wb3J0IENvbm5lY3Rpb25NYW5hZ2VyIGZyb20gJy4vY29ubmVjdGlvbi1tYW5hZ2VyJztcbmltcG9ydCAqIGFzIFBlZXIgZnJvbSAnLi9wZWVyJztcbmltcG9ydCBBdWRpb1BsYXllciBmcm9tICcuL2F1ZGlvLXBsYXllcic7XG5pbXBvcnQgU29ja2V0SGFuZGxlciBmcm9tICcuL3dzLWhhbmRsZXInO1xuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMnO1xuXG5jb25zb2xlLmxvZyhQZWVyKVxud2luZG93LnBlZXIgPSBQZWVyO1xud2luZG93LlNvY2tldEhhbmRsZXIgPSBTb2NrZXRIYW5kbGVyO1xud2luZG93LmV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXIoKTsiLCJpbXBvcnQgQXVkaW9QbGF5ZXIgZnJvbSAnLi9hdWRpby1wbGF5ZXInO1xuaW1wb3J0IGhhcmsgZnJvbSAnLi9oYXJrJztcbnZhciBhdWRpb1N0cmVhbTtcblxudmFyIHBlZXIsIHBhcnR5TWVtYmVycyA9IHt9O1xuXG5mdW5jdGlvbiByZXNldCgpIHtcbiAgICBpZiAocGVlcikge1xuICAgICAgICBwZWVyLmNsb3NlKCk7XG4gICAgICAgIHBlZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmIChPYmplY3Qua2V5cyhwYXJ0eU1lbWJlcnMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcGFydHlNZW1iZXJzLmZvckVhY2gocGVlckNvbiA9PiB7XG4gICAgICAgICAgICBwZWVyQ29uLmNsb3NlKCk7XG4gICAgICAgIH0pXG4gICAgICAgIHBhcnR5TWVtYmVycyA9IHt9O1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEF1ZGlvU3RyZWFtKCkge1xuICAgIGlmICghYXVkaW9TdHJlYW0pIHtcbiAgICAgICAgYXVkaW9TdHJlYW0gPSBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBjaHJvbWUudGFicy5xdWVyeSh7IGFjdGl2ZTogdHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZSB9LCAodGFicykgPT4ge1xuICAgICAgICAgICAgICAgIGNocm9tZS50YWJDYXB0dXJlLmNhcHR1cmUoeyBhdWRpbzogdHJ1ZSB9LCAoc3RyZWFtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIEF1ZGlvUGxheWVyLnNldFN0cmVhbShzdHJlYW0pO1xuICAgICAgICAgICAgICAgICAgICBBdWRpb1BsYXllci5wbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc3RyZWFtKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gYXVkaW9TdHJlYW07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdG9wU3RyZWFtaW5nKCkge1xuICAgIGdldEF1ZGlvU3RyZWFtKCkudGhlbihzdHJlYW0gPT4ge1xuICAgICAgICB2YXIgdHJhY2tzID0gc3RyZWFtLmdldFRyYWNrcygpO1xuICAgICAgICB0cmFja3MgJiYgdHJhY2tzLmZvckVhY2goZnVuY3Rpb24gKHRyYWNrKSB7XG4gICAgICAgICAgICB0cmFjay5zdG9wKCk7XG4gICAgICAgIH0pO1xuXG4gICAgfSlcbn1cbiIsIi8qKlxuICogVXNlZCBmb3IgYWJzdHJhY3Rpb24gb2Ygd2VicnRjIGltcGxlbWVudGF0aW9uc1xuICogQG1vZHVsZSBSVENfQ29ubm5lY3RvclxuICogQGV4dGVuZHMgRXZlbnRUYXJnZXRcbiAqL1xuXG52YXIgbG9nID0gY29uc29sZS5sb2c7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cyc7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSVENfQ29ubm5lY3RvciB7XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaWNlU2VydmVycyBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcGVlckV2ZW50cyBTZXQgb2YgYWN0aW9ucyB0aGF0IGhhcyB0byBiZSBjYWxsZWQgZHVyaW5nIHRoZSBwZWVyIHRyYW5zbWlzc2lvbnNcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBwZWVyRXZlbnRzLm9uaWNlY2FuZGlkYXRlXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gcGVlckV2ZW50cy5vbnRyYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gcGVlckV2ZW50cy5vbm5lZ290aWF0aW9ubmVlZGVkICBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihpY2VTZXJ2ZXJzLCBzdHJlYW1zLCBwZWVyRXZlbnRzID0ge30pIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm9wZXJ0eSB7UlRDUGVlckNvbm5lY3Rpb259IHJ0Y1BlZXIgcnRjIHBlZXIgaW5zdGFuY2Ugd2hpY2ggaXMgdXNlZCB0byBpbml0aWF0ZSBhIGNvbW11bmljYXRpb24gd2l0aCBvdGhlciBwZWVycyBcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY29uc3RyYWludHMgPSB7XG4gICAgICAgICAgICBhdWRpbzogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnJ0Y1BlZXIgPSBuZXcgUlRDUGVlckNvbm5lY3Rpb24oe1xuICAgICAgICAgICAgaWNlU2VydmVyc1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgZXZlbnRIYW5kbGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgICAgICB0aGlzLm9uID0gZXZlbnRIYW5kbGVyLm9uO1xuICAgICAgICB0aGlzLm9mZiA9IGV2ZW50SGFuZGxlci5vZmY7XG4gICAgICAgIHRoaXMudHJpZ2dlciA9IGV2ZW50SGFuZGxlci5lbWl0O1xuXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMucnRjUGVlcik7XG5cblxuICAgICAgICB0aGlzLnJ0Y1BlZXIub25uZWdvdGlhdGlvbm5lZWRlZCA9IHRoaXMuX2luaXRpYXRlQ29ubmVjdGlvbi5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnJ0Y1BlZXIub250cmFjayA9IHRoaXMuX29udHJhY2suYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5ydGNQZWVyLm9uaWNlY2FuZGlkYXRlID0gdGhpcy5fb25pY2VjYW5kaWRhdGUuYmluZCh0aGlzKTtcblxuICAgICAgICBpZiAoc3RyZWFtcykge1xuICAgICAgICAgICAgZm9yIChjb25zdCB0cmFjayBvZiBzdHJlYW1zLmdldFRyYWNrcygpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ydGNQZWVyLmFkZFRyYWNrKHRyYWNrLCBzdHJlYW1zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vbnRyYWNrKGV2ZW50KSB7XG4gICAgICAgIGxvZyhcInRyYWNrIGFkZGVkIGluIHJ0Y1wiKTtcbiAgICAgICAgdGhpcy50cmlnZ2VyKFwic3RyZWFtUmVhZHlcIiwgZXZlbnQpO1xuICAgIH1cblxuICAgIGFzeW5jIF9pbml0aWF0ZUNvbm5lY3Rpb24oKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsb2coXCJOZWdvdGlhdGlvbiBzdGFydGVkXCIpO1xuICAgICAgICAgICAgY29uc3Qgb2ZmZXIgPSBhd2FpdCB0aGlzLnJ0Y1BlZXIuY3JlYXRlT2ZmZXIodGhpcy5jb25zdHJhaW50cyk7XG5cbiAgICAgICAgICAgIC8vIElmIHRoZSBjb25uZWN0aW9uIGhhc24ndCB5ZXQgYWNoaWV2ZWQgdGhlIFwic3RhYmxlXCIgc3RhdGUsXG4gICAgICAgICAgICAvLyByZXR1cm4gdG8gdGhlIGNhbGxlci4gQW5vdGhlciBuZWdvdGlhdGlvbm5lZWRlZCBldmVudFxuICAgICAgICAgICAgLy8gd2lsbCBiZSBmaXJlZCB3aGVuIHRoZSBzdGF0ZSBzdGFiaWxpemVzLlxuICAgICAgICAgICAgaWYgKHRoaXMucnRjUGVlci5zaWduYWxpbmdTdGF0ZSAhPSBcInN0YWJsZVwiKSB7XG4gICAgICAgICAgICAgICAgbG9nKFwiICAgICAtLSBUaGUgY29ubmVjdGlvbiBpc24ndCBzdGFibGUgeWV0OyBwb3N0cG9uaW5nLi4uXCIpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsb2coXCJTZXR0aW5nIHRvIGxvY2FsIGRlc2NyaXB0aW9uXCIpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5ydGNQZWVyLnNldExvY2FsRGVzY3JpcHRpb24ob2ZmZXIpO1xuXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoXCJvZmZlclJlYWR5XCIsIHRoaXMucnRjUGVlci5sb2NhbERlc2NyaXB0aW9uKTtcblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgbG9nKGBGYWlsZWQgaW4gTmVnb3RpYXRpb24gJHtlcnJvcn1gKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgYWNjZXB0T2ZmZXIob2ZmZXIpIHtcbiAgICAgICAgdmFyIGRlc2MgPSBuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKG9mZmVyKTtcblxuICAgICAgICAvLyBJZiB0aGUgY29ubmVjdGlvbiBpc24ndCBzdGFibGUgeWV0LCB3YWl0IGZvciBpdC4uLlxuXG4gICAgICAgIGlmICh0aGlzLnJ0Y1BlZXIuc2lnbmFsaW5nU3RhdGUgIT0gXCJzdGFibGVcIikge1xuICAgICAgICAgICAgbG9nKFwiICAtIEJ1dCB0aGUgc2lnbmFsaW5nIHN0YXRlIGlzbid0IHN0YWJsZSwgc28gdHJpZ2dlcmluZyByb2xsYmFja1wiKTtcblxuICAgICAgICAgICAgLy8gU2V0IHRoZSBsb2NhbCBhbmQgcmVtb3ZlIGRlc2NyaXB0aW9ucyBmb3Igcm9sbGJhY2s7IGRvbid0IHByb2NlZWRcbiAgICAgICAgICAgIC8vIHVudGlsIGJvdGggcmV0dXJuLlxuICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgICAgIHRoaXMucnRjUGVlci5zZXRMb2NhbERlc2NyaXB0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJyb2xsYmFja1wiXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgdGhpcy5ydGNQZWVyLnNldFJlbW90ZURlc2NyaXB0aW9uKGRlc2MpXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvZyhcIiAgLSBTZXR0aW5nIHJlbW90ZSBkZXNjcmlwdGlvblwiKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucnRjUGVlci5zZXRSZW1vdGVEZXNjcmlwdGlvbihkZXNjKTtcblxuICAgICAgICAgICAgbGV0IGFuc3dlciA9IGF3YWl0IHRoaXMucnRjUGVlci5jcmVhdGVBbnN3ZXIodGhpcy5jb25zdHJhaW50cyk7XG4gICAgICAgICAgICB0aGlzLnJ0Y1BlZXIuc2V0TG9jYWxEZXNjcmlwdGlvbihhbnN3ZXIpO1xuXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoXCJhbnN3ZXJSZWFkeVwiLCB0aGlzLnJ0Y1BlZXIubG9jYWxEZXNjcmlwdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRBbnN3ZXIoYW5zd2VyKSB7XG4gICAgICAgIHZhciBkZXNjID0gbmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbihhbnN3ZXIpO1xuICAgICAgICB0aGlzLnJ0Y1BlZXIuc2V0UmVtb3RlRGVzY3JpcHRpb24oZGVzYykudGhlbihfID0+IHtcbiAgICAgICAgICAgIGxvZyhcIk1hc3RlciBSZW1vdGUgRGVzY3JpcHRpb24gaXMgc2V0XCIpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzZXRSZW1vdGVDYW5kaWRhdGUoY2FuZGlkYXRlKSB7XG4gICAgICAgIGlmICh0aGlzLnJ0Y1BlZXIucmVtb3RlRGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIHZhciBjYW5kaWRhdGUgPSBuZXcgUlRDSWNlQ2FuZGlkYXRlKGNhbmRpZGF0ZSk7XG4gICAgICAgICAgICBsb2coXCJBZGRpbmcgcmVjZWl2ZWQgSUNFIGNhbmRpZGF0ZVwiKTtcbiAgICAgICAgICAgIHRoaXMucnRjUGVlci5hZGRJY2VDYW5kaWRhdGUoY2FuZGlkYXRlKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX29uaWNlY2FuZGlkYXRlKGV2ZW50KSB7XG4gICAgICAgIGxvZyhcImljZSBjYW5kaWRhdGUgaGFuZGxpbmdcIik7XG4gICAgICAgIGlmIChldmVudC5jYW5kaWRhdGUpIHtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcihcImNhbmRpZGF0ZVJlYWR5XCIsIGV2ZW50LmNhbmRpZGF0ZSk7XG4gICAgICAgIH1cbiAgICB9XG59IiwiaW1wb3J0IHsgZ2V0QXVkaW9TdHJlYW0gfSBmcm9tICcuL3BlZXInO1xuaW1wb3J0IEF1ZGlvUGxheWVyIGZyb20gJy4vYXVkaW8tcGxheWVyJztcbmltcG9ydCBSVENfQ29ubm5lY3RvciBmcm9tICcuL3J0Yyc7XG5pbXBvcnQgQ29ubmVjdGlvbk1hbmFnZXIgZnJvbSAnLi9jb25uZWN0aW9uLW1hbmFnZXInO1xuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi4vdXRpbHMnO1xuXG52YXIgYXVkaW9TdHJlYW0sIHBlZXIsIHBhcnR5TWVtYmVycyA9IHt9O1xuXG5jb25zdCBzZXJ2ZXJzID0ge1xuICAgIHVybHM6IFwic3R1bjpzdHVuMS5sLmdvb2dsZS5jb206MTkzMDJcIlxufVxuXG5jb25zdCB0dXJuU2VydmVyID0ge1xuICAgIHVybHM6ICd0dXJuOjE5Mi4xNTguMjkuMzk6MzQ3OD90cmFuc3BvcnQ9dWRwJyxcbiAgICBjcmVkZW50aWFsOiAnSlpFT0V0MlYzUWIweTI3R1JudHQydTJQQVlBPScsXG4gICAgdXNlcm5hbWU6ICcyODIyNDUxMToxMzc5MzMwODA4J1xufVxuXG5jb25zdCBpY2VTZXJ2ZXJzID0gW3NlcnZlcnMsIHR1cm5TZXJ2ZXJdO1xuXG5cbnZhciB3ZWJydGMgPSB7XG4gICAgXCJvZmZlclwiOiBmdW5jdGlvbiBvZmZlcihjb25uZWN0aW9uLCBkYXRhKSB7XG4gICAgICAgIHBlZXIgPSBuZXcgUlRDX0Nvbm5uZWN0b3IoaWNlU2VydmVycyk7XG4gICAgICAgIHZhciBtZW1iZXJJZCA9IGRhdGEubWVtYmVySWQ7XG4gICAgICAgIHZhciBjb25uZWN0aW9uID0gQ29ubmVjdGlvbk1hbmFnZXIuZ2V0Q29ubmVjdGlvbigpO1xuICAgICAgICBwZWVyLm9uKCdhbnN3ZXJSZWFkeScsIGZ1bmN0aW9uIChhbnN3ZXIpIHtcbiAgICAgICAgICAgIGNvbm5lY3Rpb24ud2VicnRjKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcImFuc3dlclwiLFxuICAgICAgICAgICAgICAgIGRhdGE6IHsgYW5zd2VyLCBtZW1iZXJJZCB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHBlZXIub24oJ2NhbmRpZGF0ZVJlYWR5JywgZnVuY3Rpb24gKGNhbmRpZGF0ZSkge1xuICAgICAgICAgICAgY29ubmVjdGlvbi53ZWJydGMoe1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiY2FuZGlkYXRlXCIsXG4gICAgICAgICAgICAgICAgZGF0YTogeyBjYW5kaWRhdGUsIG1lbWJlcklkIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcGVlci5vbihcInN0cmVhbVJlYWR5XCIsIGZ1bmN0aW9uICh7IHN0cmVhbXM6IFtzdHJlYW1dIH0pIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwic3RyZWFtUmVhZHlcIik7XG4gICAgICAgICAgICBBdWRpb1BsYXllci5zZXRTdHJlYW0oc3RyZWFtKTtcbiAgICAgICAgICAgIEF1ZGlvUGxheWVyLnBsYXkoKTtcbiAgICAgICAgfSlcbiAgICAgICAgcGVlci5hY2NlcHRPZmZlcihkYXRhLm9mZmVyKTtcbiAgICB9LFxuXG4gICAgXCJhbnN3ZXJcIjogZnVuY3Rpb24gYW5zd2VyKGNvbm5lY3Rpb24sIGRhdGEpIHtcbiAgICAgICAgdmFyIG1lbWJlcklkID0gZGF0YS5tZW1iZXJJZDtcbiAgICAgICAgdmFyIGNsaWVudFBlZXIgPSBwYXJ0eU1lbWJlcnNbbWVtYmVySWRdO1xuICAgICAgICBjbGllbnRQZWVyLnNldEFuc3dlcihkYXRhLmFuc3dlcik7XG4gICAgfSxcblxuICAgIFwiY2FuZGlkYXRlXCI6IGZ1bmN0aW9uIGNhbmRpZGF0ZShjb25uZWN0aW9uLCBkYXRhKSB7XG4gICAgICAgIGxldCBtZW1iZXJJZCA9IGRhdGEubWVtYmVySWQ7XG4gICAgICAgIGxldCBjbGllbnRQZWVyID0gcGFydHlNZW1iZXJzW21lbWJlcklkXSB8fCBwZWVyO1xuICAgICAgICBjbGllbnRQZWVyLnNldFJlbW90ZUNhbmRpZGF0ZShkYXRhLmNhbmRpZGF0ZSk7XG4gICAgfVxufVxuXG52YXIgcmVzcG9uc2UgPSB7XG4gICAgXCJwYXJ0eS1jcmVhdGlvbi1zdWNjZXNzXCI6IGZ1bmN0aW9uIChjb25uZWN0aW9uLCBkYXRhKSB7XG4gICAgICAgIHZhciBwb3B1cCA9IHV0aWxzLmdldFBvcHVwKCk7XG4gICAgICAgIHBvcHVwLmFwcC5zZXRTdGF0ZSh7XG4gICAgICAgICAgICByb3V0ZTogXCJwYXJ0eVwiXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgXCJqb2luLXBhcnR5LXN1Y2Nlc3NcIjogZnVuY3Rpb24gKGNvbm5lY3Rpb24sIGRhdGEpIHtcbiAgICAgICAgdmFyIHBvcHVwID0gdXRpbHMuZ2V0UG9wdXAoKTtcbiAgICAgICAgcG9wdXAuYXBwLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHJvdXRlOiBcInBhcnR5XCJcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBcImRqLWFjY2VwdFwiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGF1ZGlvU3RyZWFtID0gZ2V0QXVkaW9TdHJlYW0oKTtcbiAgICB9XG59XG5cbnZhciBub3RpZmljYXRpb24gPSB7XG4gICAgXCJqb2luLXBhcnR5XCI6IGFzeW5jIGZ1bmN0aW9uIChjb25uZWN0aW9uLCBkYXRhKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICB2YXIgY29ubmVjdGlvbiA9IENvbm5lY3Rpb25NYW5hZ2VyLmdldENvbm5lY3Rpb24oKTtcbiAgICAgICAgdmFyIGNsaWVudElkcyA9IGRhdGEubWVtYmVySWRzO1xuICAgICAgICB2YXIgc3RyZWFtT2JqID0gYXdhaXQgYXVkaW9TdHJlYW07XG4gICAgICAgIGNsaWVudElkcy5mb3JFYWNoKChtZW1iZXJJZCkgPT4ge1xuICAgICAgICAgICAgdmFyIGNsaWVudFBlZXIgPSBuZXcgUlRDX0Nvbm5uZWN0b3IoaWNlU2VydmVycywgc3RyZWFtT2JqKTtcbiAgICAgICAgICAgIHBhcnR5TWVtYmVyc1ttZW1iZXJJZF0gPSBjbGllbnRQZWVyO1xuICAgICAgICAgICAgY2xpZW50UGVlci5vbignb2ZmZXJSZWFkeScsIGZ1bmN0aW9uIChvZmZlcikge1xuICAgICAgICAgICAgICAgIGNvbm5lY3Rpb24ud2VicnRjKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJvZmZlclwiLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7IG9mZmVyLCBtZW1iZXJJZCB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNsaWVudFBlZXIub24oJ2NhbmRpZGF0ZVJlYWR5JywgZnVuY3Rpb24gKGNhbmRpZGF0ZSkge1xuICAgICAgICAgICAgICAgIGNvbm5lY3Rpb24ud2VicnRjKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJjYW5kaWRhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogeyBjYW5kaWRhdGUsIG1lbWJlcklkIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIHJlc3BvbnNlLFxuICAgIG5vdGlmaWNhdGlvbixcbiAgICB3ZWJydGNcbn1cbiIsImV4cG9ydCBjb25zdCBwaXBlID0gKC4uLmZucykgPT4geCA9PiBmbnMucmVkdWNlKCh5LCBmKSA9PiBmKHkpLCB4KTtcblxuZXhwb3J0IGZ1bmN0aW9uIG1lc3NhZ2VQYXJzZXIobWVzc2FnZSkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKG1lc3NhZ2UuZGF0YSk7XG59XG5cbnZhciBjb3VudCA9IDA7XG5leHBvcnQgZnVuY3Rpb24gdWlkKHN1ZmZpeCkge1xuICAgIHJldHVybiBgJHtjb3VudH1fJHtzdWZmaXh9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRXh0ZW5zaW9uKCkge1xuICAgIHJldHVybiBsb2NhdGlvbi5wcm90b2NvbC5pbmNsdWRlcyhcImNocm9tZS1leHRlbnNpb25cIik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCYWNrZ3JvdW5kKCkge1xuICAgIGlmIChpc0V4dGVuc2lvbigpKSB7XG4gICAgICAgIHJldHVybiBjaHJvbWUuZXh0ZW5zaW9uLmdldEJhY2tncm91bmRQYWdlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdztcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQb3B1cCgpIHtcbiAgICBpZiAoaXNFeHRlbnNpb24oKSkge1xuICAgICAgICByZXR1cm4gY2hyb21lLmV4dGVuc2lvbi5nZXRWaWV3cyh7IHR5cGU6IFwicG9wdXBcIiB9KVswXTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gd2luZG93O1xuICAgIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFVzZXJQcm9maWxlKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGlmIChpc0V4dGVuc2lvbigpKSB7XG4gICAgICAgICAgICBjaHJvbWUuaWRlbnRpdHkuZ2V0UHJvZmlsZVVzZXJJbmZvKHJlc29sdmUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnVzZXJQcm9maWxlXG4gICAgICAgICAgICAgICAgPyByZXNvbHZlKEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLnVzZXJQcm9maWxlKSlcbiAgICAgICAgICAgICAgICA6IHJlc29sdmUoe30pO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cblxuIiwiZnVuY3Rpb24gX2FycmF5TGlrZVRvQXJyYXkoYXJyLCBsZW4pIHtcbiAgaWYgKGxlbiA9PSBudWxsIHx8IGxlbiA+IGFyci5sZW5ndGgpIGxlbiA9IGFyci5sZW5ndGg7XG5cbiAgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBuZXcgQXJyYXkobGVuKTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgYXJyMltpXSA9IGFycltpXTtcbiAgfVxuXG4gIHJldHVybiBhcnIyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9hcnJheUxpa2VUb0FycmF5OyIsImZ1bmN0aW9uIF9hcnJheVdpdGhIb2xlcyhhcnIpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgcmV0dXJuIGFycjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfYXJyYXlXaXRoSG9sZXM7IiwiZnVuY3Rpb24gYXN5bmNHZW5lcmF0b3JTdGVwKGdlbiwgcmVzb2x2ZSwgcmVqZWN0LCBfbmV4dCwgX3Rocm93LCBrZXksIGFyZykge1xuICB0cnkge1xuICAgIHZhciBpbmZvID0gZ2VuW2tleV0oYXJnKTtcbiAgICB2YXIgdmFsdWUgPSBpbmZvLnZhbHVlO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJlamVjdChlcnJvcik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGluZm8uZG9uZSkge1xuICAgIHJlc29sdmUodmFsdWUpO1xuICB9IGVsc2Uge1xuICAgIFByb21pc2UucmVzb2x2ZSh2YWx1ZSkudGhlbihfbmV4dCwgX3Rocm93KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfYXN5bmNUb0dlbmVyYXRvcihmbikge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIGdlbiA9IGZuLmFwcGx5KHNlbGYsIGFyZ3MpO1xuXG4gICAgICBmdW5jdGlvbiBfbmV4dCh2YWx1ZSkge1xuICAgICAgICBhc3luY0dlbmVyYXRvclN0ZXAoZ2VuLCByZXNvbHZlLCByZWplY3QsIF9uZXh0LCBfdGhyb3csIFwibmV4dFwiLCB2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIF90aHJvdyhlcnIpIHtcbiAgICAgICAgYXN5bmNHZW5lcmF0b3JTdGVwKGdlbiwgcmVzb2x2ZSwgcmVqZWN0LCBfbmV4dCwgX3Rocm93LCBcInRocm93XCIsIGVycik7XG4gICAgICB9XG5cbiAgICAgIF9uZXh0KHVuZGVmaW5lZCk7XG4gICAgfSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2FzeW5jVG9HZW5lcmF0b3I7IiwiZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfY2xhc3NDYWxsQ2hlY2s7IiwiZnVuY3Rpb24gX2RlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlO1xuICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVDbGFzcyhDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgaWYgKHByb3RvUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gIGlmIChzdGF0aWNQcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTtcbiAgcmV0dXJuIENvbnN0cnVjdG9yO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9jcmVhdGVDbGFzczsiLCJmdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikge1xuICByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDoge1xuICAgIFwiZGVmYXVsdFwiOiBvYmpcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0OyIsInZhciBfdHlwZW9mID0gcmVxdWlyZShcIi4uL2hlbHBlcnMvdHlwZW9mXCIpO1xuXG5mdW5jdGlvbiBfZ2V0UmVxdWlyZVdpbGRjYXJkQ2FjaGUoKSB7XG4gIGlmICh0eXBlb2YgV2Vha01hcCAhPT0gXCJmdW5jdGlvblwiKSByZXR1cm4gbnVsbDtcbiAgdmFyIGNhY2hlID0gbmV3IFdlYWtNYXAoKTtcblxuICBfZ2V0UmVxdWlyZVdpbGRjYXJkQ2FjaGUgPSBmdW5jdGlvbiBfZ2V0UmVxdWlyZVdpbGRjYXJkQ2FjaGUoKSB7XG4gICAgcmV0dXJuIGNhY2hlO1xuICB9O1xuXG4gIHJldHVybiBjYWNoZTtcbn1cblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQob2JqKSB7XG4gIGlmIChvYmogJiYgb2JqLl9fZXNNb2R1bGUpIHtcbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgaWYgKG9iaiA9PT0gbnVsbCB8fCBfdHlwZW9mKG9iaikgIT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG9iaiAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIFwiZGVmYXVsdFwiOiBvYmpcbiAgICB9O1xuICB9XG5cbiAgdmFyIGNhY2hlID0gX2dldFJlcXVpcmVXaWxkY2FyZENhY2hlKCk7XG5cbiAgaWYgKGNhY2hlICYmIGNhY2hlLmhhcyhvYmopKSB7XG4gICAgcmV0dXJuIGNhY2hlLmdldChvYmopO1xuICB9XG5cbiAgdmFyIG5ld09iaiA9IHt9O1xuICB2YXIgaGFzUHJvcGVydHlEZXNjcmlwdG9yID0gT2JqZWN0LmRlZmluZVByb3BlcnR5ICYmIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG5cbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICB2YXIgZGVzYyA9IGhhc1Byb3BlcnR5RGVzY3JpcHRvciA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCBrZXkpIDogbnVsbDtcblxuICAgICAgaWYgKGRlc2MgJiYgKGRlc2MuZ2V0IHx8IGRlc2Muc2V0KSkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobmV3T2JqLCBrZXksIGRlc2MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3T2JqW2tleV0gPSBvYmpba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBuZXdPYmpbXCJkZWZhdWx0XCJdID0gb2JqO1xuXG4gIGlmIChjYWNoZSkge1xuICAgIGNhY2hlLnNldChvYmosIG5ld09iaik7XG4gIH1cblxuICByZXR1cm4gbmV3T2JqO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkOyIsImZ1bmN0aW9uIF9pdGVyYWJsZVRvQXJyYXlMaW1pdChhcnIsIGkpIHtcbiAgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwidW5kZWZpbmVkXCIgfHwgIShTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpKSByZXR1cm47XG4gIHZhciBfYXJyID0gW107XG4gIHZhciBfbiA9IHRydWU7XG4gIHZhciBfZCA9IGZhbHNlO1xuICB2YXIgX2UgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7XG4gICAgICBfYXJyLnB1c2goX3MudmFsdWUpO1xuXG4gICAgICBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBfZCA9IHRydWU7XG4gICAgX2UgPSBlcnI7XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghX24gJiYgX2lbXCJyZXR1cm5cIl0gIT0gbnVsbCkgX2lbXCJyZXR1cm5cIl0oKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKF9kKSB0aHJvdyBfZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gX2Fycjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfaXRlcmFibGVUb0FycmF5TGltaXQ7IiwiZnVuY3Rpb24gX25vbkl0ZXJhYmxlUmVzdCgpIHtcbiAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2UuXFxuSW4gb3JkZXIgdG8gYmUgaXRlcmFibGUsIG5vbi1hcnJheSBvYmplY3RzIG11c3QgaGF2ZSBhIFtTeW1ib2wuaXRlcmF0b3JdKCkgbWV0aG9kLlwiKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfbm9uSXRlcmFibGVSZXN0OyIsInZhciBhcnJheVdpdGhIb2xlcyA9IHJlcXVpcmUoXCIuL2FycmF5V2l0aEhvbGVzXCIpO1xuXG52YXIgaXRlcmFibGVUb0FycmF5TGltaXQgPSByZXF1aXJlKFwiLi9pdGVyYWJsZVRvQXJyYXlMaW1pdFwiKTtcblxudmFyIHVuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5ID0gcmVxdWlyZShcIi4vdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXlcIik7XG5cbnZhciBub25JdGVyYWJsZVJlc3QgPSByZXF1aXJlKFwiLi9ub25JdGVyYWJsZVJlc3RcIik7XG5cbmZ1bmN0aW9uIF9zbGljZWRUb0FycmF5KGFyciwgaSkge1xuICByZXR1cm4gYXJyYXlXaXRoSG9sZXMoYXJyKSB8fCBpdGVyYWJsZVRvQXJyYXlMaW1pdChhcnIsIGkpIHx8IHVuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5KGFyciwgaSkgfHwgbm9uSXRlcmFibGVSZXN0KCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3NsaWNlZFRvQXJyYXk7IiwiZnVuY3Rpb24gX3R5cGVvZihvYmopIHtcbiAgXCJAYmFiZWwvaGVscGVycyAtIHR5cGVvZlwiO1xuXG4gIGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIG9iajtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIF90eXBlb2Yob2JqKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfdHlwZW9mOyIsInZhciBhcnJheUxpa2VUb0FycmF5ID0gcmVxdWlyZShcIi4vYXJyYXlMaWtlVG9BcnJheVwiKTtcblxuZnVuY3Rpb24gX3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5KG8sIG1pbkxlbikge1xuICBpZiAoIW8pIHJldHVybjtcbiAgaWYgKHR5cGVvZiBvID09PSBcInN0cmluZ1wiKSByZXR1cm4gYXJyYXlMaWtlVG9BcnJheShvLCBtaW5MZW4pO1xuICB2YXIgbiA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKS5zbGljZSg4LCAtMSk7XG4gIGlmIChuID09PSBcIk9iamVjdFwiICYmIG8uY29uc3RydWN0b3IpIG4gPSBvLmNvbnN0cnVjdG9yLm5hbWU7XG4gIGlmIChuID09PSBcIk1hcFwiIHx8IG4gPT09IFwiU2V0XCIpIHJldHVybiBBcnJheS5mcm9tKG8pO1xuICBpZiAobiA9PT0gXCJBcmd1bWVudHNcIiB8fCAvXig/OlVpfEkpbnQoPzo4fDE2fDMyKSg/OkNsYW1wZWQpP0FycmF5JC8udGVzdChuKSkgcmV0dXJuIGFycmF5TGlrZVRvQXJyYXkobywgbWluTGVuKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXk7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicmVnZW5lcmF0b3ItcnVudGltZVwiKTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgb2JqZWN0Q3JlYXRlID0gT2JqZWN0LmNyZWF0ZSB8fCBvYmplY3RDcmVhdGVQb2x5ZmlsbFxudmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBvYmplY3RLZXlzUG9seWZpbGxcbnZhciBiaW5kID0gRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgfHwgZnVuY3Rpb25CaW5kUG9seWZpbGxcblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsICdfZXZlbnRzJykpIHtcbiAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICB9XG5cbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxudmFyIGRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxudmFyIGhhc0RlZmluZVByb3BlcnR5O1xudHJ5IHtcbiAgdmFyIG8gPSB7fTtcbiAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sICd4JywgeyB2YWx1ZTogMCB9KTtcbiAgaGFzRGVmaW5lUHJvcGVydHkgPSBvLnggPT09IDA7XG59IGNhdGNoIChlcnIpIHsgaGFzRGVmaW5lUHJvcGVydHkgPSBmYWxzZSB9XG5pZiAoaGFzRGVmaW5lUHJvcGVydHkpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEV2ZW50RW1pdHRlciwgJ2RlZmF1bHRNYXhMaXN0ZW5lcnMnLCB7XG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKGFyZykge1xuICAgICAgLy8gY2hlY2sgd2hldGhlciB0aGUgaW5wdXQgaXMgYSBwb3NpdGl2ZSBudW1iZXIgKHdob3NlIHZhbHVlIGlzIHplcm8gb3JcbiAgICAgIC8vIGdyZWF0ZXIgYW5kIG5vdCBhIE5hTikuXG4gICAgICBpZiAodHlwZW9mIGFyZyAhPT0gJ251bWJlcicgfHwgYXJnIDwgMCB8fCBhcmcgIT09IGFyZylcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJkZWZhdWx0TWF4TGlzdGVuZXJzXCIgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICAgICAgZGVmYXVsdE1heExpc3RlbmVycyA9IGFyZztcbiAgICB9XG4gIH0pO1xufSBlbHNlIHtcbiAgRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSBkZWZhdWx0TWF4TGlzdGVuZXJzO1xufVxuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMobikge1xuICBpZiAodHlwZW9mIG4gIT09ICdudW1iZXInIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiblwiIGFyZ3VtZW50IG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5mdW5jdGlvbiAkZ2V0TWF4TGlzdGVuZXJzKHRoYXQpIHtcbiAgaWYgKHRoYXQuX21heExpc3RlbmVycyA9PT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgcmV0dXJuIHRoYXQuX21heExpc3RlbmVycztcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5nZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBnZXRNYXhMaXN0ZW5lcnMoKSB7XG4gIHJldHVybiAkZ2V0TWF4TGlzdGVuZXJzKHRoaXMpO1xufTtcblxuLy8gVGhlc2Ugc3RhbmRhbG9uZSBlbWl0KiBmdW5jdGlvbnMgYXJlIHVzZWQgdG8gb3B0aW1pemUgY2FsbGluZyBvZiBldmVudFxuLy8gaGFuZGxlcnMgZm9yIGZhc3QgY2FzZXMgYmVjYXVzZSBlbWl0KCkgaXRzZWxmIG9mdGVuIGhhcyBhIHZhcmlhYmxlIG51bWJlciBvZlxuLy8gYXJndW1lbnRzIGFuZCBjYW4gYmUgZGVvcHRpbWl6ZWQgYmVjYXVzZSBvZiB0aGF0LiBUaGVzZSBmdW5jdGlvbnMgYWx3YXlzIGhhdmVcbi8vIHRoZSBzYW1lIG51bWJlciBvZiBhcmd1bWVudHMgYW5kIHRodXMgZG8gbm90IGdldCBkZW9wdGltaXplZCwgc28gdGhlIGNvZGVcbi8vIGluc2lkZSB0aGVtIGNhbiBleGVjdXRlIGZhc3Rlci5cbmZ1bmN0aW9uIGVtaXROb25lKGhhbmRsZXIsIGlzRm4sIHNlbGYpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5jYWxsKHNlbGYpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmNhbGwoc2VsZik7XG4gIH1cbn1cbmZ1bmN0aW9uIGVtaXRPbmUoaGFuZGxlciwgaXNGbiwgc2VsZiwgYXJnMSkge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmNhbGwoc2VsZiwgYXJnMSk7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uY2FsbChzZWxmLCBhcmcxKTtcbiAgfVxufVxuZnVuY3Rpb24gZW1pdFR3byhoYW5kbGVyLCBpc0ZuLCBzZWxmLCBhcmcxLCBhcmcyKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuY2FsbChzZWxmLCBhcmcxLCBhcmcyKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5jYWxsKHNlbGYsIGFyZzEsIGFyZzIpO1xuICB9XG59XG5mdW5jdGlvbiBlbWl0VGhyZWUoaGFuZGxlciwgaXNGbiwgc2VsZiwgYXJnMSwgYXJnMiwgYXJnMykge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmNhbGwoc2VsZiwgYXJnMSwgYXJnMiwgYXJnMyk7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uY2FsbChzZWxmLCBhcmcxLCBhcmcyLCBhcmczKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBlbWl0TWFueShoYW5kbGVyLCBpc0ZuLCBzZWxmLCBhcmdzKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuYXBwbHkoc2VsZiwgYXJncyk7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkoc2VsZiwgYXJncyk7XG4gIH1cbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdCh0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBldmVudHM7XG4gIHZhciBkb0Vycm9yID0gKHR5cGUgPT09ICdlcnJvcicpO1xuXG4gIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgaWYgKGV2ZW50cylcbiAgICBkb0Vycm9yID0gKGRvRXJyb3IgJiYgZXZlbnRzLmVycm9yID09IG51bGwpO1xuICBlbHNlIGlmICghZG9FcnJvcilcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAoZG9FcnJvcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSlcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQXQgbGVhc3QgZ2l2ZSBzb21lIGtpbmQgb2YgY29udGV4dCB0byB0aGUgdXNlclxuICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignVW5oYW5kbGVkIFwiZXJyb3JcIiBldmVudC4gKCcgKyBlciArICcpJyk7XG4gICAgICBlcnIuY29udGV4dCA9IGVyO1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBoYW5kbGVyID0gZXZlbnRzW3R5cGVdO1xuXG4gIGlmICghaGFuZGxlcilcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGlzRm4gPSB0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJztcbiAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgc3dpdGNoIChsZW4pIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICBjYXNlIDE6XG4gICAgICBlbWl0Tm9uZShoYW5kbGVyLCBpc0ZuLCB0aGlzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMjpcbiAgICAgIGVtaXRPbmUoaGFuZGxlciwgaXNGbiwgdGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMzpcbiAgICAgIGVtaXRUd28oaGFuZGxlciwgaXNGbiwgdGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSA0OlxuICAgICAgZW1pdFRocmVlKGhhbmRsZXIsIGlzRm4sIHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdLCBhcmd1bWVudHNbM10pO1xuICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICBkZWZhdWx0OlxuICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICBlbWl0TWFueShoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuZnVuY3Rpb24gX2FkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIHByZXBlbmQpIHtcbiAgdmFyIG07XG4gIHZhciBldmVudHM7XG4gIHZhciBleGlzdGluZztcblxuICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcbiAgaWYgKCFldmVudHMpIHtcbiAgICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICB0YXJnZXQuX2V2ZW50c0NvdW50ID0gMDtcbiAgfSBlbHNlIHtcbiAgICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAgIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgICBpZiAoZXZlbnRzLm5ld0xpc3RlbmVyKSB7XG4gICAgICB0YXJnZXQuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyID8gbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgICAgIC8vIFJlLWFzc2lnbiBgZXZlbnRzYCBiZWNhdXNlIGEgbmV3TGlzdGVuZXIgaGFuZGxlciBjb3VsZCBoYXZlIGNhdXNlZCB0aGVcbiAgICAgIC8vIHRoaXMuX2V2ZW50cyB0byBiZSBhc3NpZ25lZCB0byBhIG5ldyBvYmplY3RcbiAgICAgIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzO1xuICAgIH1cbiAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXTtcbiAgfVxuXG4gIGlmICghZXhpc3RpbmcpIHtcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICAgICsrdGFyZ2V0Ll9ldmVudHNDb3VudDtcbiAgfSBlbHNlIHtcbiAgICBpZiAodHlwZW9mIGV4aXN0aW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdID1cbiAgICAgICAgICBwcmVwZW5kID8gW2xpc3RlbmVyLCBleGlzdGluZ10gOiBbZXhpc3RpbmcsIGxpc3RlbmVyXTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgICAgaWYgKHByZXBlbmQpIHtcbiAgICAgICAgZXhpc3RpbmcudW5zaGlmdChsaXN0ZW5lcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBleGlzdGluZy5wdXNoKGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICAgIGlmICghZXhpc3Rpbmcud2FybmVkKSB7XG4gICAgICBtID0gJGdldE1heExpc3RlbmVycyh0YXJnZXQpO1xuICAgICAgaWYgKG0gJiYgbSA+IDAgJiYgZXhpc3RpbmcubGVuZ3RoID4gbSkge1xuICAgICAgICBleGlzdGluZy53YXJuZWQgPSB0cnVlO1xuICAgICAgICB2YXIgdyA9IG5ldyBFcnJvcignUG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSBsZWFrIGRldGVjdGVkLiAnICtcbiAgICAgICAgICAgIGV4aXN0aW5nLmxlbmd0aCArICcgXCInICsgU3RyaW5nKHR5cGUpICsgJ1wiIGxpc3RlbmVycyAnICtcbiAgICAgICAgICAgICdhZGRlZC4gVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gJyArXG4gICAgICAgICAgICAnaW5jcmVhc2UgbGltaXQuJyk7XG4gICAgICAgIHcubmFtZSA9ICdNYXhMaXN0ZW5lcnNFeGNlZWRlZFdhcm5pbmcnO1xuICAgICAgICB3LmVtaXR0ZXIgPSB0YXJnZXQ7XG4gICAgICAgIHcudHlwZSA9IHR5cGU7XG4gICAgICAgIHcuY291bnQgPSBleGlzdGluZy5sZW5ndGg7XG4gICAgICAgIGlmICh0eXBlb2YgY29uc29sZSA9PT0gJ29iamVjdCcgJiYgY29uc29sZS53YXJuKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKCclczogJXMnLCB3Lm5hbWUsIHcubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0O1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24gYWRkTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgcmV0dXJuIF9hZGRMaXN0ZW5lcih0aGlzLCB0eXBlLCBsaXN0ZW5lciwgZmFsc2UpO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucHJlcGVuZExpc3RlbmVyID1cbiAgICBmdW5jdGlvbiBwcmVwZW5kTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIHJldHVybiBfYWRkTGlzdGVuZXIodGhpcywgdHlwZSwgbGlzdGVuZXIsIHRydWUpO1xuICAgIH07XG5cbmZ1bmN0aW9uIG9uY2VXcmFwcGVyKCkge1xuICBpZiAoIXRoaXMuZmlyZWQpIHtcbiAgICB0aGlzLnRhcmdldC5yZW1vdmVMaXN0ZW5lcih0aGlzLnR5cGUsIHRoaXMud3JhcEZuKTtcbiAgICB0aGlzLmZpcmVkID0gdHJ1ZTtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuY2FsbCh0aGlzLnRhcmdldCk7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQsIGFyZ3VtZW50c1swXSk7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQsIGFyZ3VtZW50c1swXSwgYXJndW1lbnRzWzFdKTtcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuY2FsbCh0aGlzLnRhcmdldCwgYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0sXG4gICAgICAgICAgICBhcmd1bWVudHNbMl0pO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7ICsraSlcbiAgICAgICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB0aGlzLmxpc3RlbmVyLmFwcGx5KHRoaXMudGFyZ2V0LCBhcmdzKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gX29uY2VXcmFwKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIHN0YXRlID0geyBmaXJlZDogZmFsc2UsIHdyYXBGbjogdW5kZWZpbmVkLCB0YXJnZXQ6IHRhcmdldCwgdHlwZTogdHlwZSwgbGlzdGVuZXI6IGxpc3RlbmVyIH07XG4gIHZhciB3cmFwcGVkID0gYmluZC5jYWxsKG9uY2VXcmFwcGVyLCBzdGF0ZSk7XG4gIHdyYXBwZWQubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgc3RhdGUud3JhcEZuID0gd3JhcHBlZDtcbiAgcmV0dXJuIHdyYXBwZWQ7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UodHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJylcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gIHRoaXMub24odHlwZSwgX29uY2VXcmFwKHRoaXMsIHR5cGUsIGxpc3RlbmVyKSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5wcmVwZW5kT25jZUxpc3RlbmVyID1cbiAgICBmdW5jdGlvbiBwcmVwZW5kT25jZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgICB0aGlzLnByZXBlbmRMaXN0ZW5lcih0eXBlLCBfb25jZVdyYXAodGhpcywgdHlwZSwgbGlzdGVuZXIpKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbi8vIEVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZiBhbmQgb25seSBpZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID1cbiAgICBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgdmFyIGxpc3QsIGV2ZW50cywgcG9zaXRpb24sIGksIG9yaWdpbmFsTGlzdGVuZXI7XG5cbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICAgICAgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICAgICAgaWYgKCFldmVudHMpXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICBsaXN0ID0gZXZlbnRzW3R5cGVdO1xuICAgICAgaWYgKCFsaXN0KVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8IGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB7XG4gICAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKVxuICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIGV2ZW50c1t0eXBlXTtcbiAgICAgICAgICBpZiAoZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3QubGlzdGVuZXIgfHwgbGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBsaXN0ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHBvc2l0aW9uID0gLTE7XG5cbiAgICAgICAgZm9yIChpID0gbGlzdC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fCBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikge1xuICAgICAgICAgICAgb3JpZ2luYWxMaXN0ZW5lciA9IGxpc3RbaV0ubGlzdGVuZXI7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICAgIGlmIChwb3NpdGlvbiA9PT0gMClcbiAgICAgICAgICBsaXN0LnNoaWZ0KCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzcGxpY2VPbmUobGlzdCwgcG9zaXRpb24pO1xuXG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSlcbiAgICAgICAgICBldmVudHNbdHlwZV0gPSBsaXN0WzBdO1xuXG4gICAgICAgIGlmIChldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIG9yaWdpbmFsTGlzdGVuZXIgfHwgbGlzdGVuZXIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9XG4gICAgZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKHR5cGUpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnMsIGV2ZW50cywgaTtcblxuICAgICAgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICAgICAgaWYgKCFldmVudHMpXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gICAgICBpZiAoIWV2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICAgICAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnRzW3R5cGVdKSB7XG4gICAgICAgICAgaWYgKC0tdGhpcy5fZXZlbnRzQ291bnQgPT09IDApXG4gICAgICAgICAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgZGVsZXRlIGV2ZW50c1t0eXBlXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB2YXIga2V5cyA9IG9iamVjdEtleXMoZXZlbnRzKTtcbiAgICAgICAgdmFyIGtleTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGtleXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICBrZXkgPSBrZXlzW2ldO1xuICAgICAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgICAgIHRoaXMuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICAgICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgbGlzdGVuZXJzID0gZXZlbnRzW3R5cGVdO1xuXG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVycyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gICAgICB9IGVsc2UgaWYgKGxpc3RlbmVycykge1xuICAgICAgICAvLyBMSUZPIG9yZGVyXG4gICAgICAgIGZvciAoaSA9IGxpc3RlbmVycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG5mdW5jdGlvbiBfbGlzdGVuZXJzKHRhcmdldCwgdHlwZSwgdW53cmFwKSB7XG4gIHZhciBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcblxuICBpZiAoIWV2ZW50cylcbiAgICByZXR1cm4gW107XG5cbiAgdmFyIGV2bGlzdGVuZXIgPSBldmVudHNbdHlwZV07XG4gIGlmICghZXZsaXN0ZW5lcilcbiAgICByZXR1cm4gW107XG5cbiAgaWYgKHR5cGVvZiBldmxpc3RlbmVyID09PSAnZnVuY3Rpb24nKVxuICAgIHJldHVybiB1bndyYXAgPyBbZXZsaXN0ZW5lci5saXN0ZW5lciB8fCBldmxpc3RlbmVyXSA6IFtldmxpc3RlbmVyXTtcblxuICByZXR1cm4gdW53cmFwID8gdW53cmFwTGlzdGVuZXJzKGV2bGlzdGVuZXIpIDogYXJyYXlDbG9uZShldmxpc3RlbmVyLCBldmxpc3RlbmVyLmxlbmd0aCk7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKHR5cGUpIHtcbiAgcmV0dXJuIF9saXN0ZW5lcnModGhpcywgdHlwZSwgdHJ1ZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJhd0xpc3RlbmVycyA9IGZ1bmN0aW9uIHJhd0xpc3RlbmVycyh0eXBlKSB7XG4gIHJldHVybiBfbGlzdGVuZXJzKHRoaXMsIHR5cGUsIGZhbHNlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICBpZiAodHlwZW9mIGVtaXR0ZXIubGlzdGVuZXJDb3VudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBlbWl0dGVyLmxpc3RlbmVyQ291bnQodHlwZSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGxpc3RlbmVyQ291bnQuY2FsbChlbWl0dGVyLCB0eXBlKTtcbiAgfVxufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lckNvdW50ID0gbGlzdGVuZXJDb3VudDtcbmZ1bmN0aW9uIGxpc3RlbmVyQ291bnQodHlwZSkge1xuICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuXG4gIGlmIChldmVudHMpIHtcbiAgICB2YXIgZXZsaXN0ZW5lciA9IGV2ZW50c1t0eXBlXTtcblxuICAgIGlmICh0eXBlb2YgZXZsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfSBlbHNlIGlmIChldmxpc3RlbmVyKSB7XG4gICAgICByZXR1cm4gZXZsaXN0ZW5lci5sZW5ndGg7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIDA7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZXZlbnROYW1lcyA9IGZ1bmN0aW9uIGV2ZW50TmFtZXMoKSB7XG4gIHJldHVybiB0aGlzLl9ldmVudHNDb3VudCA+IDAgPyBSZWZsZWN0Lm93bktleXModGhpcy5fZXZlbnRzKSA6IFtdO1xufTtcblxuLy8gQWJvdXQgMS41eCBmYXN0ZXIgdGhhbiB0aGUgdHdvLWFyZyB2ZXJzaW9uIG9mIEFycmF5I3NwbGljZSgpLlxuZnVuY3Rpb24gc3BsaWNlT25lKGxpc3QsIGluZGV4KSB7XG4gIGZvciAodmFyIGkgPSBpbmRleCwgayA9IGkgKyAxLCBuID0gbGlzdC5sZW5ndGg7IGsgPCBuOyBpICs9IDEsIGsgKz0gMSlcbiAgICBsaXN0W2ldID0gbGlzdFtrXTtcbiAgbGlzdC5wb3AoKTtcbn1cblxuZnVuY3Rpb24gYXJyYXlDbG9uZShhcnIsIG4pIHtcbiAgdmFyIGNvcHkgPSBuZXcgQXJyYXkobik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgKytpKVxuICAgIGNvcHlbaV0gPSBhcnJbaV07XG4gIHJldHVybiBjb3B5O1xufVxuXG5mdW5jdGlvbiB1bndyYXBMaXN0ZW5lcnMoYXJyKSB7XG4gIHZhciByZXQgPSBuZXcgQXJyYXkoYXJyLmxlbmd0aCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcmV0Lmxlbmd0aDsgKytpKSB7XG4gICAgcmV0W2ldID0gYXJyW2ldLmxpc3RlbmVyIHx8IGFycltpXTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBvYmplY3RDcmVhdGVQb2x5ZmlsbChwcm90bykge1xuICB2YXIgRiA9IGZ1bmN0aW9uKCkge307XG4gIEYucHJvdG90eXBlID0gcHJvdG87XG4gIHJldHVybiBuZXcgRjtcbn1cbmZ1bmN0aW9uIG9iamVjdEtleXNQb2x5ZmlsbChvYmopIHtcbiAgdmFyIGtleXMgPSBbXTtcbiAgZm9yICh2YXIgayBpbiBvYmopIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrKSkge1xuICAgIGtleXMucHVzaChrKTtcbiAgfVxuICByZXR1cm4gaztcbn1cbmZ1bmN0aW9uIGZ1bmN0aW9uQmluZFBvbHlmaWxsKGNvbnRleHQpIHtcbiAgdmFyIGZuID0gdGhpcztcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZm4uYXBwbHkoY29udGV4dCwgYXJndW1lbnRzKTtcbiAgfTtcbn1cbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxudmFyIHJ1bnRpbWUgPSAoZnVuY3Rpb24gKGV4cG9ydHMpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIE9wID0gT2JqZWN0LnByb3RvdHlwZTtcbiAgdmFyIGhhc093biA9IE9wLmhhc093blByb3BlcnR5O1xuICB2YXIgdW5kZWZpbmVkOyAvLyBNb3JlIGNvbXByZXNzaWJsZSB0aGFuIHZvaWQgMC5cbiAgdmFyICRTeW1ib2wgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2wgOiB7fTtcbiAgdmFyIGl0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5pdGVyYXRvciB8fCBcIkBAaXRlcmF0b3JcIjtcbiAgdmFyIGFzeW5jSXRlcmF0b3JTeW1ib2wgPSAkU3ltYm9sLmFzeW5jSXRlcmF0b3IgfHwgXCJAQGFzeW5jSXRlcmF0b3JcIjtcbiAgdmFyIHRvU3RyaW5nVGFnU3ltYm9sID0gJFN5bWJvbC50b1N0cmluZ1RhZyB8fCBcIkBAdG9TdHJpbmdUYWdcIjtcblxuICBmdW5jdGlvbiB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gSWYgb3V0ZXJGbiBwcm92aWRlZCBhbmQgb3V0ZXJGbi5wcm90b3R5cGUgaXMgYSBHZW5lcmF0b3IsIHRoZW4gb3V0ZXJGbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBHZW5lcmF0b3IuXG4gICAgdmFyIHByb3RvR2VuZXJhdG9yID0gb3V0ZXJGbiAmJiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvciA/IG91dGVyRm4gOiBHZW5lcmF0b3I7XG4gICAgdmFyIGdlbmVyYXRvciA9IE9iamVjdC5jcmVhdGUocHJvdG9HZW5lcmF0b3IucHJvdG90eXBlKTtcbiAgICB2YXIgY29udGV4dCA9IG5ldyBDb250ZXh0KHRyeUxvY3NMaXN0IHx8IFtdKTtcblxuICAgIC8vIFRoZSAuX2ludm9rZSBtZXRob2QgdW5pZmllcyB0aGUgaW1wbGVtZW50YXRpb25zIG9mIHRoZSAubmV4dCxcbiAgICAvLyAudGhyb3csIGFuZCAucmV0dXJuIG1ldGhvZHMuXG4gICAgZ2VuZXJhdG9yLl9pbnZva2UgPSBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuXG4gICAgcmV0dXJuIGdlbmVyYXRvcjtcbiAgfVxuICBleHBvcnRzLndyYXAgPSB3cmFwO1xuXG4gIC8vIFRyeS9jYXRjaCBoZWxwZXIgdG8gbWluaW1pemUgZGVvcHRpbWl6YXRpb25zLiBSZXR1cm5zIGEgY29tcGxldGlvblxuICAvLyByZWNvcmQgbGlrZSBjb250ZXh0LnRyeUVudHJpZXNbaV0uY29tcGxldGlvbi4gVGhpcyBpbnRlcmZhY2UgY291bGRcbiAgLy8gaGF2ZSBiZWVuIChhbmQgd2FzIHByZXZpb3VzbHkpIGRlc2lnbmVkIHRvIHRha2UgYSBjbG9zdXJlIHRvIGJlXG4gIC8vIGludm9rZWQgd2l0aG91dCBhcmd1bWVudHMsIGJ1dCBpbiBhbGwgdGhlIGNhc2VzIHdlIGNhcmUgYWJvdXQgd2VcbiAgLy8gYWxyZWFkeSBoYXZlIGFuIGV4aXN0aW5nIG1ldGhvZCB3ZSB3YW50IHRvIGNhbGwsIHNvIHRoZXJlJ3Mgbm8gbmVlZFxuICAvLyB0byBjcmVhdGUgYSBuZXcgZnVuY3Rpb24gb2JqZWN0LiBXZSBjYW4gZXZlbiBnZXQgYXdheSB3aXRoIGFzc3VtaW5nXG4gIC8vIHRoZSBtZXRob2QgdGFrZXMgZXhhY3RseSBvbmUgYXJndW1lbnQsIHNpbmNlIHRoYXQgaGFwcGVucyB0byBiZSB0cnVlXG4gIC8vIGluIGV2ZXJ5IGNhc2UsIHNvIHdlIGRvbid0IGhhdmUgdG8gdG91Y2ggdGhlIGFyZ3VtZW50cyBvYmplY3QuIFRoZVxuICAvLyBvbmx5IGFkZGl0aW9uYWwgYWxsb2NhdGlvbiByZXF1aXJlZCBpcyB0aGUgY29tcGxldGlvbiByZWNvcmQsIHdoaWNoXG4gIC8vIGhhcyBhIHN0YWJsZSBzaGFwZSBhbmQgc28gaG9wZWZ1bGx5IHNob3VsZCBiZSBjaGVhcCB0byBhbGxvY2F0ZS5cbiAgZnVuY3Rpb24gdHJ5Q2F0Y2goZm4sIG9iaiwgYXJnKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwibm9ybWFsXCIsIGFyZzogZm4uY2FsbChvYmosIGFyZykgfTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwidGhyb3dcIiwgYXJnOiBlcnIgfTtcbiAgICB9XG4gIH1cblxuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRTdGFydCA9IFwic3VzcGVuZGVkU3RhcnRcIjtcbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkWWllbGQgPSBcInN1c3BlbmRlZFlpZWxkXCI7XG4gIHZhciBHZW5TdGF0ZUV4ZWN1dGluZyA9IFwiZXhlY3V0aW5nXCI7XG4gIHZhciBHZW5TdGF0ZUNvbXBsZXRlZCA9IFwiY29tcGxldGVkXCI7XG5cbiAgLy8gUmV0dXJuaW5nIHRoaXMgb2JqZWN0IGZyb20gdGhlIGlubmVyRm4gaGFzIHRoZSBzYW1lIGVmZmVjdCBhc1xuICAvLyBicmVha2luZyBvdXQgb2YgdGhlIGRpc3BhdGNoIHN3aXRjaCBzdGF0ZW1lbnQuXG4gIHZhciBDb250aW51ZVNlbnRpbmVsID0ge307XG5cbiAgLy8gRHVtbXkgY29uc3RydWN0b3IgZnVuY3Rpb25zIHRoYXQgd2UgdXNlIGFzIHRoZSAuY29uc3RydWN0b3IgYW5kXG4gIC8vIC5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgcHJvcGVydGllcyBmb3IgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIEdlbmVyYXRvclxuICAvLyBvYmplY3RzLiBGb3IgZnVsbCBzcGVjIGNvbXBsaWFuY2UsIHlvdSBtYXkgd2lzaCB0byBjb25maWd1cmUgeW91clxuICAvLyBtaW5pZmllciBub3QgdG8gbWFuZ2xlIHRoZSBuYW1lcyBvZiB0aGVzZSB0d28gZnVuY3Rpb25zLlxuICBmdW5jdGlvbiBHZW5lcmF0b3IoKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvbigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlKCkge31cblxuICAvLyBUaGlzIGlzIGEgcG9seWZpbGwgZm9yICVJdGVyYXRvclByb3RvdHlwZSUgZm9yIGVudmlyb25tZW50cyB0aGF0XG4gIC8vIGRvbid0IG5hdGl2ZWx5IHN1cHBvcnQgaXQuXG4gIHZhciBJdGVyYXRvclByb3RvdHlwZSA9IHt9O1xuICBJdGVyYXRvclByb3RvdHlwZVtpdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdmFyIGdldFByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mO1xuICB2YXIgTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgPSBnZXRQcm90byAmJiBnZXRQcm90byhnZXRQcm90byh2YWx1ZXMoW10pKSk7XG4gIGlmIChOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAmJlxuICAgICAgTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgIT09IE9wICYmXG4gICAgICBoYXNPd24uY2FsbChOYXRpdmVJdGVyYXRvclByb3RvdHlwZSwgaXRlcmF0b3JTeW1ib2wpKSB7XG4gICAgLy8gVGhpcyBlbnZpcm9ubWVudCBoYXMgYSBuYXRpdmUgJUl0ZXJhdG9yUHJvdG90eXBlJTsgdXNlIGl0IGluc3RlYWRcbiAgICAvLyBvZiB0aGUgcG9seWZpbGwuXG4gICAgSXRlcmF0b3JQcm90b3R5cGUgPSBOYXRpdmVJdGVyYXRvclByb3RvdHlwZTtcbiAgfVxuXG4gIHZhciBHcCA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSA9XG4gICAgR2VuZXJhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSXRlcmF0b3JQcm90b3R5cGUpO1xuICBHZW5lcmF0b3JGdW5jdGlvbi5wcm90b3R5cGUgPSBHcC5jb25zdHJ1Y3RvciA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEdlbmVyYXRvckZ1bmN0aW9uO1xuICBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZVt0b1N0cmluZ1RhZ1N5bWJvbF0gPVxuICAgIEdlbmVyYXRvckZ1bmN0aW9uLmRpc3BsYXlOYW1lID0gXCJHZW5lcmF0b3JGdW5jdGlvblwiO1xuXG4gIC8vIEhlbHBlciBmb3IgZGVmaW5pbmcgdGhlIC5uZXh0LCAudGhyb3csIGFuZCAucmV0dXJuIG1ldGhvZHMgb2YgdGhlXG4gIC8vIEl0ZXJhdG9yIGludGVyZmFjZSBpbiB0ZXJtcyBvZiBhIHNpbmdsZSAuX2ludm9rZSBtZXRob2QuXG4gIGZ1bmN0aW9uIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhwcm90b3R5cGUpIHtcbiAgICBbXCJuZXh0XCIsIFwidGhyb3dcIiwgXCJyZXR1cm5cIl0uZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgIHByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbnZva2UobWV0aG9kLCBhcmcpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGV4cG9ydHMuaXNHZW5lcmF0b3JGdW5jdGlvbiA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIHZhciBjdG9yID0gdHlwZW9mIGdlbkZ1biA9PT0gXCJmdW5jdGlvblwiICYmIGdlbkZ1bi5jb25zdHJ1Y3RvcjtcbiAgICByZXR1cm4gY3RvclxuICAgICAgPyBjdG9yID09PSBHZW5lcmF0b3JGdW5jdGlvbiB8fFxuICAgICAgICAvLyBGb3IgdGhlIG5hdGl2ZSBHZW5lcmF0b3JGdW5jdGlvbiBjb25zdHJ1Y3RvciwgdGhlIGJlc3Qgd2UgY2FuXG4gICAgICAgIC8vIGRvIGlzIHRvIGNoZWNrIGl0cyAubmFtZSBwcm9wZXJ0eS5cbiAgICAgICAgKGN0b3IuZGlzcGxheU5hbWUgfHwgY3Rvci5uYW1lKSA9PT0gXCJHZW5lcmF0b3JGdW5jdGlvblwiXG4gICAgICA6IGZhbHNlO1xuICB9O1xuXG4gIGV4cG9ydHMubWFyayA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIGlmIChPYmplY3Quc2V0UHJvdG90eXBlT2YpIHtcbiAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihnZW5GdW4sIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ2VuRnVuLl9fcHJvdG9fXyA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICAgICAgaWYgKCEodG9TdHJpbmdUYWdTeW1ib2wgaW4gZ2VuRnVuKSkge1xuICAgICAgICBnZW5GdW5bdG9TdHJpbmdUYWdTeW1ib2xdID0gXCJHZW5lcmF0b3JGdW5jdGlvblwiO1xuICAgICAgfVxuICAgIH1cbiAgICBnZW5GdW4ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShHcCk7XG4gICAgcmV0dXJuIGdlbkZ1bjtcbiAgfTtcblxuICAvLyBXaXRoaW4gdGhlIGJvZHkgb2YgYW55IGFzeW5jIGZ1bmN0aW9uLCBgYXdhaXQgeGAgaXMgdHJhbnNmb3JtZWQgdG9cbiAgLy8gYHlpZWxkIHJlZ2VuZXJhdG9yUnVudGltZS5hd3JhcCh4KWAsIHNvIHRoYXQgdGhlIHJ1bnRpbWUgY2FuIHRlc3RcbiAgLy8gYGhhc093bi5jYWxsKHZhbHVlLCBcIl9fYXdhaXRcIilgIHRvIGRldGVybWluZSBpZiB0aGUgeWllbGRlZCB2YWx1ZSBpc1xuICAvLyBtZWFudCB0byBiZSBhd2FpdGVkLlxuICBleHBvcnRzLmF3cmFwID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIHsgX19hd2FpdDogYXJnIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gQXN5bmNJdGVyYXRvcihnZW5lcmF0b3IsIFByb21pc2VJbXBsKSB7XG4gICAgZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnLCByZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChnZW5lcmF0b3JbbWV0aG9kXSwgZ2VuZXJhdG9yLCBhcmcpO1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgcmVqZWN0KHJlY29yZC5hcmcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHJlY29yZC5hcmc7XG4gICAgICAgIHZhciB2YWx1ZSA9IHJlc3VsdC52YWx1ZTtcbiAgICAgICAgaWYgKHZhbHVlICYmXG4gICAgICAgICAgICB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKHZhbHVlLCBcIl9fYXdhaXRcIikpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZUltcGwucmVzb2x2ZSh2YWx1ZS5fX2F3YWl0KS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJuZXh0XCIsIHZhbHVlLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgaW52b2tlKFwidGhyb3dcIiwgZXJyLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2VJbXBsLnJlc29sdmUodmFsdWUpLnRoZW4oZnVuY3Rpb24odW53cmFwcGVkKSB7XG4gICAgICAgICAgLy8gV2hlbiBhIHlpZWxkZWQgUHJvbWlzZSBpcyByZXNvbHZlZCwgaXRzIGZpbmFsIHZhbHVlIGJlY29tZXNcbiAgICAgICAgICAvLyB0aGUgLnZhbHVlIG9mIHRoZSBQcm9taXNlPHt2YWx1ZSxkb25lfT4gcmVzdWx0IGZvciB0aGVcbiAgICAgICAgICAvLyBjdXJyZW50IGl0ZXJhdGlvbi5cbiAgICAgICAgICByZXN1bHQudmFsdWUgPSB1bndyYXBwZWQ7XG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIC8vIElmIGEgcmVqZWN0ZWQgUHJvbWlzZSB3YXMgeWllbGRlZCwgdGhyb3cgdGhlIHJlamVjdGlvbiBiYWNrXG4gICAgICAgICAgLy8gaW50byB0aGUgYXN5bmMgZ2VuZXJhdG9yIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBoYW5kbGVkIHRoZXJlLlxuICAgICAgICAgIHJldHVybiBpbnZva2UoXCJ0aHJvd1wiLCBlcnJvciwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHByZXZpb3VzUHJvbWlzZTtcblxuICAgIGZ1bmN0aW9uIGVucXVldWUobWV0aG9kLCBhcmcpIHtcbiAgICAgIGZ1bmN0aW9uIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2VJbXBsKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwcmV2aW91c1Byb21pc2UgPVxuICAgICAgICAvLyBJZiBlbnF1ZXVlIGhhcyBiZWVuIGNhbGxlZCBiZWZvcmUsIHRoZW4gd2Ugd2FudCB0byB3YWl0IHVudGlsXG4gICAgICAgIC8vIGFsbCBwcmV2aW91cyBQcm9taXNlcyBoYXZlIGJlZW4gcmVzb2x2ZWQgYmVmb3JlIGNhbGxpbmcgaW52b2tlLFxuICAgICAgICAvLyBzbyB0aGF0IHJlc3VsdHMgYXJlIGFsd2F5cyBkZWxpdmVyZWQgaW4gdGhlIGNvcnJlY3Qgb3JkZXIuIElmXG4gICAgICAgIC8vIGVucXVldWUgaGFzIG5vdCBiZWVuIGNhbGxlZCBiZWZvcmUsIHRoZW4gaXQgaXMgaW1wb3J0YW50IHRvXG4gICAgICAgIC8vIGNhbGwgaW52b2tlIGltbWVkaWF0ZWx5LCB3aXRob3V0IHdhaXRpbmcgb24gYSBjYWxsYmFjayB0byBmaXJlLFxuICAgICAgICAvLyBzbyB0aGF0IHRoZSBhc3luYyBnZW5lcmF0b3IgZnVuY3Rpb24gaGFzIHRoZSBvcHBvcnR1bml0eSB0byBkb1xuICAgICAgICAvLyBhbnkgbmVjZXNzYXJ5IHNldHVwIGluIGEgcHJlZGljdGFibGUgd2F5LiBUaGlzIHByZWRpY3RhYmlsaXR5XG4gICAgICAgIC8vIGlzIHdoeSB0aGUgUHJvbWlzZSBjb25zdHJ1Y3RvciBzeW5jaHJvbm91c2x5IGludm9rZXMgaXRzXG4gICAgICAgIC8vIGV4ZWN1dG9yIGNhbGxiYWNrLCBhbmQgd2h5IGFzeW5jIGZ1bmN0aW9ucyBzeW5jaHJvbm91c2x5XG4gICAgICAgIC8vIGV4ZWN1dGUgY29kZSBiZWZvcmUgdGhlIGZpcnN0IGF3YWl0LiBTaW5jZSB3ZSBpbXBsZW1lbnQgc2ltcGxlXG4gICAgICAgIC8vIGFzeW5jIGZ1bmN0aW9ucyBpbiB0ZXJtcyBvZiBhc3luYyBnZW5lcmF0b3JzLCBpdCBpcyBlc3BlY2lhbGx5XG4gICAgICAgIC8vIGltcG9ydGFudCB0byBnZXQgdGhpcyByaWdodCwgZXZlbiB0aG91Z2ggaXQgcmVxdWlyZXMgY2FyZS5cbiAgICAgICAgcHJldmlvdXNQcm9taXNlID8gcHJldmlvdXNQcm9taXNlLnRoZW4oXG4gICAgICAgICAgY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcsXG4gICAgICAgICAgLy8gQXZvaWQgcHJvcGFnYXRpbmcgZmFpbHVyZXMgdG8gUHJvbWlzZXMgcmV0dXJuZWQgYnkgbGF0ZXJcbiAgICAgICAgICAvLyBpbnZvY2F0aW9ucyBvZiB0aGUgaXRlcmF0b3IuXG4gICAgICAgICAgY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmdcbiAgICAgICAgKSA6IGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCk7XG4gICAgfVxuXG4gICAgLy8gRGVmaW5lIHRoZSB1bmlmaWVkIGhlbHBlciBtZXRob2QgdGhhdCBpcyB1c2VkIHRvIGltcGxlbWVudCAubmV4dCxcbiAgICAvLyAudGhyb3csIGFuZCAucmV0dXJuIChzZWUgZGVmaW5lSXRlcmF0b3JNZXRob2RzKS5cbiAgICB0aGlzLl9pbnZva2UgPSBlbnF1ZXVlO1xuICB9XG5cbiAgZGVmaW5lSXRlcmF0b3JNZXRob2RzKEFzeW5jSXRlcmF0b3IucHJvdG90eXBlKTtcbiAgQXN5bmNJdGVyYXRvci5wcm90b3R5cGVbYXN5bmNJdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIGV4cG9ydHMuQXN5bmNJdGVyYXRvciA9IEFzeW5jSXRlcmF0b3I7XG5cbiAgLy8gTm90ZSB0aGF0IHNpbXBsZSBhc3luYyBmdW5jdGlvbnMgYXJlIGltcGxlbWVudGVkIG9uIHRvcCBvZlxuICAvLyBBc3luY0l0ZXJhdG9yIG9iamVjdHM7IHRoZXkganVzdCByZXR1cm4gYSBQcm9taXNlIGZvciB0aGUgdmFsdWUgb2ZcbiAgLy8gdGhlIGZpbmFsIHJlc3VsdCBwcm9kdWNlZCBieSB0aGUgaXRlcmF0b3IuXG4gIGV4cG9ydHMuYXN5bmMgPSBmdW5jdGlvbihpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCwgUHJvbWlzZUltcGwpIHtcbiAgICBpZiAoUHJvbWlzZUltcGwgPT09IHZvaWQgMCkgUHJvbWlzZUltcGwgPSBQcm9taXNlO1xuXG4gICAgdmFyIGl0ZXIgPSBuZXcgQXN5bmNJdGVyYXRvcihcbiAgICAgIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpLFxuICAgICAgUHJvbWlzZUltcGxcbiAgICApO1xuXG4gICAgcmV0dXJuIGV4cG9ydHMuaXNHZW5lcmF0b3JGdW5jdGlvbihvdXRlckZuKVxuICAgICAgPyBpdGVyIC8vIElmIG91dGVyRm4gaXMgYSBnZW5lcmF0b3IsIHJldHVybiB0aGUgZnVsbCBpdGVyYXRvci5cbiAgICAgIDogaXRlci5uZXh0KCkudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LmRvbmUgPyByZXN1bHQudmFsdWUgOiBpdGVyLm5leHQoKTtcbiAgICAgICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gbWFrZUludm9rZU1ldGhvZChpbm5lckZuLCBzZWxmLCBjb250ZXh0KSB7XG4gICAgdmFyIHN0YXRlID0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydDtcblxuICAgIHJldHVybiBmdW5jdGlvbiBpbnZva2UobWV0aG9kLCBhcmcpIHtcbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVFeGVjdXRpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgcnVubmluZ1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUNvbXBsZXRlZCkge1xuICAgICAgICBpZiAobWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICB0aHJvdyBhcmc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCZSBmb3JnaXZpbmcsIHBlciAyNS4zLjMuMy4zIG9mIHRoZSBzcGVjOlxuICAgICAgICAvLyBodHRwczovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtZ2VuZXJhdG9ycmVzdW1lXG4gICAgICAgIHJldHVybiBkb25lUmVzdWx0KCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnRleHQubWV0aG9kID0gbWV0aG9kO1xuICAgICAgY29udGV4dC5hcmcgPSBhcmc7XG5cbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHZhciBkZWxlZ2F0ZSA9IGNvbnRleHQuZGVsZWdhdGU7XG4gICAgICAgIGlmIChkZWxlZ2F0ZSkge1xuICAgICAgICAgIHZhciBkZWxlZ2F0ZVJlc3VsdCA9IG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpO1xuICAgICAgICAgIGlmIChkZWxlZ2F0ZVJlc3VsdCkge1xuICAgICAgICAgICAgaWYgKGRlbGVnYXRlUmVzdWx0ID09PSBDb250aW51ZVNlbnRpbmVsKSBjb250aW51ZTtcbiAgICAgICAgICAgIHJldHVybiBkZWxlZ2F0ZVJlc3VsdDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgICAgLy8gU2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAgICAgLy8gZnVuY3Rpb24uc2VudCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgICAgICBjb250ZXh0LnNlbnQgPSBjb250ZXh0Ll9zZW50ID0gY29udGV4dC5hcmc7XG5cbiAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0KSB7XG4gICAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgICAgdGhyb3cgY29udGV4dC5hcmc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihjb250ZXh0LmFyZyk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICAgIGNvbnRleHQuYWJydXB0KFwicmV0dXJuXCIsIGNvbnRleHQuYXJnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlID0gR2VuU3RhdGVFeGVjdXRpbmc7XG5cbiAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIpIHtcbiAgICAgICAgICAvLyBJZiBhbiBleGNlcHRpb24gaXMgdGhyb3duIGZyb20gaW5uZXJGbiwgd2UgbGVhdmUgc3RhdGUgPT09XG4gICAgICAgICAgLy8gR2VuU3RhdGVFeGVjdXRpbmcgYW5kIGxvb3AgYmFjayBmb3IgYW5vdGhlciBpbnZvY2F0aW9uLlxuICAgICAgICAgIHN0YXRlID0gY29udGV4dC5kb25lXG4gICAgICAgICAgICA/IEdlblN0YXRlQ29tcGxldGVkXG4gICAgICAgICAgICA6IEdlblN0YXRlU3VzcGVuZGVkWWllbGQ7XG5cbiAgICAgICAgICBpZiAocmVjb3JkLmFyZyA9PT0gQ29udGludWVTZW50aW5lbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiByZWNvcmQuYXJnLFxuICAgICAgICAgICAgZG9uZTogY29udGV4dC5kb25lXG4gICAgICAgICAgfTtcblxuICAgICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgIC8vIERpc3BhdGNoIHRoZSBleGNlcHRpb24gYnkgbG9vcGluZyBiYWNrIGFyb3VuZCB0byB0aGVcbiAgICAgICAgICAvLyBjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGNvbnRleHQuYXJnKSBjYWxsIGFib3ZlLlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBDYWxsIGRlbGVnYXRlLml0ZXJhdG9yW2NvbnRleHQubWV0aG9kXShjb250ZXh0LmFyZykgYW5kIGhhbmRsZSB0aGVcbiAgLy8gcmVzdWx0LCBlaXRoZXIgYnkgcmV0dXJuaW5nIGEgeyB2YWx1ZSwgZG9uZSB9IHJlc3VsdCBmcm9tIHRoZVxuICAvLyBkZWxlZ2F0ZSBpdGVyYXRvciwgb3IgYnkgbW9kaWZ5aW5nIGNvbnRleHQubWV0aG9kIGFuZCBjb250ZXh0LmFyZyxcbiAgLy8gc2V0dGluZyBjb250ZXh0LmRlbGVnYXRlIHRvIG51bGwsIGFuZCByZXR1cm5pbmcgdGhlIENvbnRpbnVlU2VudGluZWwuXG4gIGZ1bmN0aW9uIG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpIHtcbiAgICB2YXIgbWV0aG9kID0gZGVsZWdhdGUuaXRlcmF0b3JbY29udGV4dC5tZXRob2RdO1xuICAgIGlmIChtZXRob2QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gQSAudGhyb3cgb3IgLnJldHVybiB3aGVuIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgbm8gLnRocm93XG4gICAgICAvLyBtZXRob2QgYWx3YXlzIHRlcm1pbmF0ZXMgdGhlIHlpZWxkKiBsb29wLlxuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIC8vIE5vdGU6IFtcInJldHVyblwiXSBtdXN0IGJlIHVzZWQgZm9yIEVTMyBwYXJzaW5nIGNvbXBhdGliaWxpdHkuXG4gICAgICAgIGlmIChkZWxlZ2F0ZS5pdGVyYXRvcltcInJldHVyblwiXSkge1xuICAgICAgICAgIC8vIElmIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgYSByZXR1cm4gbWV0aG9kLCBnaXZlIGl0IGFcbiAgICAgICAgICAvLyBjaGFuY2UgdG8gY2xlYW4gdXAuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpO1xuXG4gICAgICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIC8vIElmIG1heWJlSW52b2tlRGVsZWdhdGUoY29udGV4dCkgY2hhbmdlZCBjb250ZXh0Lm1ldGhvZCBmcm9tXG4gICAgICAgICAgICAvLyBcInJldHVyblwiIHRvIFwidGhyb3dcIiwgbGV0IHRoYXQgb3ZlcnJpZGUgdGhlIFR5cGVFcnJvciBiZWxvdy5cbiAgICAgICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICBjb250ZXh0LmFyZyA9IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgXCJUaGUgaXRlcmF0b3IgZG9lcyBub3QgcHJvdmlkZSBhICd0aHJvdycgbWV0aG9kXCIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2gobWV0aG9kLCBkZWxlZ2F0ZS5pdGVyYXRvciwgY29udGV4dC5hcmcpO1xuXG4gICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgY29udGV4dC5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICB2YXIgaW5mbyA9IHJlY29yZC5hcmc7XG5cbiAgICBpZiAoISBpbmZvKSB7XG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgIGNvbnRleHQuYXJnID0gbmV3IFR5cGVFcnJvcihcIml0ZXJhdG9yIHJlc3VsdCBpcyBub3QgYW4gb2JqZWN0XCIpO1xuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICBpZiAoaW5mby5kb25lKSB7XG4gICAgICAvLyBBc3NpZ24gdGhlIHJlc3VsdCBvZiB0aGUgZmluaXNoZWQgZGVsZWdhdGUgdG8gdGhlIHRlbXBvcmFyeVxuICAgICAgLy8gdmFyaWFibGUgc3BlY2lmaWVkIGJ5IGRlbGVnYXRlLnJlc3VsdE5hbWUgKHNlZSBkZWxlZ2F0ZVlpZWxkKS5cbiAgICAgIGNvbnRleHRbZGVsZWdhdGUucmVzdWx0TmFtZV0gPSBpbmZvLnZhbHVlO1xuXG4gICAgICAvLyBSZXN1bWUgZXhlY3V0aW9uIGF0IHRoZSBkZXNpcmVkIGxvY2F0aW9uIChzZWUgZGVsZWdhdGVZaWVsZCkuXG4gICAgICBjb250ZXh0Lm5leHQgPSBkZWxlZ2F0ZS5uZXh0TG9jO1xuXG4gICAgICAvLyBJZiBjb250ZXh0Lm1ldGhvZCB3YXMgXCJ0aHJvd1wiIGJ1dCB0aGUgZGVsZWdhdGUgaGFuZGxlZCB0aGVcbiAgICAgIC8vIGV4Y2VwdGlvbiwgbGV0IHRoZSBvdXRlciBnZW5lcmF0b3IgcHJvY2VlZCBub3JtYWxseS4gSWZcbiAgICAgIC8vIGNvbnRleHQubWV0aG9kIHdhcyBcIm5leHRcIiwgZm9yZ2V0IGNvbnRleHQuYXJnIHNpbmNlIGl0IGhhcyBiZWVuXG4gICAgICAvLyBcImNvbnN1bWVkXCIgYnkgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yLiBJZiBjb250ZXh0Lm1ldGhvZCB3YXNcbiAgICAgIC8vIFwicmV0dXJuXCIsIGFsbG93IHRoZSBvcmlnaW5hbCAucmV0dXJuIGNhbGwgdG8gY29udGludWUgaW4gdGhlXG4gICAgICAvLyBvdXRlciBnZW5lcmF0b3IuXG4gICAgICBpZiAoY29udGV4dC5tZXRob2QgIT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUmUteWllbGQgdGhlIHJlc3VsdCByZXR1cm5lZCBieSB0aGUgZGVsZWdhdGUgbWV0aG9kLlxuICAgICAgcmV0dXJuIGluZm87XG4gICAgfVxuXG4gICAgLy8gVGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGlzIGZpbmlzaGVkLCBzbyBmb3JnZXQgaXQgYW5kIGNvbnRpbnVlIHdpdGhcbiAgICAvLyB0aGUgb3V0ZXIgZ2VuZXJhdG9yLlxuICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICB9XG5cbiAgLy8gRGVmaW5lIEdlbmVyYXRvci5wcm90b3R5cGUue25leHQsdGhyb3cscmV0dXJufSBpbiB0ZXJtcyBvZiB0aGVcbiAgLy8gdW5pZmllZCAuX2ludm9rZSBoZWxwZXIgbWV0aG9kLlxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoR3ApO1xuXG4gIEdwW3RvU3RyaW5nVGFnU3ltYm9sXSA9IFwiR2VuZXJhdG9yXCI7XG5cbiAgLy8gQSBHZW5lcmF0b3Igc2hvdWxkIGFsd2F5cyByZXR1cm4gaXRzZWxmIGFzIHRoZSBpdGVyYXRvciBvYmplY3Qgd2hlbiB0aGVcbiAgLy8gQEBpdGVyYXRvciBmdW5jdGlvbiBpcyBjYWxsZWQgb24gaXQuIFNvbWUgYnJvd3NlcnMnIGltcGxlbWVudGF0aW9ucyBvZiB0aGVcbiAgLy8gaXRlcmF0b3IgcHJvdG90eXBlIGNoYWluIGluY29ycmVjdGx5IGltcGxlbWVudCB0aGlzLCBjYXVzaW5nIHRoZSBHZW5lcmF0b3JcbiAgLy8gb2JqZWN0IHRvIG5vdCBiZSByZXR1cm5lZCBmcm9tIHRoaXMgY2FsbC4gVGhpcyBlbnN1cmVzIHRoYXQgZG9lc24ndCBoYXBwZW4uXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVnZW5lcmF0b3IvaXNzdWVzLzI3NCBmb3IgbW9yZSBkZXRhaWxzLlxuICBHcFtpdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBHcC50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcIltvYmplY3QgR2VuZXJhdG9yXVwiO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHB1c2hUcnlFbnRyeShsb2NzKSB7XG4gICAgdmFyIGVudHJ5ID0geyB0cnlMb2M6IGxvY3NbMF0gfTtcblxuICAgIGlmICgxIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmNhdGNoTG9jID0gbG9jc1sxXTtcbiAgICB9XG5cbiAgICBpZiAoMiBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5maW5hbGx5TG9jID0gbG9jc1syXTtcbiAgICAgIGVudHJ5LmFmdGVyTG9jID0gbG9jc1szXTtcbiAgICB9XG5cbiAgICB0aGlzLnRyeUVudHJpZXMucHVzaChlbnRyeSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldFRyeUVudHJ5KGVudHJ5KSB7XG4gICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb24gfHwge307XG4gICAgcmVjb3JkLnR5cGUgPSBcIm5vcm1hbFwiO1xuICAgIGRlbGV0ZSByZWNvcmQuYXJnO1xuICAgIGVudHJ5LmNvbXBsZXRpb24gPSByZWNvcmQ7XG4gIH1cblxuICBmdW5jdGlvbiBDb250ZXh0KHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gVGhlIHJvb3QgZW50cnkgb2JqZWN0IChlZmZlY3RpdmVseSBhIHRyeSBzdGF0ZW1lbnQgd2l0aG91dCBhIGNhdGNoXG4gICAgLy8gb3IgYSBmaW5hbGx5IGJsb2NrKSBnaXZlcyB1cyBhIHBsYWNlIHRvIHN0b3JlIHZhbHVlcyB0aHJvd24gZnJvbVxuICAgIC8vIGxvY2F0aW9ucyB3aGVyZSB0aGVyZSBpcyBubyBlbmNsb3NpbmcgdHJ5IHN0YXRlbWVudC5cbiAgICB0aGlzLnRyeUVudHJpZXMgPSBbeyB0cnlMb2M6IFwicm9vdFwiIH1dO1xuICAgIHRyeUxvY3NMaXN0LmZvckVhY2gocHVzaFRyeUVudHJ5LCB0aGlzKTtcbiAgICB0aGlzLnJlc2V0KHRydWUpO1xuICB9XG5cbiAgZXhwb3J0cy5rZXlzID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICB9XG4gICAga2V5cy5yZXZlcnNlKCk7XG5cbiAgICAvLyBSYXRoZXIgdGhhbiByZXR1cm5pbmcgYW4gb2JqZWN0IHdpdGggYSBuZXh0IG1ldGhvZCwgd2Uga2VlcFxuICAgIC8vIHRoaW5ncyBzaW1wbGUgYW5kIHJldHVybiB0aGUgbmV4dCBmdW5jdGlvbiBpdHNlbGYuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICB3aGlsZSAoa2V5cy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGtleSA9IGtleXMucG9wKCk7XG4gICAgICAgIGlmIChrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgbmV4dC52YWx1ZSA9IGtleTtcbiAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUbyBhdm9pZCBjcmVhdGluZyBhbiBhZGRpdGlvbmFsIG9iamVjdCwgd2UganVzdCBoYW5nIHRoZSAudmFsdWVcbiAgICAgIC8vIGFuZCAuZG9uZSBwcm9wZXJ0aWVzIG9mZiB0aGUgbmV4dCBmdW5jdGlvbiBvYmplY3QgaXRzZWxmLiBUaGlzXG4gICAgICAvLyBhbHNvIGVuc3VyZXMgdGhhdCB0aGUgbWluaWZpZXIgd2lsbCBub3QgYW5vbnltaXplIHRoZSBmdW5jdGlvbi5cbiAgICAgIG5leHQuZG9uZSA9IHRydWU7XG4gICAgICByZXR1cm4gbmV4dDtcbiAgICB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbHVlcyhpdGVyYWJsZSkge1xuICAgIGlmIChpdGVyYWJsZSkge1xuICAgICAgdmFyIGl0ZXJhdG9yTWV0aG9kID0gaXRlcmFibGVbaXRlcmF0b3JTeW1ib2xdO1xuICAgICAgaWYgKGl0ZXJhdG9yTWV0aG9kKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvck1ldGhvZC5jYWxsKGl0ZXJhYmxlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBpdGVyYWJsZS5uZXh0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhYmxlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWlzTmFOKGl0ZXJhYmxlLmxlbmd0aCkpIHtcbiAgICAgICAgdmFyIGkgPSAtMSwgbmV4dCA9IGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgd2hpbGUgKCsraSA8IGl0ZXJhYmxlLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKGhhc093bi5jYWxsKGl0ZXJhYmxlLCBpKSkge1xuICAgICAgICAgICAgICBuZXh0LnZhbHVlID0gaXRlcmFibGVbaV07XG4gICAgICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXh0LnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG5leHQuZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbmV4dC5uZXh0ID0gbmV4dDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gYW4gaXRlcmF0b3Igd2l0aCBubyB2YWx1ZXMuXG4gICAgcmV0dXJuIHsgbmV4dDogZG9uZVJlc3VsdCB9O1xuICB9XG4gIGV4cG9ydHMudmFsdWVzID0gdmFsdWVzO1xuXG4gIGZ1bmN0aW9uIGRvbmVSZXN1bHQoKSB7XG4gICAgcmV0dXJuIHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9O1xuICB9XG5cbiAgQ29udGV4dC5wcm90b3R5cGUgPSB7XG4gICAgY29uc3RydWN0b3I6IENvbnRleHQsXG5cbiAgICByZXNldDogZnVuY3Rpb24oc2tpcFRlbXBSZXNldCkge1xuICAgICAgdGhpcy5wcmV2ID0gMDtcbiAgICAgIHRoaXMubmV4dCA9IDA7XG4gICAgICAvLyBSZXNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgLy8gZnVuY3Rpb24uc2VudCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgIHRoaXMuc2VudCA9IHRoaXMuX3NlbnQgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICB0aGlzLm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG5cbiAgICAgIHRoaXMudHJ5RW50cmllcy5mb3JFYWNoKHJlc2V0VHJ5RW50cnkpO1xuXG4gICAgICBpZiAoIXNraXBUZW1wUmVzZXQpIHtcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzKSB7XG4gICAgICAgICAgLy8gTm90IHN1cmUgYWJvdXQgdGhlIG9wdGltYWwgb3JkZXIgb2YgdGhlc2UgY29uZGl0aW9uczpcbiAgICAgICAgICBpZiAobmFtZS5jaGFyQXQoMCkgPT09IFwidFwiICYmXG4gICAgICAgICAgICAgIGhhc093bi5jYWxsKHRoaXMsIG5hbWUpICYmXG4gICAgICAgICAgICAgICFpc05hTigrbmFtZS5zbGljZSgxKSkpIHtcbiAgICAgICAgICAgIHRoaXNbbmFtZV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcblxuICAgICAgdmFyIHJvb3RFbnRyeSA9IHRoaXMudHJ5RW50cmllc1swXTtcbiAgICAgIHZhciByb290UmVjb3JkID0gcm9vdEVudHJ5LmNvbXBsZXRpb247XG4gICAgICBpZiAocm9vdFJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcm9vdFJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJ2YWw7XG4gICAgfSxcblxuICAgIGRpc3BhdGNoRXhjZXB0aW9uOiBmdW5jdGlvbihleGNlcHRpb24pIHtcbiAgICAgIGlmICh0aGlzLmRvbmUpIHtcbiAgICAgICAgdGhyb3cgZXhjZXB0aW9uO1xuICAgICAgfVxuXG4gICAgICB2YXIgY29udGV4dCA9IHRoaXM7XG4gICAgICBmdW5jdGlvbiBoYW5kbGUobG9jLCBjYXVnaHQpIHtcbiAgICAgICAgcmVjb3JkLnR5cGUgPSBcInRocm93XCI7XG4gICAgICAgIHJlY29yZC5hcmcgPSBleGNlcHRpb247XG4gICAgICAgIGNvbnRleHQubmV4dCA9IGxvYztcblxuICAgICAgICBpZiAoY2F1Z2h0KSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGRpc3BhdGNoZWQgZXhjZXB0aW9uIHdhcyBjYXVnaHQgYnkgYSBjYXRjaCBibG9jayxcbiAgICAgICAgICAvLyB0aGVuIGxldCB0aGF0IGNhdGNoIGJsb2NrIGhhbmRsZSB0aGUgZXhjZXB0aW9uIG5vcm1hbGx5LlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gISEgY2F1Z2h0O1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gXCJyb290XCIpIHtcbiAgICAgICAgICAvLyBFeGNlcHRpb24gdGhyb3duIG91dHNpZGUgb2YgYW55IHRyeSBibG9jayB0aGF0IGNvdWxkIGhhbmRsZVxuICAgICAgICAgIC8vIGl0LCBzbyBzZXQgdGhlIGNvbXBsZXRpb24gdmFsdWUgb2YgdGhlIGVudGlyZSBmdW5jdGlvbiB0b1xuICAgICAgICAgIC8vIHRocm93IHRoZSBleGNlcHRpb24uXG4gICAgICAgICAgcmV0dXJuIGhhbmRsZShcImVuZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2KSB7XG4gICAgICAgICAgdmFyIGhhc0NhdGNoID0gaGFzT3duLmNhbGwoZW50cnksIFwiY2F0Y2hMb2NcIik7XG4gICAgICAgICAgdmFyIGhhc0ZpbmFsbHkgPSBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpO1xuXG4gICAgICAgICAgaWYgKGhhc0NhdGNoICYmIGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNDYXRjaCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRyeSBzdGF0ZW1lbnQgd2l0aG91dCBjYXRjaCBvciBmaW5hbGx5XCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBhYnJ1cHQ6IGZ1bmN0aW9uKHR5cGUsIGFyZykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2ICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpICYmXG4gICAgICAgICAgICB0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgdmFyIGZpbmFsbHlFbnRyeSA9IGVudHJ5O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkgJiZcbiAgICAgICAgICAodHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgIHR5cGUgPT09IFwiY29udGludWVcIikgJiZcbiAgICAgICAgICBmaW5hbGx5RW50cnkudHJ5TG9jIDw9IGFyZyAmJlxuICAgICAgICAgIGFyZyA8PSBmaW5hbGx5RW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAvLyBJZ25vcmUgdGhlIGZpbmFsbHkgZW50cnkgaWYgY29udHJvbCBpcyBub3QganVtcGluZyB0byBhXG4gICAgICAgIC8vIGxvY2F0aW9uIG91dHNpZGUgdGhlIHRyeS9jYXRjaCBibG9jay5cbiAgICAgICAgZmluYWxseUVudHJ5ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlY29yZCA9IGZpbmFsbHlFbnRyeSA/IGZpbmFsbHlFbnRyeS5jb21wbGV0aW9uIDoge307XG4gICAgICByZWNvcmQudHlwZSA9IHR5cGU7XG4gICAgICByZWNvcmQuYXJnID0gYXJnO1xuXG4gICAgICBpZiAoZmluYWxseUVudHJ5KSB7XG4gICAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgIHRoaXMubmV4dCA9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jO1xuICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuY29tcGxldGUocmVjb3JkKTtcbiAgICB9LFxuXG4gICAgY29tcGxldGU6IGZ1bmN0aW9uKHJlY29yZCwgYWZ0ZXJMb2MpIHtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgcmVjb3JkLnR5cGUgPT09IFwiY29udGludWVcIikge1xuICAgICAgICB0aGlzLm5leHQgPSByZWNvcmQuYXJnO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICB0aGlzLnJ2YWwgPSB0aGlzLmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIHRoaXMubWV0aG9kID0gXCJyZXR1cm5cIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gXCJlbmRcIjtcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIgJiYgYWZ0ZXJMb2MpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gYWZ0ZXJMb2M7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH0sXG5cbiAgICBmaW5pc2g6IGZ1bmN0aW9uKGZpbmFsbHlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkuZmluYWxseUxvYyA9PT0gZmluYWxseUxvYykge1xuICAgICAgICAgIHRoaXMuY29tcGxldGUoZW50cnkuY29tcGxldGlvbiwgZW50cnkuYWZ0ZXJMb2MpO1xuICAgICAgICAgIHJlc2V0VHJ5RW50cnkoZW50cnkpO1xuICAgICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIFwiY2F0Y2hcIjogZnVuY3Rpb24odHJ5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gdHJ5TG9jKSB7XG4gICAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG4gICAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIHZhciB0aHJvd24gPSByZWNvcmQuYXJnO1xuICAgICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aHJvd247XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVGhlIGNvbnRleHQuY2F0Y2ggbWV0aG9kIG11c3Qgb25seSBiZSBjYWxsZWQgd2l0aCBhIGxvY2F0aW9uXG4gICAgICAvLyBhcmd1bWVudCB0aGF0IGNvcnJlc3BvbmRzIHRvIGEga25vd24gY2F0Y2ggYmxvY2suXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbGxlZ2FsIGNhdGNoIGF0dGVtcHRcIik7XG4gICAgfSxcblxuICAgIGRlbGVnYXRlWWllbGQ6IGZ1bmN0aW9uKGl0ZXJhYmxlLCByZXN1bHROYW1lLCBuZXh0TG9jKSB7XG4gICAgICB0aGlzLmRlbGVnYXRlID0ge1xuICAgICAgICBpdGVyYXRvcjogdmFsdWVzKGl0ZXJhYmxlKSxcbiAgICAgICAgcmVzdWx0TmFtZTogcmVzdWx0TmFtZSxcbiAgICAgICAgbmV4dExvYzogbmV4dExvY1xuICAgICAgfTtcblxuICAgICAgaWYgKHRoaXMubWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAvLyBEZWxpYmVyYXRlbHkgZm9yZ2V0IHRoZSBsYXN0IHNlbnQgdmFsdWUgc28gdGhhdCB3ZSBkb24ndFxuICAgICAgICAvLyBhY2NpZGVudGFsbHkgcGFzcyBpdCBvbiB0byB0aGUgZGVsZWdhdGUuXG4gICAgICAgIHRoaXMuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG4gIH07XG5cbiAgLy8gUmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoaXMgc2NyaXB0IGlzIGV4ZWN1dGluZyBhcyBhIENvbW1vbkpTIG1vZHVsZVxuICAvLyBvciBub3QsIHJldHVybiB0aGUgcnVudGltZSBvYmplY3Qgc28gdGhhdCB3ZSBjYW4gZGVjbGFyZSB0aGUgdmFyaWFibGVcbiAgLy8gcmVnZW5lcmF0b3JSdW50aW1lIGluIHRoZSBvdXRlciBzY29wZSwgd2hpY2ggYWxsb3dzIHRoaXMgbW9kdWxlIHRvIGJlXG4gIC8vIGluamVjdGVkIGVhc2lseSBieSBgYmluL3JlZ2VuZXJhdG9yIC0taW5jbHVkZS1ydW50aW1lIHNjcmlwdC5qc2AuXG4gIHJldHVybiBleHBvcnRzO1xuXG59KFxuICAvLyBJZiB0aGlzIHNjcmlwdCBpcyBleGVjdXRpbmcgYXMgYSBDb21tb25KUyBtb2R1bGUsIHVzZSBtb2R1bGUuZXhwb3J0c1xuICAvLyBhcyB0aGUgcmVnZW5lcmF0b3JSdW50aW1lIG5hbWVzcGFjZS4gT3RoZXJ3aXNlIGNyZWF0ZSBhIG5ldyBlbXB0eVxuICAvLyBvYmplY3QuIEVpdGhlciB3YXksIHRoZSByZXN1bHRpbmcgb2JqZWN0IHdpbGwgYmUgdXNlZCB0byBpbml0aWFsaXplXG4gIC8vIHRoZSByZWdlbmVyYXRvclJ1bnRpbWUgdmFyaWFibGUgYXQgdGhlIHRvcCBvZiB0aGlzIGZpbGUuXG4gIHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgPyBtb2R1bGUuZXhwb3J0cyA6IHt9XG4pKTtcblxudHJ5IHtcbiAgcmVnZW5lcmF0b3JSdW50aW1lID0gcnVudGltZTtcbn0gY2F0Y2ggKGFjY2lkZW50YWxTdHJpY3RNb2RlKSB7XG4gIC8vIFRoaXMgbW9kdWxlIHNob3VsZCBub3QgYmUgcnVubmluZyBpbiBzdHJpY3QgbW9kZSwgc28gdGhlIGFib3ZlXG4gIC8vIGFzc2lnbm1lbnQgc2hvdWxkIGFsd2F5cyB3b3JrIHVubGVzcyBzb21ldGhpbmcgaXMgbWlzY29uZmlndXJlZC4gSnVzdFxuICAvLyBpbiBjYXNlIHJ1bnRpbWUuanMgYWNjaWRlbnRhbGx5IHJ1bnMgaW4gc3RyaWN0IG1vZGUsIHdlIGNhbiBlc2NhcGVcbiAgLy8gc3RyaWN0IG1vZGUgdXNpbmcgYSBnbG9iYWwgRnVuY3Rpb24gY2FsbC4gVGhpcyBjb3VsZCBjb25jZWl2YWJseSBmYWlsXG4gIC8vIGlmIGEgQ29udGVudCBTZWN1cml0eSBQb2xpY3kgZm9yYmlkcyB1c2luZyBGdW5jdGlvbiwgYnV0IGluIHRoYXQgY2FzZVxuICAvLyB0aGUgcHJvcGVyIHNvbHV0aW9uIGlzIHRvIGZpeCB0aGUgYWNjaWRlbnRhbCBzdHJpY3QgbW9kZSBwcm9ibGVtLiBJZlxuICAvLyB5b3UndmUgbWlzY29uZmlndXJlZCB5b3VyIGJ1bmRsZXIgdG8gZm9yY2Ugc3RyaWN0IG1vZGUgYW5kIGFwcGxpZWQgYVxuICAvLyBDU1AgdG8gZm9yYmlkIEZ1bmN0aW9uLCBhbmQgeW91J3JlIG5vdCB3aWxsaW5nIHRvIGZpeCBlaXRoZXIgb2YgdGhvc2VcbiAgLy8gcHJvYmxlbXMsIHBsZWFzZSBkZXRhaWwgeW91ciB1bmlxdWUgcHJlZGljYW1lbnQgaW4gYSBHaXRIdWIgaXNzdWUuXG4gIEZ1bmN0aW9uKFwiclwiLCBcInJlZ2VuZXJhdG9yUnVudGltZSA9IHJcIikocnVudGltZSk7XG59XG4iXX0=
