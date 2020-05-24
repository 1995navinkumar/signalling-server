(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function AudioPlayer() {
  var audio = new Audio();
  audio.autoplay = true;

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
    return audio.srcObject;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvYmFja2dyb3VuZC9hdWRpby1wbGF5ZXIuanMiLCJjbGllbnQvYmFja2dyb3VuZC9jb25uZWN0aW9uLW1hbmFnZXIuanMiLCJjbGllbnQvYmFja2dyb3VuZC9oYXJrLmpzIiwiY2xpZW50L2JhY2tncm91bmQvaW5kZXguanMiLCJjbGllbnQvYmFja2dyb3VuZC9wZWVyLmpzIiwiY2xpZW50L2JhY2tncm91bmQvcnRjLmpzIiwiY2xpZW50L2JhY2tncm91bmQvd3MtaGFuZGxlci5qcyIsImNsaWVudC91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2FycmF5TGlrZVRvQXJyYXkuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9hcnJheVdpdGhIb2xlcy5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2FzeW5jVG9HZW5lcmF0b3IuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jbGFzc0NhbGxDaGVjay5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2NyZWF0ZUNsYXNzLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVXaWxkY2FyZC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2l0ZXJhYmxlVG9BcnJheUxpbWl0LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvbm9uSXRlcmFibGVSZXN0LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZi5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL3JlZ2VuZXJhdG9yL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCJub2RlX21vZHVsZXMvcmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7OztBQ0FBLFNBQVMsV0FBVCxHQUF1QjtBQUNuQixNQUFJLEtBQUssR0FBRyxJQUFJLEtBQUosRUFBWjtBQUNBLEVBQUEsS0FBSyxDQUFDLFFBQU4sR0FBaUIsSUFBakI7O0FBQ0EsV0FBUyxJQUFULEdBQWdCO0FBQ1osSUFBQSxLQUFLLENBQUMsSUFBTjtBQUNIOztBQUNELFdBQVMsS0FBVCxHQUFpQjtBQUNiLElBQUEsS0FBSyxDQUFDLEtBQU47QUFDSDs7QUFDRCxXQUFTLFNBQVQsQ0FBbUIsTUFBbkIsRUFBMkI7QUFDdkIsSUFBQSxLQUFLLENBQUMsU0FBTixHQUFrQixNQUFsQjtBQUNIOztBQUNELFdBQVMsU0FBVCxHQUFxQjtBQUNsQixXQUFPLEtBQUssQ0FBQyxTQUFiO0FBQ0Y7O0FBQ0QsU0FBTztBQUNILElBQUEsSUFBSSxFQUFKLElBREc7QUFFSCxJQUFBLEtBQUssRUFBTCxLQUZHO0FBR0gsSUFBQSxTQUFTLEVBQVQsU0FIRztBQUlILElBQUEsU0FBUyxFQUFUO0FBSkcsR0FBUDtBQU1IOztBQUNELElBQUksTUFBTSxHQUFHLFdBQVcsRUFBeEI7QUFDQSxNQUFNLENBQUMsV0FBUCxHQUFxQixNQUFyQjtlQUNlLE07Ozs7Ozs7Ozs7Ozs7Ozs7O0FDeEJmOztBQUNBOztBQUVBLElBQU0saUJBQWlCLEdBQUksU0FBUyxpQkFBVCxHQUE2QjtBQUNwRCxNQUFJLGdCQUFKOztB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QUE7QUFBQTtBQUFBO0FBQUEsRzs7Ozs7QUMvQlA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiZnVuY3Rpb24gQXVkaW9QbGF5ZXIoKSB7XG4gICAgdmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCk7XG4gICAgYXVkaW8uYXV0b3BsYXkgPSB0cnVlO1xuICAgIGZ1bmN0aW9uIHBsYXkoKSB7XG4gICAgICAgIGF1ZGlvLnBsYXkoKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcGF1c2UoKSB7XG4gICAgICAgIGF1ZGlvLnBhdXNlKCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNldFN0cmVhbShzdHJlYW0pIHtcbiAgICAgICAgYXVkaW8uc3JjT2JqZWN0ID0gc3RyZWFtO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnZXRTdHJlYW0oKSB7XG4gICAgICAgcmV0dXJuIGF1ZGlvLnNyY09iamVjdDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGxheSxcbiAgICAgICAgcGF1c2UsXG4gICAgICAgIHNldFN0cmVhbSxcbiAgICAgICAgZ2V0U3RyZWFtXG4gICAgfVxufVxudmFyIHBsYXllciA9IEF1ZGlvUGxheWVyKCk7XG53aW5kb3cuQXVkaW9QbGF5ZXIgPSBwbGF5ZXI7XG5leHBvcnQgZGVmYXVsdCBwbGF5ZXI7IiwiaW1wb3J0IHsgcGlwZSwgbWVzc2FnZVBhcnNlciB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnZXZlbnRzJztcblxuY29uc3QgQ29ubmVjdGlvbk1hbmFnZXIgPSAoZnVuY3Rpb24gQ29ubmVjdGlvbk1hbmFnZXIoKSB7XG4gICAgdmFyIGFjdGl2ZUNvbm5lY3Rpb247XG4gICAgYXN5bmMgZnVuY3Rpb24gY3JlYXRlQ29ubmVjdGlvbih1cmwsIHF1ZXJ5UGFyYW1zLCBoYW5kbGVyKSB7XG4gICAgICAgIHZhciB3cyA9IGF3YWl0IG1ha2VDb25uZWN0aW9uKHVybCwgcXVlcnlQYXJhbXMpO1xuICAgICAgICBhY3RpdmVDb25uZWN0aW9uID0gbmV3IENvbm5lY3Rpb24od3MsIGhhbmRsZXIpO1xuICAgICAgICByZXR1cm4gYWN0aXZlQ29ubmVjdGlvbjtcbiAgICB9XG4gICAgZnVuY3Rpb24gdGVybWluYXRlQ29ubmVjdGlvbigpIHtcbiAgICAgICAgaWYgKCFhY3RpdmVDb25uZWN0aW9uKSB7IHJldHVybiB9O1xuICAgICAgICBhY3RpdmVDb25uZWN0aW9uLmV2ZW50cy5lbWl0KFwiY2xvc2VcIik7XG4gICAgICAgIGFjdGl2ZUNvbm5lY3Rpb24uY2xvc2UoKTtcbiAgICAgICAgYWN0aXZlQ29ubmVjdGlvbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc29sZS5sb2coXCJjb25uZWN0aW9uIHRlcm1pbmF0ZWRcIik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdldENvbm5lY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhY3RpdmVDb25uZWN0aW9uO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBjcmVhdGVDb25uZWN0aW9uLFxuICAgICAgICB0ZXJtaW5hdGVDb25uZWN0aW9uLFxuICAgICAgICBnZXRDb25uZWN0aW9uXG4gICAgfVxufSkoKTtcblxud2luZG93LkNvbm5lY3Rpb25NYW5hZ2VyID0gQ29ubmVjdGlvbk1hbmFnZXI7XG5cbmFzeW5jIGZ1bmN0aW9uIG1ha2VDb25uZWN0aW9uKHVybCwgcXVlcnlQYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICB2YXIgd3MgPSBuZXcgV2ViU29ja2V0KGB3czovLyR7dXJsfT8ke3F1ZXJ5UGFyYW1zfWApO1xuICAgICAgICB3cy5vbm9wZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInNvY2tldCBjb25uZWN0aW9uIGVzdGFibGlzaGVkIFwiKTtcbiAgICAgICAgICAgIHJlc29sdmUod3MpO1xuICAgICAgICB9O1xuICAgICAgICB3cy5vbmVycm9yID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZXJyb3IgaW4gY29ubmVjdGlvbiBlc3RhYmxpc2htZW50XCIsIGUpO1xuICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICB9XG4gICAgICAgIHdzLm9uY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInNvY2tldCBjbG9zZWRcIik7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gQ29ubmVjdGlvbih3cywgaGFuZGxlcikge1xuICAgIHRoaXMud3MgPSB3cztcbiAgICB0aGlzLmhhbmRsZXIgPSBNZXNzYWdlSGFuZGxlci5jYWxsKHRoaXMsIGhhbmRsZXIpO1xuICAgIHRoaXMuZXZlbnRzID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHdzLm9ubWVzc2FnZSA9IHBpcGUobWVzc2FnZVBhcnNlciwgdGhpcy5oYW5kbGVyKTtcbn1cblxuQ29ubmVjdGlvbi5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbiBjbG9zZSgpIHtcbiAgICB0aGlzLndzLmNsb3NlKDEwMDAsIFwibG9nZ2VkIG91dFwiKTtcbn1cblxuQ29ubmVjdGlvbi5wcm90b3R5cGUuc2lnbmFsID0gZnVuY3Rpb24gc2lnbmFsKG1lc3NhZ2UpIHtcbiAgICB0aGlzLndzLnNlbmQoSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpXG59XG5cbkNvbm5lY3Rpb24ucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiByZXF1ZXN0KG1lc3NhZ2UpIHtcbiAgICBtZXNzYWdlLmNhdGVnb3J5ID0gXCJyZXF1ZXN0XCI7XG4gICAgdGhpcy5zaWduYWwobWVzc2FnZSk7XG59XG5cbkNvbm5lY3Rpb24ucHJvdG90eXBlLnJlc3BvbmQgPSBmdW5jdGlvbiByZXNwb25kKHRvLCBtZXNzYWdlKSB7XG4gICAgbWVzc2FnZS5jYXRlZ29yeSA9IFwicmVzcG9uc2VcIjtcbiAgICBtZXNzYWdlLmRhdGEubWVtYmVySWQgPSB0bztcbiAgICB0aGlzLnNpZ25hbChtZXNzYWdlKTtcbn1cblxuQ29ubmVjdGlvbi5wcm90b3R5cGUuYWN0aW9uID0gZnVuY3Rpb24gYWN0aW9uKG1lc3NhZ2UpIHtcbiAgICBtZXNzYWdlLmNhdGVnb3J5ID0gXCJhY3Rpb25cIjtcbiAgICB0aGlzLnNpZ25hbChtZXNzYWdlKTtcbn1cblxuQ29ubmVjdGlvbi5wcm90b3R5cGUud2VicnRjID0gZnVuY3Rpb24gd2VicnRjKG1lc3NhZ2UpIHtcbiAgICBtZXNzYWdlLmNhdGVnb3J5ID0gXCJ3ZWJydGNcIjtcbiAgICB0aGlzLnNpZ25hbChtZXNzYWdlKTtcbn1cblxuZnVuY3Rpb24gTWVzc2FnZUhhbmRsZXIoY2F0ZWdvcnlNYXBwZXIpIHtcbiAgICByZXR1cm4gKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2cobWVzc2FnZSk7XG4gICAgICAgIHZhciB7IGNhdGVnb3J5LCB0eXBlLCBkYXRhIH0gPSBtZXNzYWdlO1xuICAgICAgICBpZiAoY2F0ZWdvcnkgJiYgdHlwZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2F0ZWdvcnlNYXBwZXJbY2F0ZWdvcnldW3R5cGVdKHRoaXMsIGRhdGEpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbm5lY3Rpb25NYW5hZ2VyOyIsIi8vIG9yaWdpbmFsIHNvdXJjZSBjb2RlIGlzIHRha2VuIGZyb206XG4vLyBodHRwczovL2dpdGh1Yi5jb20vU2ltcGxlV2ViUlRDL2hhcmtcbi8vIGNvcHlyaWdodCBnb2VzIHRvICZ5ZXQgdGVhbVxuLy8gZWRpdGVkIGJ5IE11YXogS2hhbiBmb3IgUlRDTXVsdGlDb25uZWN0aW9uLmpzXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBoYXJrKHN0cmVhbSwgb3B0aW9ucykge1xuICAgIHZhciBhdWRpb0NvbnRleHRUeXBlID0gd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dCB8fCB3aW5kb3cuQXVkaW9Db250ZXh0O1xuXG4gICAgdmFyIGhhcmtlciA9IHRoaXM7XG4gICAgaGFya2VyLmV2ZW50cyA9IHt9O1xuICAgIGhhcmtlci5vbiA9IGZ1bmN0aW9uIChldmVudCwgY2FsbGJhY2spIHtcbiAgICAgICAgaGFya2VyLmV2ZW50c1tldmVudF0gPSBjYWxsYmFjaztcbiAgICB9O1xuXG4gICAgaGFya2VyLmVtaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChoYXJrZXIuZXZlbnRzW2FyZ3VtZW50c1swXV0pIHtcbiAgICAgICAgICAgIGhhcmtlci5ldmVudHNbYXJndW1lbnRzWzBdXShhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSwgYXJndW1lbnRzWzNdLCBhcmd1bWVudHNbNF0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIG1ha2UgaXQgbm90IGJyZWFrIGluIG5vbi1zdXBwb3J0ZWQgYnJvd3NlcnNcbiAgICBpZiAoIWF1ZGlvQ29udGV4dFR5cGUpIHJldHVybiBoYXJrZXI7XG5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAvLyBDb25maWdcbiAgICB2YXIgc21vb3RoaW5nID0gKG9wdGlvbnMuc21vb3RoaW5nIHx8IDAuMSksXG4gICAgICAgIGludGVydmFsID0gKG9wdGlvbnMuaW50ZXJ2YWwgfHwgNTApLFxuICAgICAgICB0aHJlc2hvbGQgPSBvcHRpb25zLnRocmVzaG9sZCxcbiAgICAgICAgcGxheSA9IG9wdGlvbnMucGxheSxcbiAgICAgICAgaGlzdG9yeSA9IG9wdGlvbnMuaGlzdG9yeSB8fCAxMCxcbiAgICAgICAgcnVubmluZyA9IHRydWU7XG5cbiAgICAvLyBTZXR1cCBBdWRpbyBDb250ZXh0XG4gICAgaWYgKCF3aW5kb3cuYXVkaW9Db250ZXh0MDApIHtcbiAgICAgICAgd2luZG93LmF1ZGlvQ29udGV4dDAwID0gbmV3IGF1ZGlvQ29udGV4dFR5cGUoKTtcbiAgICB9XG5cbiAgICB2YXIgZ2Fpbk5vZGUgPSBhdWRpb0NvbnRleHQwMC5jcmVhdGVHYWluKCk7XG4gICAgZ2Fpbk5vZGUuY29ubmVjdChhdWRpb0NvbnRleHQwMC5kZXN0aW5hdGlvbik7XG4gICAgLy8gZG9uJ3QgcGxheSBmb3Igc2VsZlxuICAgIGdhaW5Ob2RlLmdhaW4udmFsdWUgPSAwO1xuXG4gICAgdmFyIHNvdXJjZU5vZGUsIGZmdEJpbnMsIGFuYWx5c2VyO1xuXG4gICAgYW5hbHlzZXIgPSBhdWRpb0NvbnRleHQwMC5jcmVhdGVBbmFseXNlcigpO1xuICAgIGFuYWx5c2VyLmZmdFNpemUgPSA1MTI7XG4gICAgYW5hbHlzZXIuc21vb3RoaW5nVGltZUNvbnN0YW50ID0gc21vb3RoaW5nO1xuICAgIGZmdEJpbnMgPSBuZXcgRmxvYXQzMkFycmF5KGFuYWx5c2VyLmZmdFNpemUpO1xuXG4gICAgLy9XZWJSVEMgU3RyZWFtXG4gICAgc291cmNlTm9kZSA9IGF1ZGlvQ29udGV4dDAwLmNyZWF0ZU1lZGlhU3RyZWFtU291cmNlKHN0cmVhbSk7XG4gICAgdGhyZXNob2xkID0gdGhyZXNob2xkIHx8IC01MDtcblxuICAgIHNvdXJjZU5vZGUuY29ubmVjdChhbmFseXNlcik7XG4gICAgaWYgKHBsYXkpIGFuYWx5c2VyLmNvbm5lY3QoYXVkaW9Db250ZXh0MDAuZGVzdGluYXRpb24pO1xuXG4gICAgaGFya2VyLnNwZWFraW5nID0gZmFsc2U7XG5cbiAgICBoYXJrZXIuc2V0VGhyZXNob2xkID0gZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgdGhyZXNob2xkID0gdDtcbiAgICB9O1xuXG4gICAgaGFya2VyLnNldEludGVydmFsID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgaW50ZXJ2YWwgPSBpO1xuICAgIH07XG5cbiAgICBoYXJrZXIuc3RvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcnVubmluZyA9IGZhbHNlO1xuICAgICAgICBoYXJrZXIuZW1pdCgndm9sdW1lX2NoYW5nZScsIC0xMDAsIHRocmVzaG9sZCk7XG4gICAgICAgIGlmIChoYXJrZXIuc3BlYWtpbmcpIHtcbiAgICAgICAgICAgIGhhcmtlci5zcGVha2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgaGFya2VyLmVtaXQoJ3N0b3BwZWRfc3BlYWtpbmcnKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgaGFya2VyLnNwZWFraW5nSGlzdG9yeSA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGlzdG9yeTsgaSsrKSB7XG4gICAgICAgIGhhcmtlci5zcGVha2luZ0hpc3RvcnkucHVzaCgwKTtcbiAgICB9XG5cbiAgICAvLyBQb2xsIHRoZSBhbmFseXNlciBub2RlIHRvIGRldGVybWluZSBpZiBzcGVha2luZ1xuICAgIC8vIGFuZCBlbWl0IGV2ZW50cyBpZiBjaGFuZ2VkXG4gICAgdmFyIGxvb3BlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIC8vY2hlY2sgaWYgc3RvcCBoYXMgYmVlbiBjYWxsZWRcbiAgICAgICAgICAgIGlmICghcnVubmluZykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGN1cnJlbnRWb2x1bWUgPSBnZXRNYXhWb2x1bWUoYW5hbHlzZXIsIGZmdEJpbnMpO1xuXG4gICAgICAgICAgICBoYXJrZXIuZW1pdCgndm9sdW1lX2NoYW5nZScsIGN1cnJlbnRWb2x1bWUsIHRocmVzaG9sZCk7XG5cbiAgICAgICAgICAgIHZhciBoaXN0b3J5ID0gMDtcbiAgICAgICAgICAgIGlmIChjdXJyZW50Vm9sdW1lID4gdGhyZXNob2xkICYmICFoYXJrZXIuc3BlYWtpbmcpIHtcbiAgICAgICAgICAgICAgICAvLyB0cmlnZ2VyIHF1aWNrbHksIHNob3J0IGhpc3RvcnlcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gaGFya2VyLnNwZWFraW5nSGlzdG9yeS5sZW5ndGggLSAzOyBpIDwgaGFya2VyLnNwZWFraW5nSGlzdG9yeS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBoaXN0b3J5ICs9IGhhcmtlci5zcGVha2luZ0hpc3RvcnlbaV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChoaXN0b3J5ID49IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFya2VyLnNwZWFraW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgaGFya2VyLmVtaXQoJ3NwZWFraW5nJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50Vm9sdW1lIDwgdGhyZXNob2xkICYmIGhhcmtlci5zcGVha2luZykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgaGFya2VyLnNwZWFraW5nSGlzdG9yeS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICBoaXN0b3J5ICs9IGhhcmtlci5zcGVha2luZ0hpc3Rvcnlbal07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChoaXN0b3J5ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhcmtlci5zcGVha2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBoYXJrZXIuZW1pdCgnc3RvcHBlZF9zcGVha2luZycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGhhcmtlci5zcGVha2luZ0hpc3Rvcnkuc2hpZnQoKTtcbiAgICAgICAgICAgIGhhcmtlci5zcGVha2luZ0hpc3RvcnkucHVzaCgwICsgKGN1cnJlbnRWb2x1bWUgPiB0aHJlc2hvbGQpKTtcblxuICAgICAgICAgICAgbG9vcGVyKCk7XG4gICAgICAgIH0sIGludGVydmFsKTtcbiAgICB9O1xuICAgIGxvb3BlcigpO1xuXG4gICAgZnVuY3Rpb24gZ2V0TWF4Vm9sdW1lKGFuYWx5c2VyLCBmZnRCaW5zKSB7XG4gICAgICAgIHZhciBtYXhWb2x1bWUgPSAtSW5maW5pdHk7XG4gICAgICAgIGFuYWx5c2VyLmdldEZsb2F0RnJlcXVlbmN5RGF0YShmZnRCaW5zKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gNCwgaWkgPSBmZnRCaW5zLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChmZnRCaW5zW2ldID4gbWF4Vm9sdW1lICYmIGZmdEJpbnNbaV0gPCAwKSB7XG4gICAgICAgICAgICAgICAgbWF4Vm9sdW1lID0gZmZ0Qmluc1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtYXhWb2x1bWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGhhcmtlcjtcbn0iLCJpbXBvcnQgQ29ubmVjdGlvbk1hbmFnZXIgZnJvbSAnLi9jb25uZWN0aW9uLW1hbmFnZXInO1xuaW1wb3J0ICogYXMgUGVlciBmcm9tICcuL3BlZXInO1xuaW1wb3J0IEF1ZGlvUGxheWVyIGZyb20gJy4vYXVkaW8tcGxheWVyJztcbmltcG9ydCBTb2NrZXRIYW5kbGVyIGZyb20gJy4vd3MtaGFuZGxlcic7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cyc7XG5cbmNvbnNvbGUubG9nKFBlZXIpXG53aW5kb3cucGVlciA9IFBlZXI7XG53aW5kb3cuU29ja2V0SGFuZGxlciA9IFNvY2tldEhhbmRsZXI7XG53aW5kb3cuZXZlbnRzID0gbmV3IEV2ZW50RW1pdHRlcigpOyIsImltcG9ydCBBdWRpb1BsYXllciBmcm9tICcuL2F1ZGlvLXBsYXllcic7XG5pbXBvcnQgaGFyayBmcm9tICcuL2hhcmsnO1xudmFyIGF1ZGlvU3RyZWFtO1xuXG52YXIgcGVlciwgcGFydHlNZW1iZXJzID0ge307XG5cbmZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIGlmIChwZWVyKSB7XG4gICAgICAgIHBlZXIuY2xvc2UoKTtcbiAgICAgICAgcGVlciA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKE9iamVjdC5rZXlzKHBhcnR5TWVtYmVycykubGVuZ3RoID4gMCkge1xuICAgICAgICBwYXJ0eU1lbWJlcnMuZm9yRWFjaChwZWVyQ29uID0+IHtcbiAgICAgICAgICAgIHBlZXJDb24uY2xvc2UoKTtcbiAgICAgICAgfSlcbiAgICAgICAgcGFydHlNZW1iZXJzID0ge307XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXVkaW9TdHJlYW0oKSB7XG4gICAgaWYgKCFhdWRpb1N0cmVhbSkge1xuICAgICAgICBhdWRpb1N0cmVhbSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGNocm9tZS50YWJzLnF1ZXJ5KHsgYWN0aXZlOiB0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlIH0sICh0YWJzKSA9PiB7XG4gICAgICAgICAgICAgICAgY2hyb21lLnRhYkNhcHR1cmUuY2FwdHVyZSh7IGF1ZGlvOiB0cnVlIH0sIChzdHJlYW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgQXVkaW9QbGF5ZXIuc2V0U3RyZWFtKHN0cmVhbSk7XG4gICAgICAgICAgICAgICAgICAgIEF1ZGlvUGxheWVyLnBsYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShzdHJlYW0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiBhdWRpb1N0cmVhbTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0b3BTdHJlYW1pbmcoKSB7XG4gICAgZ2V0QXVkaW9TdHJlYW0oKS50aGVuKHN0cmVhbSA9PiB7XG4gICAgICAgIHZhciB0cmFja3MgPSBzdHJlYW0uZ2V0VHJhY2tzKCk7XG4gICAgICAgIHRyYWNrcyAmJiB0cmFja3MuZm9yRWFjaChmdW5jdGlvbiAodHJhY2spIHtcbiAgICAgICAgICAgIHRyYWNrLnN0b3AoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgYXVkaW9TdHJlYW0gPSB1bmRlZmluZWQ7XG59XG4iLCIvKipcbiAqIFVzZWQgZm9yIGFic3RyYWN0aW9uIG9mIHdlYnJ0YyBpbXBsZW1lbnRhdGlvbnNcbiAqIEBtb2R1bGUgUlRDX0Nvbm5uZWN0b3JcbiAqIEBleHRlbmRzIEV2ZW50VGFyZ2V0XG4gKi9cblxudmFyIGxvZyA9IGNvbnNvbGUubG9nO1xuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMnO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUlRDX0Nvbm5uZWN0b3Ige1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGljZVNlcnZlcnMgXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHBlZXJFdmVudHMgU2V0IG9mIGFjdGlvbnMgdGhhdCBoYXMgdG8gYmUgY2FsbGVkIGR1cmluZyB0aGUgcGVlciB0cmFuc21pc3Npb25zXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gcGVlckV2ZW50cy5vbmljZWNhbmRpZGF0ZVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHBlZXJFdmVudHMub250cmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHBlZXJFdmVudHMub25uZWdvdGlhdGlvbm5lZWRlZCAgXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoaWNlU2VydmVycywgc3RyZWFtcywgcGVlckV2ZW50cyA9IHt9KSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkge1JUQ1BlZXJDb25uZWN0aW9ufSBydGNQZWVyIHJ0YyBwZWVyIGluc3RhbmNlIHdoaWNoIGlzIHVzZWQgdG8gaW5pdGlhdGUgYSBjb21tdW5pY2F0aW9uIHdpdGggb3RoZXIgcGVlcnMgXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNvbnN0cmFpbnRzID0ge1xuICAgICAgICAgICAgYXVkaW86IHRydWVcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5ydGNQZWVyID0gbmV3IFJUQ1BlZXJDb25uZWN0aW9uKHtcbiAgICAgICAgICAgIGljZVNlcnZlcnNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGV2ZW50SGFuZGxlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICAgICAgdGhpcy5vbiA9IGV2ZW50SGFuZGxlci5vbjtcbiAgICAgICAgdGhpcy5vZmYgPSBldmVudEhhbmRsZXIub2ZmO1xuICAgICAgICB0aGlzLnRyaWdnZXIgPSBldmVudEhhbmRsZXIuZW1pdDtcblxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnJ0Y1BlZXIpO1xuXG5cbiAgICAgICAgdGhpcy5ydGNQZWVyLm9ubmVnb3RpYXRpb25uZWVkZWQgPSB0aGlzLl9pbml0aWF0ZUNvbm5lY3Rpb24uYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5ydGNQZWVyLm9udHJhY2sgPSB0aGlzLl9vbnRyYWNrLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMucnRjUGVlci5vbmljZWNhbmRpZGF0ZSA9IHRoaXMuX29uaWNlY2FuZGlkYXRlLmJpbmQodGhpcyk7XG5cbiAgICAgICAgaWYgKHN0cmVhbXMpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdHJhY2sgb2Ygc3RyZWFtcy5nZXRUcmFja3MoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucnRjUGVlci5hZGRUcmFjayh0cmFjaywgc3RyZWFtcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfb250cmFjayhldmVudCkge1xuICAgICAgICBsb2coXCJ0cmFjayBhZGRlZCBpbiBydGNcIik7XG4gICAgICAgIHRoaXMudHJpZ2dlcihcInN0cmVhbVJlYWR5XCIsIGV2ZW50KTtcbiAgICB9XG5cbiAgICBhc3luYyBfaW5pdGlhdGVDb25uZWN0aW9uKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbG9nKFwiTmVnb3RpYXRpb24gc3RhcnRlZFwiKTtcbiAgICAgICAgICAgIGNvbnN0IG9mZmVyID0gYXdhaXQgdGhpcy5ydGNQZWVyLmNyZWF0ZU9mZmVyKHRoaXMuY29uc3RyYWludHMpO1xuXG4gICAgICAgICAgICAvLyBJZiB0aGUgY29ubmVjdGlvbiBoYXNuJ3QgeWV0IGFjaGlldmVkIHRoZSBcInN0YWJsZVwiIHN0YXRlLFxuICAgICAgICAgICAgLy8gcmV0dXJuIHRvIHRoZSBjYWxsZXIuIEFub3RoZXIgbmVnb3RpYXRpb25uZWVkZWQgZXZlbnRcbiAgICAgICAgICAgIC8vIHdpbGwgYmUgZmlyZWQgd2hlbiB0aGUgc3RhdGUgc3RhYmlsaXplcy5cbiAgICAgICAgICAgIGlmICh0aGlzLnJ0Y1BlZXIuc2lnbmFsaW5nU3RhdGUgIT0gXCJzdGFibGVcIikge1xuICAgICAgICAgICAgICAgIGxvZyhcIiAgICAgLS0gVGhlIGNvbm5lY3Rpb24gaXNuJ3Qgc3RhYmxlIHlldDsgcG9zdHBvbmluZy4uLlwiKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbG9nKFwiU2V0dGluZyB0byBsb2NhbCBkZXNjcmlwdGlvblwiKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucnRjUGVlci5zZXRMb2NhbERlc2NyaXB0aW9uKG9mZmVyKTtcblxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKFwib2ZmZXJSZWFkeVwiLCB0aGlzLnJ0Y1BlZXIubG9jYWxEZXNjcmlwdGlvbik7XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGxvZyhgRmFpbGVkIGluIE5lZ290aWF0aW9uICR7ZXJyb3J9YClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIGFjY2VwdE9mZmVyKG9mZmVyKSB7XG4gICAgICAgIHZhciBkZXNjID0gbmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbihvZmZlcik7XG5cbiAgICAgICAgLy8gSWYgdGhlIGNvbm5lY3Rpb24gaXNuJ3Qgc3RhYmxlIHlldCwgd2FpdCBmb3IgaXQuLi5cblxuICAgICAgICBpZiAodGhpcy5ydGNQZWVyLnNpZ25hbGluZ1N0YXRlICE9IFwic3RhYmxlXCIpIHtcbiAgICAgICAgICAgIGxvZyhcIiAgLSBCdXQgdGhlIHNpZ25hbGluZyBzdGF0ZSBpc24ndCBzdGFibGUsIHNvIHRyaWdnZXJpbmcgcm9sbGJhY2tcIik7XG5cbiAgICAgICAgICAgIC8vIFNldCB0aGUgbG9jYWwgYW5kIHJlbW92ZSBkZXNjcmlwdGlvbnMgZm9yIHJvbGxiYWNrOyBkb24ndCBwcm9jZWVkXG4gICAgICAgICAgICAvLyB1bnRpbCBib3RoIHJldHVybi5cbiAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgICAgICB0aGlzLnJ0Y1BlZXIuc2V0TG9jYWxEZXNjcmlwdGlvbih7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwicm9sbGJhY2tcIlxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHRoaXMucnRjUGVlci5zZXRSZW1vdGVEZXNjcmlwdGlvbihkZXNjKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2coXCIgIC0gU2V0dGluZyByZW1vdGUgZGVzY3JpcHRpb25cIik7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnJ0Y1BlZXIuc2V0UmVtb3RlRGVzY3JpcHRpb24oZGVzYyk7XG5cbiAgICAgICAgICAgIGxldCBhbnN3ZXIgPSBhd2FpdCB0aGlzLnJ0Y1BlZXIuY3JlYXRlQW5zd2VyKHRoaXMuY29uc3RyYWludHMpO1xuICAgICAgICAgICAgdGhpcy5ydGNQZWVyLnNldExvY2FsRGVzY3JpcHRpb24oYW5zd2VyKTtcblxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKFwiYW5zd2VyUmVhZHlcIiwgdGhpcy5ydGNQZWVyLmxvY2FsRGVzY3JpcHRpb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0QW5zd2VyKGFuc3dlcikge1xuICAgICAgICB2YXIgZGVzYyA9IG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oYW5zd2VyKTtcbiAgICAgICAgdGhpcy5ydGNQZWVyLnNldFJlbW90ZURlc2NyaXB0aW9uKGRlc2MpLnRoZW4oXyA9PiB7XG4gICAgICAgICAgICBsb2coXCJNYXN0ZXIgUmVtb3RlIERlc2NyaXB0aW9uIGlzIHNldFwiKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2V0UmVtb3RlQ2FuZGlkYXRlKGNhbmRpZGF0ZSkge1xuICAgICAgICBpZiAodGhpcy5ydGNQZWVyLnJlbW90ZURlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICB2YXIgY2FuZGlkYXRlID0gbmV3IFJUQ0ljZUNhbmRpZGF0ZShjYW5kaWRhdGUpO1xuICAgICAgICAgICAgbG9nKFwiQWRkaW5nIHJlY2VpdmVkIElDRSBjYW5kaWRhdGVcIik7XG4gICAgICAgICAgICB0aGlzLnJ0Y1BlZXIuYWRkSWNlQ2FuZGlkYXRlKGNhbmRpZGF0ZSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vbmljZWNhbmRpZGF0ZShldmVudCkge1xuICAgICAgICBsb2coXCJpY2UgY2FuZGlkYXRlIGhhbmRsaW5nXCIpO1xuICAgICAgICBpZiAoZXZlbnQuY2FuZGlkYXRlKSB7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoXCJjYW5kaWRhdGVSZWFkeVwiLCBldmVudC5jYW5kaWRhdGUpO1xuICAgICAgICB9XG4gICAgfVxufSIsImltcG9ydCB7IGdldEF1ZGlvU3RyZWFtIH0gZnJvbSAnLi9wZWVyJztcbmltcG9ydCBBdWRpb1BsYXllciBmcm9tICcuL2F1ZGlvLXBsYXllcic7XG5pbXBvcnQgUlRDX0Nvbm5uZWN0b3IgZnJvbSAnLi9ydGMnO1xuaW1wb3J0IENvbm5lY3Rpb25NYW5hZ2VyIGZyb20gJy4vY29ubmVjdGlvbi1tYW5hZ2VyJztcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gJy4uL3V0aWxzJztcblxudmFyIGF1ZGlvU3RyZWFtLCBwZWVyLCBwYXJ0eU1lbWJlcnMgPSB7fTtcblxuY29uc3Qgc2VydmVycyA9IHtcbiAgICB1cmxzOiBcInN0dW46c3R1bjEubC5nb29nbGUuY29tOjE5MzAyXCJcbn1cblxuY29uc3QgdHVyblNlcnZlciA9IHtcbiAgICB1cmxzOiAndHVybjoxOTIuMTU4LjI5LjM5OjM0Nzg/dHJhbnNwb3J0PXVkcCcsXG4gICAgY3JlZGVudGlhbDogJ0paRU9FdDJWM1FiMHkyN0dSbnR0MnUyUEFZQT0nLFxuICAgIHVzZXJuYW1lOiAnMjgyMjQ1MTE6MTM3OTMzMDgwOCdcbn1cblxuY29uc3QgaWNlU2VydmVycyA9IFtzZXJ2ZXJzLCB0dXJuU2VydmVyXTtcblxuXG52YXIgd2VicnRjID0ge1xuICAgIFwib2ZmZXJcIjogZnVuY3Rpb24gb2ZmZXIoY29ubmVjdGlvbiwgZGF0YSkge1xuICAgICAgICBwZWVyID0gbmV3IFJUQ19Db25ubmVjdG9yKGljZVNlcnZlcnMpO1xuICAgICAgICB2YXIgbWVtYmVySWQgPSBkYXRhLm1lbWJlcklkO1xuICAgICAgICB2YXIgY29ubmVjdGlvbiA9IENvbm5lY3Rpb25NYW5hZ2VyLmdldENvbm5lY3Rpb24oKTtcbiAgICAgICAgcGVlci5vbignYW5zd2VyUmVhZHknLCBmdW5jdGlvbiAoYW5zd2VyKSB7XG4gICAgICAgICAgICBjb25uZWN0aW9uLndlYnJ0Yyh7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJhbnN3ZXJcIixcbiAgICAgICAgICAgICAgICBkYXRhOiB7IGFuc3dlciwgbWVtYmVySWQgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBwZWVyLm9uKCdjYW5kaWRhdGVSZWFkeScsIGZ1bmN0aW9uIChjYW5kaWRhdGUpIHtcbiAgICAgICAgICAgIGNvbm5lY3Rpb24ud2VicnRjKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcImNhbmRpZGF0ZVwiLFxuICAgICAgICAgICAgICAgIGRhdGE6IHsgY2FuZGlkYXRlLCBtZW1iZXJJZCB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHBlZXIub24oXCJzdHJlYW1SZWFkeVwiLCBmdW5jdGlvbiAoeyBzdHJlYW1zOiBbc3RyZWFtXSB9KSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInN0cmVhbVJlYWR5XCIpO1xuICAgICAgICAgICAgQXVkaW9QbGF5ZXIuc2V0U3RyZWFtKHN0cmVhbSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzdHJlYW0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBBdWRpb1BsYXllci5wbGF5KCk7XG4gICAgICAgIH0pXG4gICAgICAgIHBlZXIuYWNjZXB0T2ZmZXIoZGF0YS5vZmZlcik7XG4gICAgfSxcblxuICAgIFwiYW5zd2VyXCI6IGZ1bmN0aW9uIGFuc3dlcihjb25uZWN0aW9uLCBkYXRhKSB7XG4gICAgICAgIHZhciBtZW1iZXJJZCA9IGRhdGEubWVtYmVySWQ7XG4gICAgICAgIHZhciBjbGllbnRQZWVyID0gcGFydHlNZW1iZXJzW21lbWJlcklkXTtcbiAgICAgICAgY2xpZW50UGVlci5zZXRBbnN3ZXIoZGF0YS5hbnN3ZXIpO1xuICAgIH0sXG5cbiAgICBcImNhbmRpZGF0ZVwiOiBmdW5jdGlvbiBjYW5kaWRhdGUoY29ubmVjdGlvbiwgZGF0YSkge1xuICAgICAgICBsZXQgbWVtYmVySWQgPSBkYXRhLm1lbWJlcklkO1xuICAgICAgICBsZXQgY2xpZW50UGVlciA9IHBhcnR5TWVtYmVyc1ttZW1iZXJJZF0gfHwgcGVlcjtcbiAgICAgICAgY2xpZW50UGVlci5zZXRSZW1vdGVDYW5kaWRhdGUoZGF0YS5jYW5kaWRhdGUpO1xuICAgIH1cbn1cblxudmFyIHJlc3BvbnNlID0ge1xuICAgIFwicGFydHktY3JlYXRpb24tc3VjY2Vzc1wiOiBmdW5jdGlvbiAoY29ubmVjdGlvbiwgZGF0YSkge1xuICAgICAgICB2YXIgcG9wdXAgPSB1dGlscy5nZXRQb3B1cCgpO1xuICAgICAgICBwb3B1cC5hcHAuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcm91dGU6IFwicGFydHlcIlxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIFwiam9pbi1wYXJ0eS1zdWNjZXNzXCI6IGZ1bmN0aW9uIChjb25uZWN0aW9uLCBkYXRhKSB7XG4gICAgICAgIHZhciBwb3B1cCA9IHV0aWxzLmdldFBvcHVwKCk7XG4gICAgICAgIHBvcHVwLmFwcC5zZXRTdGF0ZSh7XG4gICAgICAgICAgICByb3V0ZTogXCJwYXJ0eVwiXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgXCJkai1hY2NlcHRcIjogZnVuY3Rpb24gKCkge1xuICAgICAgICBhdWRpb1N0cmVhbSA9IGdldEF1ZGlvU3RyZWFtKCk7XG4gICAgfVxufVxuXG52YXIgbm90aWZpY2F0aW9uID0ge1xuICAgIFwiam9pbi1wYXJ0eVwiOiBhc3luYyBmdW5jdGlvbiAoY29ubmVjdGlvbiwgZGF0YSkge1xuICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICAgICAgdmFyIGNvbm5lY3Rpb24gPSBDb25uZWN0aW9uTWFuYWdlci5nZXRDb25uZWN0aW9uKCk7XG4gICAgICAgIHZhciBjbGllbnRJZHMgPSBkYXRhLm1lbWJlcklkcztcbiAgICAgICAgdmFyIHN0cmVhbU9iaiA9IGF3YWl0IGF1ZGlvU3RyZWFtO1xuICAgICAgICBjbGllbnRJZHMuZm9yRWFjaCgobWVtYmVySWQpID0+IHtcbiAgICAgICAgICAgIHZhciBjbGllbnRQZWVyID0gbmV3IFJUQ19Db25ubmVjdG9yKGljZVNlcnZlcnMsIHN0cmVhbU9iaik7XG4gICAgICAgICAgICBwYXJ0eU1lbWJlcnNbbWVtYmVySWRdID0gY2xpZW50UGVlcjtcbiAgICAgICAgICAgIGNsaWVudFBlZXIub24oJ29mZmVyUmVhZHknLCBmdW5jdGlvbiAob2ZmZXIpIHtcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uLndlYnJ0Yyh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwib2ZmZXJcIixcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogeyBvZmZlciwgbWVtYmVySWQgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjbGllbnRQZWVyLm9uKCdjYW5kaWRhdGVSZWFkeScsIGZ1bmN0aW9uIChjYW5kaWRhdGUpIHtcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uLndlYnJ0Yyh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiY2FuZGlkYXRlXCIsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHsgY2FuZGlkYXRlLCBtZW1iZXJJZCB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICByZXNwb25zZSxcbiAgICBub3RpZmljYXRpb24sXG4gICAgd2VicnRjXG59XG4iLCJleHBvcnQgY29uc3QgcGlwZSA9ICguLi5mbnMpID0+IHggPT4gZm5zLnJlZHVjZSgoeSwgZikgPT4gZih5KSwgeCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXNzYWdlUGFyc2VyKG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShtZXNzYWdlLmRhdGEpO1xufVxuXG52YXIgY291bnQgPSAwO1xuZXhwb3J0IGZ1bmN0aW9uIHVpZChzdWZmaXgpIHtcbiAgICByZXR1cm4gYCR7Y291bnR9XyR7c3VmZml4fWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0V4dGVuc2lvbigpIHtcbiAgICByZXR1cm4gbG9jYXRpb24ucHJvdG9jb2wuaW5jbHVkZXMoXCJjaHJvbWUtZXh0ZW5zaW9uXCIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QmFja2dyb3VuZCgpIHtcbiAgICBpZiAoaXNFeHRlbnNpb24oKSkge1xuICAgICAgICByZXR1cm4gY2hyb21lLmV4dGVuc2lvbi5nZXRCYWNrZ3JvdW5kUGFnZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB3aW5kb3c7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UG9wdXAoKSB7XG4gICAgaWYgKGlzRXh0ZW5zaW9uKCkpIHtcbiAgICAgICAgcmV0dXJuIGNocm9tZS5leHRlbnNpb24uZ2V0Vmlld3MoeyB0eXBlOiBcInBvcHVwXCIgfSlbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdztcbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRVc2VyUHJvZmlsZSgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBpZiAoaXNFeHRlbnNpb24oKSkge1xuICAgICAgICAgICAgY2hyb21lLmlkZW50aXR5LmdldFByb2ZpbGVVc2VySW5mbyhyZXNvbHZlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS51c2VyUHJvZmlsZVxuICAgICAgICAgICAgICAgID8gcmVzb2x2ZShKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS51c2VyUHJvZmlsZSkpXG4gICAgICAgICAgICAgICAgOiByZXNvbHZlKHt9KTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5cbiIsImZ1bmN0aW9uIF9hcnJheUxpa2VUb0FycmF5KGFyciwgbGVuKSB7XG4gIGlmIChsZW4gPT0gbnVsbCB8fCBsZW4gPiBhcnIubGVuZ3RoKSBsZW4gPSBhcnIubGVuZ3RoO1xuXG4gIGZvciAodmFyIGkgPSAwLCBhcnIyID0gbmV3IEFycmF5KGxlbik7IGkgPCBsZW47IGkrKykge1xuICAgIGFycjJbaV0gPSBhcnJbaV07XG4gIH1cblxuICByZXR1cm4gYXJyMjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfYXJyYXlMaWtlVG9BcnJheTsiLCJmdW5jdGlvbiBfYXJyYXlXaXRoSG9sZXMoYXJyKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGFycikpIHJldHVybiBhcnI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2FycmF5V2l0aEhvbGVzOyIsImZ1bmN0aW9uIGFzeW5jR2VuZXJhdG9yU3RlcChnZW4sIHJlc29sdmUsIHJlamVjdCwgX25leHQsIF90aHJvdywga2V5LCBhcmcpIHtcbiAgdHJ5IHtcbiAgICB2YXIgaW5mbyA9IGdlbltrZXldKGFyZyk7XG4gICAgdmFyIHZhbHVlID0gaW5mby52YWx1ZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZWplY3QoZXJyb3IpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChpbmZvLmRvbmUpIHtcbiAgICByZXNvbHZlKHZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICBQcm9taXNlLnJlc29sdmUodmFsdWUpLnRoZW4oX25leHQsIF90aHJvdyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2FzeW5jVG9HZW5lcmF0b3IoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciBnZW4gPSBmbi5hcHBseShzZWxmLCBhcmdzKTtcblxuICAgICAgZnVuY3Rpb24gX25leHQodmFsdWUpIHtcbiAgICAgICAgYXN5bmNHZW5lcmF0b3JTdGVwKGdlbiwgcmVzb2x2ZSwgcmVqZWN0LCBfbmV4dCwgX3Rocm93LCBcIm5leHRcIiwgdmFsdWUpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBfdGhyb3coZXJyKSB7XG4gICAgICAgIGFzeW5jR2VuZXJhdG9yU3RlcChnZW4sIHJlc29sdmUsIHJlamVjdCwgX25leHQsIF90aHJvdywgXCJ0aHJvd1wiLCBlcnIpO1xuICAgICAgfVxuXG4gICAgICBfbmV4dCh1bmRlZmluZWQpO1xuICAgIH0pO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9hc3luY1RvR2VuZXJhdG9yOyIsImZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2NsYXNzQ2FsbENoZWNrOyIsImZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlO1xuICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfY3JlYXRlQ2xhc3MoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gIGlmIChwcm90b1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICBpZiAoc3RhdGljUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gIHJldHVybiBDb25zdHJ1Y3Rvcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfY3JlYXRlQ2xhc3M7IiwiZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHtcbiAgICBcImRlZmF1bHRcIjogb2JqXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdDsiLCJ2YXIgX3R5cGVvZiA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL3R5cGVvZlwiKTtcblxuZnVuY3Rpb24gX2dldFJlcXVpcmVXaWxkY2FyZENhY2hlKCkge1xuICBpZiAodHlwZW9mIFdlYWtNYXAgIT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIG51bGw7XG4gIHZhciBjYWNoZSA9IG5ldyBXZWFrTWFwKCk7XG5cbiAgX2dldFJlcXVpcmVXaWxkY2FyZENhY2hlID0gZnVuY3Rpb24gX2dldFJlcXVpcmVXaWxkY2FyZENhY2hlKCkge1xuICAgIHJldHVybiBjYWNoZTtcbiAgfTtcblxuICByZXR1cm4gY2FjaGU7XG59XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKG9iaikge1xuICBpZiAob2JqICYmIG9iai5fX2VzTW9kdWxlKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIGlmIChvYmogPT09IG51bGwgfHwgX3R5cGVvZihvYmopICE9PSBcIm9iamVjdFwiICYmIHR5cGVvZiBvYmogIT09IFwiZnVuY3Rpb25cIikge1xuICAgIHJldHVybiB7XG4gICAgICBcImRlZmF1bHRcIjogb2JqXG4gICAgfTtcbiAgfVxuXG4gIHZhciBjYWNoZSA9IF9nZXRSZXF1aXJlV2lsZGNhcmRDYWNoZSgpO1xuXG4gIGlmIChjYWNoZSAmJiBjYWNoZS5oYXMob2JqKSkge1xuICAgIHJldHVybiBjYWNoZS5nZXQob2JqKTtcbiAgfVxuXG4gIHZhciBuZXdPYmogPSB7fTtcbiAgdmFyIGhhc1Byb3BlcnR5RGVzY3JpcHRvciA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSAmJiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuXG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgdmFyIGRlc2MgPSBoYXNQcm9wZXJ0eURlc2NyaXB0b3IgPyBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwga2V5KSA6IG51bGw7XG5cbiAgICAgIGlmIChkZXNjICYmIChkZXNjLmdldCB8fCBkZXNjLnNldCkpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG5ld09iaiwga2V5LCBkZXNjKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld09ialtrZXldID0gb2JqW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbmV3T2JqW1wiZGVmYXVsdFwiXSA9IG9iajtcblxuICBpZiAoY2FjaGUpIHtcbiAgICBjYWNoZS5zZXQob2JqLCBuZXdPYmopO1xuICB9XG5cbiAgcmV0dXJuIG5ld09iajtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZDsiLCJmdW5jdGlvbiBfaXRlcmFibGVUb0FycmF5TGltaXQoYXJyLCBpKSB7XG4gIGlmICh0eXBlb2YgU3ltYm9sID09PSBcInVuZGVmaW5lZFwiIHx8ICEoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChhcnIpKSkgcmV0dXJuO1xuICB2YXIgX2FyciA9IFtdO1xuICB2YXIgX24gPSB0cnVlO1xuICB2YXIgX2QgPSBmYWxzZTtcbiAgdmFyIF9lID0gdW5kZWZpbmVkO1xuXG4gIHRyeSB7XG4gICAgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkge1xuICAgICAgX2Fyci5wdXNoKF9zLnZhbHVlKTtcblxuICAgICAgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgX2QgPSB0cnVlO1xuICAgIF9lID0gZXJyO1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdICE9IG51bGwpIF9pW1wicmV0dXJuXCJdKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChfZCkgdGhyb3cgX2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIF9hcnI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2l0ZXJhYmxlVG9BcnJheUxpbWl0OyIsImZ1bmN0aW9uIF9ub25JdGVyYWJsZVJlc3QoKSB7XG4gIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX25vbkl0ZXJhYmxlUmVzdDsiLCJ2YXIgYXJyYXlXaXRoSG9sZXMgPSByZXF1aXJlKFwiLi9hcnJheVdpdGhIb2xlc1wiKTtcblxudmFyIGl0ZXJhYmxlVG9BcnJheUxpbWl0ID0gcmVxdWlyZShcIi4vaXRlcmFibGVUb0FycmF5TGltaXRcIik7XG5cbnZhciB1bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheSA9IHJlcXVpcmUoXCIuL3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5XCIpO1xuXG52YXIgbm9uSXRlcmFibGVSZXN0ID0gcmVxdWlyZShcIi4vbm9uSXRlcmFibGVSZXN0XCIpO1xuXG5mdW5jdGlvbiBfc2xpY2VkVG9BcnJheShhcnIsIGkpIHtcbiAgcmV0dXJuIGFycmF5V2l0aEhvbGVzKGFycikgfHwgaXRlcmFibGVUb0FycmF5TGltaXQoYXJyLCBpKSB8fCB1bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShhcnIsIGkpIHx8IG5vbkl0ZXJhYmxlUmVzdCgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9zbGljZWRUb0FycmF5OyIsImZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gIFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjtcblxuICBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvYmo7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBfdHlwZW9mKG9iaik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3R5cGVvZjsiLCJ2YXIgYXJyYXlMaWtlVG9BcnJheSA9IHJlcXVpcmUoXCIuL2FycmF5TGlrZVRvQXJyYXlcIik7XG5cbmZ1bmN0aW9uIF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShvLCBtaW5MZW4pIHtcbiAgaWYgKCFvKSByZXR1cm47XG4gIGlmICh0eXBlb2YgbyA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIGFycmF5TGlrZVRvQXJyYXkobywgbWluTGVuKTtcbiAgdmFyIG4gPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykuc2xpY2UoOCwgLTEpO1xuICBpZiAobiA9PT0gXCJPYmplY3RcIiAmJiBvLmNvbnN0cnVjdG9yKSBuID0gby5jb25zdHJ1Y3Rvci5uYW1lO1xuICBpZiAobiA9PT0gXCJNYXBcIiB8fCBuID09PSBcIlNldFwiKSByZXR1cm4gQXJyYXkuZnJvbShvKTtcbiAgaWYgKG4gPT09IFwiQXJndW1lbnRzXCIgfHwgL14oPzpVaXxJKW50KD86OHwxNnwzMikoPzpDbGFtcGVkKT9BcnJheSQvLnRlc3QobikpIHJldHVybiBhcnJheUxpa2VUb0FycmF5KG8sIG1pbkxlbik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5OyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInJlZ2VuZXJhdG9yLXJ1bnRpbWVcIik7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIG9iamVjdENyZWF0ZSA9IE9iamVjdC5jcmVhdGUgfHwgb2JqZWN0Q3JlYXRlUG9seWZpbGxcbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgb2JqZWN0S2V5c1BvbHlmaWxsXG52YXIgYmluZCA9IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kIHx8IGZ1bmN0aW9uQmluZFBvbHlmaWxsXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCAnX2V2ZW50cycpKSB7XG4gICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgfVxuXG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbnZhciBkZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbnZhciBoYXNEZWZpbmVQcm9wZXJ0eTtcbnRyeSB7XG4gIHZhciBvID0ge307XG4gIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCAneCcsIHsgdmFsdWU6IDAgfSk7XG4gIGhhc0RlZmluZVByb3BlcnR5ID0gby54ID09PSAwO1xufSBjYXRjaCAoZXJyKSB7IGhhc0RlZmluZVByb3BlcnR5ID0gZmFsc2UgfVxuaWYgKGhhc0RlZmluZVByb3BlcnR5KSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFdmVudEVtaXR0ZXIsICdkZWZhdWx0TWF4TGlzdGVuZXJzJywge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBkZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbihhcmcpIHtcbiAgICAgIC8vIGNoZWNrIHdoZXRoZXIgdGhlIGlucHV0IGlzIGEgcG9zaXRpdmUgbnVtYmVyICh3aG9zZSB2YWx1ZSBpcyB6ZXJvIG9yXG4gICAgICAvLyBncmVhdGVyIGFuZCBub3QgYSBOYU4pLlxuICAgICAgaWYgKHR5cGVvZiBhcmcgIT09ICdudW1iZXInIHx8IGFyZyA8IDAgfHwgYXJnICE9PSBhcmcpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiZGVmYXVsdE1heExpc3RlbmVyc1wiIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgICAgIGRlZmF1bHRNYXhMaXN0ZW5lcnMgPSBhcmc7XG4gICAgfVxuICB9KTtcbn0gZWxzZSB7XG4gIEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gZGVmYXVsdE1heExpc3RlbmVycztcbn1cblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKG4pIHtcbiAgaWYgKHR5cGVvZiBuICE9PSAnbnVtYmVyJyB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcIm5cIiBhcmd1bWVudCBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gJGdldE1heExpc3RlbmVycyh0aGF0KSB7XG4gIGlmICh0aGF0Ll9tYXhMaXN0ZW5lcnMgPT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gIHJldHVybiB0aGF0Ll9tYXhMaXN0ZW5lcnM7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZ2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gZ2V0TWF4TGlzdGVuZXJzKCkge1xuICByZXR1cm4gJGdldE1heExpc3RlbmVycyh0aGlzKTtcbn07XG5cbi8vIFRoZXNlIHN0YW5kYWxvbmUgZW1pdCogZnVuY3Rpb25zIGFyZSB1c2VkIHRvIG9wdGltaXplIGNhbGxpbmcgb2YgZXZlbnRcbi8vIGhhbmRsZXJzIGZvciBmYXN0IGNhc2VzIGJlY2F1c2UgZW1pdCgpIGl0c2VsZiBvZnRlbiBoYXMgYSB2YXJpYWJsZSBudW1iZXIgb2Zcbi8vIGFyZ3VtZW50cyBhbmQgY2FuIGJlIGRlb3B0aW1pemVkIGJlY2F1c2Ugb2YgdGhhdC4gVGhlc2UgZnVuY3Rpb25zIGFsd2F5cyBoYXZlXG4vLyB0aGUgc2FtZSBudW1iZXIgb2YgYXJndW1lbnRzIGFuZCB0aHVzIGRvIG5vdCBnZXQgZGVvcHRpbWl6ZWQsIHNvIHRoZSBjb2RlXG4vLyBpbnNpZGUgdGhlbSBjYW4gZXhlY3V0ZSBmYXN0ZXIuXG5mdW5jdGlvbiBlbWl0Tm9uZShoYW5kbGVyLCBpc0ZuLCBzZWxmKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuY2FsbChzZWxmKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5jYWxsKHNlbGYpO1xuICB9XG59XG5mdW5jdGlvbiBlbWl0T25lKGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZzEpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5jYWxsKHNlbGYsIGFyZzEpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmNhbGwoc2VsZiwgYXJnMSk7XG4gIH1cbn1cbmZ1bmN0aW9uIGVtaXRUd28oaGFuZGxlciwgaXNGbiwgc2VsZiwgYXJnMSwgYXJnMikge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmNhbGwoc2VsZiwgYXJnMSwgYXJnMik7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uY2FsbChzZWxmLCBhcmcxLCBhcmcyKTtcbiAgfVxufVxuZnVuY3Rpb24gZW1pdFRocmVlKGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZzEsIGFyZzIsIGFyZzMpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5jYWxsKHNlbGYsIGFyZzEsIGFyZzIsIGFyZzMpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmNhbGwoc2VsZiwgYXJnMSwgYXJnMiwgYXJnMyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZW1pdE1hbnkoaGFuZGxlciwgaXNGbiwgc2VsZiwgYXJncykge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICB9XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQodHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgZXZlbnRzO1xuICB2YXIgZG9FcnJvciA9ICh0eXBlID09PSAnZXJyb3InKTtcblxuICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gIGlmIChldmVudHMpXG4gICAgZG9FcnJvciA9IChkb0Vycm9yICYmIGV2ZW50cy5lcnJvciA9PSBudWxsKTtcbiAgZWxzZSBpZiAoIWRvRXJyb3IpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKGRvRXJyb3IpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpXG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEF0IGxlYXN0IGdpdmUgc29tZSBraW5kIG9mIGNvbnRleHQgdG8gdGhlIHVzZXJcbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1VuaGFuZGxlZCBcImVycm9yXCIgZXZlbnQuICgnICsgZXIgKyAnKScpO1xuICAgICAgZXJyLmNvbnRleHQgPSBlcjtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaGFuZGxlciA9IGV2ZW50c1t0eXBlXTtcblxuICBpZiAoIWhhbmRsZXIpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBpc0ZuID0gdHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbic7XG4gIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gIHN3aXRjaCAobGVuKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgY2FzZSAxOlxuICAgICAgZW1pdE5vbmUoaGFuZGxlciwgaXNGbiwgdGhpcyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDI6XG4gICAgICBlbWl0T25lKGhhbmRsZXIsIGlzRm4sIHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDM6XG4gICAgICBlbWl0VHdvKGhhbmRsZXIsIGlzRm4sIHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgNDpcbiAgICAgIGVtaXRUaHJlZShoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSwgYXJndW1lbnRzWzNdKTtcbiAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgZGVmYXVsdDpcbiAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgZW1pdE1hbnkoaGFuZGxlciwgaXNGbiwgdGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbmZ1bmN0aW9uIF9hZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBwcmVwZW5kKSB7XG4gIHZhciBtO1xuICB2YXIgZXZlbnRzO1xuICB2YXIgZXhpc3Rpbmc7XG5cbiAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJylcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG4gIGlmICghZXZlbnRzKSB7XG4gICAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgdGFyZ2V0Ll9ldmVudHNDb3VudCA9IDA7XG4gIH0gZWxzZSB7XG4gICAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gICAgaWYgKGV2ZW50cy5uZXdMaXN0ZW5lcikge1xuICAgICAgdGFyZ2V0LmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA/IGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gICAgICAvLyBSZS1hc3NpZ24gYGV2ZW50c2AgYmVjYXVzZSBhIG5ld0xpc3RlbmVyIGhhbmRsZXIgY291bGQgaGF2ZSBjYXVzZWQgdGhlXG4gICAgICAvLyB0aGlzLl9ldmVudHMgdG8gYmUgYXNzaWduZWQgdG8gYSBuZXcgb2JqZWN0XG4gICAgICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcbiAgICB9XG4gICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV07XG4gIH1cblxuICBpZiAoIWV4aXN0aW5nKSB7XG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgICArK3RhcmdldC5fZXZlbnRzQ291bnQ7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGVvZiBleGlzdGluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXSA9XG4gICAgICAgICAgcHJlcGVuZCA/IFtsaXN0ZW5lciwgZXhpc3RpbmddIDogW2V4aXN0aW5nLCBsaXN0ZW5lcl07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICAgIGlmIChwcmVwZW5kKSB7XG4gICAgICAgIGV4aXN0aW5nLnVuc2hpZnQobGlzdGVuZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXhpc3RpbmcucHVzaChsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgICBpZiAoIWV4aXN0aW5nLndhcm5lZCkge1xuICAgICAgbSA9ICRnZXRNYXhMaXN0ZW5lcnModGFyZ2V0KTtcbiAgICAgIGlmIChtICYmIG0gPiAwICYmIGV4aXN0aW5nLmxlbmd0aCA+IG0pIHtcbiAgICAgICAgZXhpc3Rpbmcud2FybmVkID0gdHJ1ZTtcbiAgICAgICAgdmFyIHcgPSBuZXcgRXJyb3IoJ1Bvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgbGVhayBkZXRlY3RlZC4gJyArXG4gICAgICAgICAgICBleGlzdGluZy5sZW5ndGggKyAnIFwiJyArIFN0cmluZyh0eXBlKSArICdcIiBsaXN0ZW5lcnMgJyArXG4gICAgICAgICAgICAnYWRkZWQuIFVzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvICcgK1xuICAgICAgICAgICAgJ2luY3JlYXNlIGxpbWl0LicpO1xuICAgICAgICB3Lm5hbWUgPSAnTWF4TGlzdGVuZXJzRXhjZWVkZWRXYXJuaW5nJztcbiAgICAgICAgdy5lbWl0dGVyID0gdGFyZ2V0O1xuICAgICAgICB3LnR5cGUgPSB0eXBlO1xuICAgICAgICB3LmNvdW50ID0gZXhpc3RpbmcubGVuZ3RoO1xuICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgPT09ICdvYmplY3QnICYmIGNvbnNvbGUud2Fybikge1xuICAgICAgICAgIGNvbnNvbGUud2FybignJXM6ICVzJywgdy5uYW1lLCB3Lm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uIGFkZExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHJldHVybiBfYWRkTGlzdGVuZXIodGhpcywgdHlwZSwgbGlzdGVuZXIsIGZhbHNlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnByZXBlbmRMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcHJlcGVuZExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICByZXR1cm4gX2FkZExpc3RlbmVyKHRoaXMsIHR5cGUsIGxpc3RlbmVyLCB0cnVlKTtcbiAgICB9O1xuXG5mdW5jdGlvbiBvbmNlV3JhcHBlcigpIHtcbiAgaWYgKCF0aGlzLmZpcmVkKSB7XG4gICAgdGhpcy50YXJnZXQucmVtb3ZlTGlzdGVuZXIodGhpcy50eXBlLCB0aGlzLndyYXBGbik7XG4gICAgdGhpcy5maXJlZCA9IHRydWU7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQpO1xuICAgICAgY2FzZSAxOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0LCBhcmd1bWVudHNbMF0pO1xuICAgICAgY2FzZSAyOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0LCBhcmd1bWVudHNbMF0sIGFyZ3VtZW50c1sxXSk7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQsIGFyZ3VtZW50c1swXSwgYXJndW1lbnRzWzFdLFxuICAgICAgICAgICAgYXJndW1lbnRzWzJdKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyArK2kpXG4gICAgICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgdGhpcy5saXN0ZW5lci5hcHBseSh0aGlzLnRhcmdldCwgYXJncyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIF9vbmNlV3JhcCh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBzdGF0ZSA9IHsgZmlyZWQ6IGZhbHNlLCB3cmFwRm46IHVuZGVmaW5lZCwgdGFyZ2V0OiB0YXJnZXQsIHR5cGU6IHR5cGUsIGxpc3RlbmVyOiBsaXN0ZW5lciB9O1xuICB2YXIgd3JhcHBlZCA9IGJpbmQuY2FsbChvbmNlV3JhcHBlciwgc3RhdGUpO1xuICB3cmFwcGVkLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHN0YXRlLndyYXBGbiA9IHdyYXBwZWQ7XG4gIHJldHVybiB3cmFwcGVkO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICB0aGlzLm9uKHR5cGUsIF9vbmNlV3JhcCh0aGlzLCB0eXBlLCBsaXN0ZW5lcikpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucHJlcGVuZE9uY2VMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcHJlcGVuZE9uY2VMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgICAgdGhpcy5wcmVwZW5kTGlzdGVuZXIodHlwZSwgX29uY2VXcmFwKHRoaXMsIHR5cGUsIGxpc3RlbmVyKSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4vLyBFbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWYgYW5kIG9ubHkgaWYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIHZhciBsaXN0LCBldmVudHMsIHBvc2l0aW9uLCBpLCBvcmlnaW5hbExpc3RlbmVyO1xuXG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgICAgIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgICAgIGlmICghZXZlbnRzKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgbGlzdCA9IGV2ZW50c1t0eXBlXTtcbiAgICAgIGlmICghbGlzdClcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fCBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikge1xuICAgICAgICBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMClcbiAgICAgICAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSBldmVudHNbdHlwZV07XG4gICAgICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0Lmxpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbGlzdCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwb3NpdGlvbiA9IC0xO1xuXG4gICAgICAgIGZvciAoaSA9IGxpc3QubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHwgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIG9yaWdpbmFsTGlzdGVuZXIgPSBsaXN0W2ldLmxpc3RlbmVyO1xuICAgICAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgICBpZiAocG9zaXRpb24gPT09IDApXG4gICAgICAgICAgbGlzdC5zaGlmdCgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgc3BsaWNlT25lKGxpc3QsIHBvc2l0aW9uKTtcblxuICAgICAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpXG4gICAgICAgICAgZXZlbnRzW3R5cGVdID0gbGlzdFswXTtcblxuICAgICAgICBpZiAoZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBvcmlnaW5hbExpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxuICAgIGZ1bmN0aW9uIHJlbW92ZUFsbExpc3RlbmVycyh0eXBlKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzLCBldmVudHMsIGk7XG5cbiAgICAgIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgICAgIGlmICghZXZlbnRzKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICAgICAgaWYgKCFldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50c1t0eXBlXSkge1xuICAgICAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKVxuICAgICAgICAgICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRlbGV0ZSBldmVudHNbdHlwZV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdmFyIGtleXMgPSBvYmplY3RLZXlzKGV2ZW50cyk7XG4gICAgICAgIHZhciBrZXk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgICAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIGxpc3RlbmVycyA9IGV2ZW50c1t0eXBlXTtcblxuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lcnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICAgICAgfSBlbHNlIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgICAgLy8gTElGTyBvcmRlclxuICAgICAgICBmb3IgKGkgPSBsaXN0ZW5lcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuZnVuY3Rpb24gX2xpc3RlbmVycyh0YXJnZXQsIHR5cGUsIHVud3JhcCkge1xuICB2YXIgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG5cbiAgaWYgKCFldmVudHMpXG4gICAgcmV0dXJuIFtdO1xuXG4gIHZhciBldmxpc3RlbmVyID0gZXZlbnRzW3R5cGVdO1xuICBpZiAoIWV2bGlzdGVuZXIpXG4gICAgcmV0dXJuIFtdO1xuXG4gIGlmICh0eXBlb2YgZXZsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJylcbiAgICByZXR1cm4gdW53cmFwID8gW2V2bGlzdGVuZXIubGlzdGVuZXIgfHwgZXZsaXN0ZW5lcl0gOiBbZXZsaXN0ZW5lcl07XG5cbiAgcmV0dXJuIHVud3JhcCA/IHVud3JhcExpc3RlbmVycyhldmxpc3RlbmVyKSA6IGFycmF5Q2xvbmUoZXZsaXN0ZW5lciwgZXZsaXN0ZW5lci5sZW5ndGgpO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyh0eXBlKSB7XG4gIHJldHVybiBfbGlzdGVuZXJzKHRoaXMsIHR5cGUsIHRydWUpO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yYXdMaXN0ZW5lcnMgPSBmdW5jdGlvbiByYXdMaXN0ZW5lcnModHlwZSkge1xuICByZXR1cm4gX2xpc3RlbmVycyh0aGlzLCB0eXBlLCBmYWxzZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgaWYgKHR5cGVvZiBlbWl0dGVyLmxpc3RlbmVyQ291bnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gZW1pdHRlci5saXN0ZW5lckNvdW50KHR5cGUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBsaXN0ZW5lckNvdW50LmNhbGwoZW1pdHRlciwgdHlwZSk7XG4gIH1cbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGxpc3RlbmVyQ291bnQ7XG5mdW5jdGlvbiBsaXN0ZW5lckNvdW50KHR5cGUpIHtcbiAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcblxuICBpZiAoZXZlbnRzKSB7XG4gICAgdmFyIGV2bGlzdGVuZXIgPSBldmVudHNbdHlwZV07XG5cbiAgICBpZiAodHlwZW9mIGV2bGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiAxO1xuICAgIH0gZWxzZSBpZiAoZXZsaXN0ZW5lcikge1xuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiAwO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmV2ZW50TmFtZXMgPSBmdW5jdGlvbiBldmVudE5hbWVzKCkge1xuICByZXR1cm4gdGhpcy5fZXZlbnRzQ291bnQgPiAwID8gUmVmbGVjdC5vd25LZXlzKHRoaXMuX2V2ZW50cykgOiBbXTtcbn07XG5cbi8vIEFib3V0IDEuNXggZmFzdGVyIHRoYW4gdGhlIHR3by1hcmcgdmVyc2lvbiBvZiBBcnJheSNzcGxpY2UoKS5cbmZ1bmN0aW9uIHNwbGljZU9uZShsaXN0LCBpbmRleCkge1xuICBmb3IgKHZhciBpID0gaW5kZXgsIGsgPSBpICsgMSwgbiA9IGxpc3QubGVuZ3RoOyBrIDwgbjsgaSArPSAxLCBrICs9IDEpXG4gICAgbGlzdFtpXSA9IGxpc3Rba107XG4gIGxpc3QucG9wKCk7XG59XG5cbmZ1bmN0aW9uIGFycmF5Q2xvbmUoYXJyLCBuKSB7XG4gIHZhciBjb3B5ID0gbmV3IEFycmF5KG4pO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG47ICsraSlcbiAgICBjb3B5W2ldID0gYXJyW2ldO1xuICByZXR1cm4gY29weTtcbn1cblxuZnVuY3Rpb24gdW53cmFwTGlzdGVuZXJzKGFycikge1xuICB2YXIgcmV0ID0gbmV3IEFycmF5KGFyci5sZW5ndGgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHJldC5sZW5ndGg7ICsraSkge1xuICAgIHJldFtpXSA9IGFycltpXS5saXN0ZW5lciB8fCBhcnJbaV07XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gb2JqZWN0Q3JlYXRlUG9seWZpbGwocHJvdG8pIHtcbiAgdmFyIEYgPSBmdW5jdGlvbigpIHt9O1xuICBGLnByb3RvdHlwZSA9IHByb3RvO1xuICByZXR1cm4gbmV3IEY7XG59XG5mdW5jdGlvbiBvYmplY3RLZXlzUG9seWZpbGwob2JqKSB7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGsgaW4gb2JqKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgaykpIHtcbiAgICBrZXlzLnB1c2goayk7XG4gIH1cbiAgcmV0dXJuIGs7XG59XG5mdW5jdGlvbiBmdW5jdGlvbkJpbmRQb2x5ZmlsbChjb250ZXh0KSB7XG4gIHZhciBmbiA9IHRoaXM7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZuLmFwcGx5KGNvbnRleHQsIGFyZ3VtZW50cyk7XG4gIH07XG59XG4iLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNC1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbnZhciBydW50aW1lID0gKGZ1bmN0aW9uIChleHBvcnRzKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBPcCA9IE9iamVjdC5wcm90b3R5cGU7XG4gIHZhciBoYXNPd24gPSBPcC5oYXNPd25Qcm9wZXJ0eTtcbiAgdmFyIHVuZGVmaW5lZDsgLy8gTW9yZSBjb21wcmVzc2libGUgdGhhbiB2b2lkIDAuXG4gIHZhciAkU3ltYm9sID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiID8gU3ltYm9sIDoge307XG4gIHZhciBpdGVyYXRvclN5bWJvbCA9ICRTeW1ib2wuaXRlcmF0b3IgfHwgXCJAQGl0ZXJhdG9yXCI7XG4gIHZhciBhc3luY0l0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5hc3luY0l0ZXJhdG9yIHx8IFwiQEBhc3luY0l0ZXJhdG9yXCI7XG4gIHZhciB0b1N0cmluZ1RhZ1N5bWJvbCA9ICRTeW1ib2wudG9TdHJpbmdUYWcgfHwgXCJAQHRvU3RyaW5nVGFnXCI7XG5cbiAgZnVuY3Rpb24gd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkge1xuICAgIC8vIElmIG91dGVyRm4gcHJvdmlkZWQgYW5kIG91dGVyRm4ucHJvdG90eXBlIGlzIGEgR2VuZXJhdG9yLCB0aGVuIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yLlxuICAgIHZhciBwcm90b0dlbmVyYXRvciA9IG91dGVyRm4gJiYgb3V0ZXJGbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBHZW5lcmF0b3IgPyBvdXRlckZuIDogR2VuZXJhdG9yO1xuICAgIHZhciBnZW5lcmF0b3IgPSBPYmplY3QuY3JlYXRlKHByb3RvR2VuZXJhdG9yLnByb3RvdHlwZSk7XG4gICAgdmFyIGNvbnRleHQgPSBuZXcgQ29udGV4dCh0cnlMb2NzTGlzdCB8fCBbXSk7XG5cbiAgICAvLyBUaGUgLl9pbnZva2UgbWV0aG9kIHVuaWZpZXMgdGhlIGltcGxlbWVudGF0aW9ucyBvZiB0aGUgLm5leHQsXG4gICAgLy8gLnRocm93LCBhbmQgLnJldHVybiBtZXRob2RzLlxuICAgIGdlbmVyYXRvci5faW52b2tlID0gbWFrZUludm9rZU1ldGhvZChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcblxuICAgIHJldHVybiBnZW5lcmF0b3I7XG4gIH1cbiAgZXhwb3J0cy53cmFwID0gd3JhcDtcblxuICAvLyBUcnkvY2F0Y2ggaGVscGVyIHRvIG1pbmltaXplIGRlb3B0aW1pemF0aW9ucy4gUmV0dXJucyBhIGNvbXBsZXRpb25cbiAgLy8gcmVjb3JkIGxpa2UgY29udGV4dC50cnlFbnRyaWVzW2ldLmNvbXBsZXRpb24uIFRoaXMgaW50ZXJmYWNlIGNvdWxkXG4gIC8vIGhhdmUgYmVlbiAoYW5kIHdhcyBwcmV2aW91c2x5KSBkZXNpZ25lZCB0byB0YWtlIGEgY2xvc3VyZSB0byBiZVxuICAvLyBpbnZva2VkIHdpdGhvdXQgYXJndW1lbnRzLCBidXQgaW4gYWxsIHRoZSBjYXNlcyB3ZSBjYXJlIGFib3V0IHdlXG4gIC8vIGFscmVhZHkgaGF2ZSBhbiBleGlzdGluZyBtZXRob2Qgd2Ugd2FudCB0byBjYWxsLCBzbyB0aGVyZSdzIG5vIG5lZWRcbiAgLy8gdG8gY3JlYXRlIGEgbmV3IGZ1bmN0aW9uIG9iamVjdC4gV2UgY2FuIGV2ZW4gZ2V0IGF3YXkgd2l0aCBhc3N1bWluZ1xuICAvLyB0aGUgbWV0aG9kIHRha2VzIGV4YWN0bHkgb25lIGFyZ3VtZW50LCBzaW5jZSB0aGF0IGhhcHBlbnMgdG8gYmUgdHJ1ZVxuICAvLyBpbiBldmVyeSBjYXNlLCBzbyB3ZSBkb24ndCBoYXZlIHRvIHRvdWNoIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBUaGVcbiAgLy8gb25seSBhZGRpdGlvbmFsIGFsbG9jYXRpb24gcmVxdWlyZWQgaXMgdGhlIGNvbXBsZXRpb24gcmVjb3JkLCB3aGljaFxuICAvLyBoYXMgYSBzdGFibGUgc2hhcGUgYW5kIHNvIGhvcGVmdWxseSBzaG91bGQgYmUgY2hlYXAgdG8gYWxsb2NhdGUuXG4gIGZ1bmN0aW9uIHRyeUNhdGNoKGZuLCBvYmosIGFyZykge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcIm5vcm1hbFwiLCBhcmc6IGZuLmNhbGwob2JqLCBhcmcpIH07XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcInRocm93XCIsIGFyZzogZXJyIH07XG4gICAgfVxuICB9XG5cbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkU3RhcnQgPSBcInN1c3BlbmRlZFN0YXJ0XCI7XG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkID0gXCJzdXNwZW5kZWRZaWVsZFwiO1xuICB2YXIgR2VuU3RhdGVFeGVjdXRpbmcgPSBcImV4ZWN1dGluZ1wiO1xuICB2YXIgR2VuU3RhdGVDb21wbGV0ZWQgPSBcImNvbXBsZXRlZFwiO1xuXG4gIC8vIFJldHVybmluZyB0aGlzIG9iamVjdCBmcm9tIHRoZSBpbm5lckZuIGhhcyB0aGUgc2FtZSBlZmZlY3QgYXNcbiAgLy8gYnJlYWtpbmcgb3V0IG9mIHRoZSBkaXNwYXRjaCBzd2l0Y2ggc3RhdGVtZW50LlxuICB2YXIgQ29udGludWVTZW50aW5lbCA9IHt9O1xuXG4gIC8vIER1bW15IGNvbnN0cnVjdG9yIGZ1bmN0aW9ucyB0aGF0IHdlIHVzZSBhcyB0aGUgLmNvbnN0cnVjdG9yIGFuZFxuICAvLyAuY29uc3RydWN0b3IucHJvdG90eXBlIHByb3BlcnRpZXMgZm9yIGZ1bmN0aW9ucyB0aGF0IHJldHVybiBHZW5lcmF0b3JcbiAgLy8gb2JqZWN0cy4gRm9yIGZ1bGwgc3BlYyBjb21wbGlhbmNlLCB5b3UgbWF5IHdpc2ggdG8gY29uZmlndXJlIHlvdXJcbiAgLy8gbWluaWZpZXIgbm90IHRvIG1hbmdsZSB0aGUgbmFtZXMgb2YgdGhlc2UgdHdvIGZ1bmN0aW9ucy5cbiAgZnVuY3Rpb24gR2VuZXJhdG9yKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb24oKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSgpIHt9XG5cbiAgLy8gVGhpcyBpcyBhIHBvbHlmaWxsIGZvciAlSXRlcmF0b3JQcm90b3R5cGUlIGZvciBlbnZpcm9ubWVudHMgdGhhdFxuICAvLyBkb24ndCBuYXRpdmVseSBzdXBwb3J0IGl0LlxuICB2YXIgSXRlcmF0b3JQcm90b3R5cGUgPSB7fTtcbiAgSXRlcmF0b3JQcm90b3R5cGVbaXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHZhciBnZXRQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZjtcbiAgdmFyIE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlID0gZ2V0UHJvdG8gJiYgZ2V0UHJvdG8oZ2V0UHJvdG8odmFsdWVzKFtdKSkpO1xuICBpZiAoTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgJiZcbiAgICAgIE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICE9PSBPcCAmJlxuICAgICAgaGFzT3duLmNhbGwoTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUsIGl0ZXJhdG9yU3ltYm9sKSkge1xuICAgIC8vIFRoaXMgZW52aXJvbm1lbnQgaGFzIGEgbmF0aXZlICVJdGVyYXRvclByb3RvdHlwZSU7IHVzZSBpdCBpbnN0ZWFkXG4gICAgLy8gb2YgdGhlIHBvbHlmaWxsLlxuICAgIEl0ZXJhdG9yUHJvdG90eXBlID0gTmF0aXZlSXRlcmF0b3JQcm90b3R5cGU7XG4gIH1cblxuICB2YXIgR3AgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5wcm90b3R5cGUgPVxuICAgIEdlbmVyYXRvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEl0ZXJhdG9yUHJvdG90eXBlKTtcbiAgR2VuZXJhdG9yRnVuY3Rpb24ucHJvdG90eXBlID0gR3AuY29uc3RydWN0b3IgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUuY29uc3RydWN0b3IgPSBHZW5lcmF0b3JGdW5jdGlvbjtcbiAgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGVbdG9TdHJpbmdUYWdTeW1ib2xdID1cbiAgICBHZW5lcmF0b3JGdW5jdGlvbi5kaXNwbGF5TmFtZSA9IFwiR2VuZXJhdG9yRnVuY3Rpb25cIjtcblxuICAvLyBIZWxwZXIgZm9yIGRlZmluaW5nIHRoZSAubmV4dCwgLnRocm93LCBhbmQgLnJldHVybiBtZXRob2RzIG9mIHRoZVxuICAvLyBJdGVyYXRvciBpbnRlcmZhY2UgaW4gdGVybXMgb2YgYSBzaW5nbGUgLl9pbnZva2UgbWV0aG9kLlxuICBmdW5jdGlvbiBkZWZpbmVJdGVyYXRvck1ldGhvZHMocHJvdG90eXBlKSB7XG4gICAgW1wibmV4dFwiLCBcInRocm93XCIsIFwicmV0dXJuXCJdLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICBwcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKGFyZykge1xuICAgICAgICByZXR1cm4gdGhpcy5faW52b2tlKG1ldGhvZCwgYXJnKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBleHBvcnRzLmlzR2VuZXJhdG9yRnVuY3Rpb24gPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICB2YXIgY3RvciA9IHR5cGVvZiBnZW5GdW4gPT09IFwiZnVuY3Rpb25cIiAmJiBnZW5GdW4uY29uc3RydWN0b3I7XG4gICAgcmV0dXJuIGN0b3JcbiAgICAgID8gY3RvciA9PT0gR2VuZXJhdG9yRnVuY3Rpb24gfHxcbiAgICAgICAgLy8gRm9yIHRoZSBuYXRpdmUgR2VuZXJhdG9yRnVuY3Rpb24gY29uc3RydWN0b3IsIHRoZSBiZXN0IHdlIGNhblxuICAgICAgICAvLyBkbyBpcyB0byBjaGVjayBpdHMgLm5hbWUgcHJvcGVydHkuXG4gICAgICAgIChjdG9yLmRpc3BsYXlOYW1lIHx8IGN0b3IubmFtZSkgPT09IFwiR2VuZXJhdG9yRnVuY3Rpb25cIlxuICAgICAgOiBmYWxzZTtcbiAgfTtcblxuICBleHBvcnRzLm1hcmsgPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICBpZiAoT2JqZWN0LnNldFByb3RvdHlwZU9mKSB7XG4gICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YoZ2VuRnVuLCBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdlbkZ1bi5fX3Byb3RvX18gPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgICAgIGlmICghKHRvU3RyaW5nVGFnU3ltYm9sIGluIGdlbkZ1bikpIHtcbiAgICAgICAgZ2VuRnVuW3RvU3RyaW5nVGFnU3ltYm9sXSA9IFwiR2VuZXJhdG9yRnVuY3Rpb25cIjtcbiAgICAgIH1cbiAgICB9XG4gICAgZ2VuRnVuLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoR3ApO1xuICAgIHJldHVybiBnZW5GdW47XG4gIH07XG5cbiAgLy8gV2l0aGluIHRoZSBib2R5IG9mIGFueSBhc3luYyBmdW5jdGlvbiwgYGF3YWl0IHhgIGlzIHRyYW5zZm9ybWVkIHRvXG4gIC8vIGB5aWVsZCByZWdlbmVyYXRvclJ1bnRpbWUuYXdyYXAoeClgLCBzbyB0aGF0IHRoZSBydW50aW1lIGNhbiB0ZXN0XG4gIC8vIGBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpYCB0byBkZXRlcm1pbmUgaWYgdGhlIHlpZWxkZWQgdmFsdWUgaXNcbiAgLy8gbWVhbnQgdG8gYmUgYXdhaXRlZC5cbiAgZXhwb3J0cy5hd3JhcCA9IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiB7IF9fYXdhaXQ6IGFyZyB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIEFzeW5jSXRlcmF0b3IoZ2VuZXJhdG9yLCBQcm9taXNlSW1wbCkge1xuICAgIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goZ2VuZXJhdG9yW21ldGhvZF0sIGdlbmVyYXRvciwgYXJnKTtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHJlamVjdChyZWNvcmQuYXJnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciByZXN1bHQgPSByZWNvcmQuYXJnO1xuICAgICAgICB2YXIgdmFsdWUgPSByZXN1bHQudmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSAmJlxuICAgICAgICAgICAgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2VJbXBsLnJlc29sdmUodmFsdWUuX19hd2FpdCkudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgaW52b2tlKFwibmV4dFwiLCB2YWx1ZSwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGludm9rZShcInRocm93XCIsIGVyciwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBQcm9taXNlSW1wbC5yZXNvbHZlKHZhbHVlKS50aGVuKGZ1bmN0aW9uKHVud3JhcHBlZCkge1xuICAgICAgICAgIC8vIFdoZW4gYSB5aWVsZGVkIFByb21pc2UgaXMgcmVzb2x2ZWQsIGl0cyBmaW5hbCB2YWx1ZSBiZWNvbWVzXG4gICAgICAgICAgLy8gdGhlIC52YWx1ZSBvZiB0aGUgUHJvbWlzZTx7dmFsdWUsZG9uZX0+IHJlc3VsdCBmb3IgdGhlXG4gICAgICAgICAgLy8gY3VycmVudCBpdGVyYXRpb24uXG4gICAgICAgICAgcmVzdWx0LnZhbHVlID0gdW53cmFwcGVkO1xuICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAvLyBJZiBhIHJlamVjdGVkIFByb21pc2Ugd2FzIHlpZWxkZWQsIHRocm93IHRoZSByZWplY3Rpb24gYmFja1xuICAgICAgICAgIC8vIGludG8gdGhlIGFzeW5jIGdlbmVyYXRvciBmdW5jdGlvbiBzbyBpdCBjYW4gYmUgaGFuZGxlZCB0aGVyZS5cbiAgICAgICAgICByZXR1cm4gaW52b2tlKFwidGhyb3dcIiwgZXJyb3IsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwcmV2aW91c1Byb21pc2U7XG5cbiAgICBmdW5jdGlvbiBlbnF1ZXVlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBmdW5jdGlvbiBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlSW1wbChmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICBpbnZva2UobWV0aG9kLCBhcmcsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJldmlvdXNQcm9taXNlID1cbiAgICAgICAgLy8gSWYgZW5xdWV1ZSBoYXMgYmVlbiBjYWxsZWQgYmVmb3JlLCB0aGVuIHdlIHdhbnQgdG8gd2FpdCB1bnRpbFxuICAgICAgICAvLyBhbGwgcHJldmlvdXMgUHJvbWlzZXMgaGF2ZSBiZWVuIHJlc29sdmVkIGJlZm9yZSBjYWxsaW5nIGludm9rZSxcbiAgICAgICAgLy8gc28gdGhhdCByZXN1bHRzIGFyZSBhbHdheXMgZGVsaXZlcmVkIGluIHRoZSBjb3JyZWN0IG9yZGVyLiBJZlxuICAgICAgICAvLyBlbnF1ZXVlIGhhcyBub3QgYmVlbiBjYWxsZWQgYmVmb3JlLCB0aGVuIGl0IGlzIGltcG9ydGFudCB0b1xuICAgICAgICAvLyBjYWxsIGludm9rZSBpbW1lZGlhdGVseSwgd2l0aG91dCB3YWl0aW5nIG9uIGEgY2FsbGJhY2sgdG8gZmlyZSxcbiAgICAgICAgLy8gc28gdGhhdCB0aGUgYXN5bmMgZ2VuZXJhdG9yIGZ1bmN0aW9uIGhhcyB0aGUgb3Bwb3J0dW5pdHkgdG8gZG9cbiAgICAgICAgLy8gYW55IG5lY2Vzc2FyeSBzZXR1cCBpbiBhIHByZWRpY3RhYmxlIHdheS4gVGhpcyBwcmVkaWN0YWJpbGl0eVxuICAgICAgICAvLyBpcyB3aHkgdGhlIFByb21pc2UgY29uc3RydWN0b3Igc3luY2hyb25vdXNseSBpbnZva2VzIGl0c1xuICAgICAgICAvLyBleGVjdXRvciBjYWxsYmFjaywgYW5kIHdoeSBhc3luYyBmdW5jdGlvbnMgc3luY2hyb25vdXNseVxuICAgICAgICAvLyBleGVjdXRlIGNvZGUgYmVmb3JlIHRoZSBmaXJzdCBhd2FpdC4gU2luY2Ugd2UgaW1wbGVtZW50IHNpbXBsZVxuICAgICAgICAvLyBhc3luYyBmdW5jdGlvbnMgaW4gdGVybXMgb2YgYXN5bmMgZ2VuZXJhdG9ycywgaXQgaXMgZXNwZWNpYWxseVxuICAgICAgICAvLyBpbXBvcnRhbnQgdG8gZ2V0IHRoaXMgcmlnaHQsIGV2ZW4gdGhvdWdoIGl0IHJlcXVpcmVzIGNhcmUuXG4gICAgICAgIHByZXZpb3VzUHJvbWlzZSA/IHByZXZpb3VzUHJvbWlzZS50aGVuKFxuICAgICAgICAgIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnLFxuICAgICAgICAgIC8vIEF2b2lkIHByb3BhZ2F0aW5nIGZhaWx1cmVzIHRvIFByb21pc2VzIHJldHVybmVkIGJ5IGxhdGVyXG4gICAgICAgICAgLy8gaW52b2NhdGlvbnMgb2YgdGhlIGl0ZXJhdG9yLlxuICAgICAgICAgIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnXG4gICAgICAgICkgOiBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZygpO1xuICAgIH1cblxuICAgIC8vIERlZmluZSB0aGUgdW5pZmllZCBoZWxwZXIgbWV0aG9kIHRoYXQgaXMgdXNlZCB0byBpbXBsZW1lbnQgLm5leHQsXG4gICAgLy8gLnRocm93LCBhbmQgLnJldHVybiAoc2VlIGRlZmluZUl0ZXJhdG9yTWV0aG9kcykuXG4gICAgdGhpcy5faW52b2tlID0gZW5xdWV1ZTtcbiAgfVxuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhBc3luY0l0ZXJhdG9yLnByb3RvdHlwZSk7XG4gIEFzeW5jSXRlcmF0b3IucHJvdG90eXBlW2FzeW5jSXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBleHBvcnRzLkFzeW5jSXRlcmF0b3IgPSBBc3luY0l0ZXJhdG9yO1xuXG4gIC8vIE5vdGUgdGhhdCBzaW1wbGUgYXN5bmMgZnVuY3Rpb25zIGFyZSBpbXBsZW1lbnRlZCBvbiB0b3Agb2ZcbiAgLy8gQXN5bmNJdGVyYXRvciBvYmplY3RzOyB0aGV5IGp1c3QgcmV0dXJuIGEgUHJvbWlzZSBmb3IgdGhlIHZhbHVlIG9mXG4gIC8vIHRoZSBmaW5hbCByZXN1bHQgcHJvZHVjZWQgYnkgdGhlIGl0ZXJhdG9yLlxuICBleHBvcnRzLmFzeW5jID0gZnVuY3Rpb24oaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QsIFByb21pc2VJbXBsKSB7XG4gICAgaWYgKFByb21pc2VJbXBsID09PSB2b2lkIDApIFByb21pc2VJbXBsID0gUHJvbWlzZTtcblxuICAgIHZhciBpdGVyID0gbmV3IEFzeW5jSXRlcmF0b3IoXG4gICAgICB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSxcbiAgICAgIFByb21pc2VJbXBsXG4gICAgKTtcblxuICAgIHJldHVybiBleHBvcnRzLmlzR2VuZXJhdG9yRnVuY3Rpb24ob3V0ZXJGbilcbiAgICAgID8gaXRlciAvLyBJZiBvdXRlckZuIGlzIGEgZ2VuZXJhdG9yLCByZXR1cm4gdGhlIGZ1bGwgaXRlcmF0b3IuXG4gICAgICA6IGl0ZXIubmV4dCgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5kb25lID8gcmVzdWx0LnZhbHVlIDogaXRlci5uZXh0KCk7XG4gICAgICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCkge1xuICAgIHZhciBzdGF0ZSA9IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQ7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlRXhlY3V0aW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IHJ1bm5pbmdcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVDb21wbGV0ZWQpIHtcbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgdGhyb3cgYXJnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQmUgZm9yZ2l2aW5nLCBwZXIgMjUuMy4zLjMuMyBvZiB0aGUgc3BlYzpcbiAgICAgICAgLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWdlbmVyYXRvcnJlc3VtZVxuICAgICAgICByZXR1cm4gZG9uZVJlc3VsdCgpO1xuICAgICAgfVxuXG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IG1ldGhvZDtcbiAgICAgIGNvbnRleHQuYXJnID0gYXJnO1xuXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSBjb250ZXh0LmRlbGVnYXRlO1xuICAgICAgICBpZiAoZGVsZWdhdGUpIHtcbiAgICAgICAgICB2YXIgZGVsZWdhdGVSZXN1bHQgPSBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KTtcbiAgICAgICAgICBpZiAoZGVsZWdhdGVSZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChkZWxlZ2F0ZVJlc3VsdCA9PT0gQ29udGludWVTZW50aW5lbCkgY29udGludWU7XG4gICAgICAgICAgICByZXR1cm4gZGVsZWdhdGVSZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgIC8vIFNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgICAgIC8vIGZ1bmN0aW9uLnNlbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICAgICAgY29udGV4dC5zZW50ID0gY29udGV4dC5fc2VudCA9IGNvbnRleHQuYXJnO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydCkge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAgIHRocm93IGNvbnRleHQuYXJnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgICBjb250ZXh0LmFicnVwdChcInJldHVyblwiLCBjb250ZXh0LmFyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZSA9IEdlblN0YXRlRXhlY3V0aW5nO1xuXG4gICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiKSB7XG4gICAgICAgICAgLy8gSWYgYW4gZXhjZXB0aW9uIGlzIHRocm93biBmcm9tIGlubmVyRm4sIHdlIGxlYXZlIHN0YXRlID09PVxuICAgICAgICAgIC8vIEdlblN0YXRlRXhlY3V0aW5nIGFuZCBsb29wIGJhY2sgZm9yIGFub3RoZXIgaW52b2NhdGlvbi5cbiAgICAgICAgICBzdGF0ZSA9IGNvbnRleHQuZG9uZVxuICAgICAgICAgICAgPyBHZW5TdGF0ZUNvbXBsZXRlZFxuICAgICAgICAgICAgOiBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuXG4gICAgICAgICAgaWYgKHJlY29yZC5hcmcgPT09IENvbnRpbnVlU2VudGluZWwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogcmVjb3JkLmFyZyxcbiAgICAgICAgICAgIGRvbmU6IGNvbnRleHQuZG9uZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAvLyBEaXNwYXRjaCB0aGUgZXhjZXB0aW9uIGJ5IGxvb3BpbmcgYmFjayBhcm91bmQgdG8gdGhlXG4gICAgICAgICAgLy8gY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihjb250ZXh0LmFyZykgY2FsbCBhYm92ZS5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gQ2FsbCBkZWxlZ2F0ZS5pdGVyYXRvcltjb250ZXh0Lm1ldGhvZF0oY29udGV4dC5hcmcpIGFuZCBoYW5kbGUgdGhlXG4gIC8vIHJlc3VsdCwgZWl0aGVyIGJ5IHJldHVybmluZyBhIHsgdmFsdWUsIGRvbmUgfSByZXN1bHQgZnJvbSB0aGVcbiAgLy8gZGVsZWdhdGUgaXRlcmF0b3IsIG9yIGJ5IG1vZGlmeWluZyBjb250ZXh0Lm1ldGhvZCBhbmQgY29udGV4dC5hcmcsXG4gIC8vIHNldHRpbmcgY29udGV4dC5kZWxlZ2F0ZSB0byBudWxsLCBhbmQgcmV0dXJuaW5nIHRoZSBDb250aW51ZVNlbnRpbmVsLlxuICBmdW5jdGlvbiBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIG1ldGhvZCA9IGRlbGVnYXRlLml0ZXJhdG9yW2NvbnRleHQubWV0aG9kXTtcbiAgICBpZiAobWV0aG9kID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIEEgLnRocm93IG9yIC5yZXR1cm4gd2hlbiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIG5vIC50aHJvd1xuICAgICAgLy8gbWV0aG9kIGFsd2F5cyB0ZXJtaW5hdGVzIHRoZSB5aWVsZCogbG9vcC5cbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAvLyBOb3RlOiBbXCJyZXR1cm5cIl0gbXVzdCBiZSB1c2VkIGZvciBFUzMgcGFyc2luZyBjb21wYXRpYmlsaXR5LlxuICAgICAgICBpZiAoZGVsZWdhdGUuaXRlcmF0b3JbXCJyZXR1cm5cIl0pIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIGEgcmV0dXJuIG1ldGhvZCwgZ2l2ZSBpdCBhXG4gICAgICAgICAgLy8gY2hhbmNlIHRvIGNsZWFuIHVwLlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJyZXR1cm5cIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KTtcblxuICAgICAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICAvLyBJZiBtYXliZUludm9rZURlbGVnYXRlKGNvbnRleHQpIGNoYW5nZWQgY29udGV4dC5tZXRob2QgZnJvbVxuICAgICAgICAgICAgLy8gXCJyZXR1cm5cIiB0byBcInRocm93XCIsIGxldCB0aGF0IG92ZXJyaWRlIHRoZSBUeXBlRXJyb3IgYmVsb3cuXG4gICAgICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIFwiVGhlIGl0ZXJhdG9yIGRvZXMgbm90IHByb3ZpZGUgYSAndGhyb3cnIG1ldGhvZFwiKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKG1ldGhvZCwgZGVsZWdhdGUuaXRlcmF0b3IsIGNvbnRleHQuYXJnKTtcblxuICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgIGNvbnRleHQuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgdmFyIGluZm8gPSByZWNvcmQuYXJnO1xuXG4gICAgaWYgKCEgaW5mbykge1xuICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICBjb250ZXh0LmFyZyA9IG5ldyBUeXBlRXJyb3IoXCJpdGVyYXRvciByZXN1bHQgaXMgbm90IGFuIG9iamVjdFwiKTtcbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgaWYgKGluZm8uZG9uZSkge1xuICAgICAgLy8gQXNzaWduIHRoZSByZXN1bHQgb2YgdGhlIGZpbmlzaGVkIGRlbGVnYXRlIHRvIHRoZSB0ZW1wb3JhcnlcbiAgICAgIC8vIHZhcmlhYmxlIHNwZWNpZmllZCBieSBkZWxlZ2F0ZS5yZXN1bHROYW1lIChzZWUgZGVsZWdhdGVZaWVsZCkuXG4gICAgICBjb250ZXh0W2RlbGVnYXRlLnJlc3VsdE5hbWVdID0gaW5mby52YWx1ZTtcblxuICAgICAgLy8gUmVzdW1lIGV4ZWN1dGlvbiBhdCB0aGUgZGVzaXJlZCBsb2NhdGlvbiAoc2VlIGRlbGVnYXRlWWllbGQpLlxuICAgICAgY29udGV4dC5uZXh0ID0gZGVsZWdhdGUubmV4dExvYztcblxuICAgICAgLy8gSWYgY29udGV4dC5tZXRob2Qgd2FzIFwidGhyb3dcIiBidXQgdGhlIGRlbGVnYXRlIGhhbmRsZWQgdGhlXG4gICAgICAvLyBleGNlcHRpb24sIGxldCB0aGUgb3V0ZXIgZ2VuZXJhdG9yIHByb2NlZWQgbm9ybWFsbHkuIElmXG4gICAgICAvLyBjb250ZXh0Lm1ldGhvZCB3YXMgXCJuZXh0XCIsIGZvcmdldCBjb250ZXh0LmFyZyBzaW5jZSBpdCBoYXMgYmVlblxuICAgICAgLy8gXCJjb25zdW1lZFwiIGJ5IHRoZSBkZWxlZ2F0ZSBpdGVyYXRvci4gSWYgY29udGV4dC5tZXRob2Qgd2FzXG4gICAgICAvLyBcInJldHVyblwiLCBhbGxvdyB0aGUgb3JpZ2luYWwgLnJldHVybiBjYWxsIHRvIGNvbnRpbnVlIGluIHRoZVxuICAgICAgLy8gb3V0ZXIgZ2VuZXJhdG9yLlxuICAgICAgaWYgKGNvbnRleHQubWV0aG9kICE9PSBcInJldHVyblwiKSB7XG4gICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFJlLXlpZWxkIHRoZSByZXN1bHQgcmV0dXJuZWQgYnkgdGhlIGRlbGVnYXRlIG1ldGhvZC5cbiAgICAgIHJldHVybiBpbmZvO1xuICAgIH1cblxuICAgIC8vIFRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBpcyBmaW5pc2hlZCwgc28gZm9yZ2V0IGl0IGFuZCBjb250aW51ZSB3aXRoXG4gICAgLy8gdGhlIG91dGVyIGdlbmVyYXRvci5cbiAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgfVxuXG4gIC8vIERlZmluZSBHZW5lcmF0b3IucHJvdG90eXBlLntuZXh0LHRocm93LHJldHVybn0gaW4gdGVybXMgb2YgdGhlXG4gIC8vIHVuaWZpZWQgLl9pbnZva2UgaGVscGVyIG1ldGhvZC5cbiAgZGVmaW5lSXRlcmF0b3JNZXRob2RzKEdwKTtcblxuICBHcFt0b1N0cmluZ1RhZ1N5bWJvbF0gPSBcIkdlbmVyYXRvclwiO1xuXG4gIC8vIEEgR2VuZXJhdG9yIHNob3VsZCBhbHdheXMgcmV0dXJuIGl0c2VsZiBhcyB0aGUgaXRlcmF0b3Igb2JqZWN0IHdoZW4gdGhlXG4gIC8vIEBAaXRlcmF0b3IgZnVuY3Rpb24gaXMgY2FsbGVkIG9uIGl0LiBTb21lIGJyb3dzZXJzJyBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlXG4gIC8vIGl0ZXJhdG9yIHByb3RvdHlwZSBjaGFpbiBpbmNvcnJlY3RseSBpbXBsZW1lbnQgdGhpcywgY2F1c2luZyB0aGUgR2VuZXJhdG9yXG4gIC8vIG9iamVjdCB0byBub3QgYmUgcmV0dXJuZWQgZnJvbSB0aGlzIGNhbGwuIFRoaXMgZW5zdXJlcyB0aGF0IGRvZXNuJ3QgaGFwcGVuLlxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlZ2VuZXJhdG9yL2lzc3Vlcy8yNzQgZm9yIG1vcmUgZGV0YWlscy5cbiAgR3BbaXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgR3AudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJbb2JqZWN0IEdlbmVyYXRvcl1cIjtcbiAgfTtcblxuICBmdW5jdGlvbiBwdXNoVHJ5RW50cnkobG9jcykge1xuICAgIHZhciBlbnRyeSA9IHsgdHJ5TG9jOiBsb2NzWzBdIH07XG5cbiAgICBpZiAoMSBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5jYXRjaExvYyA9IGxvY3NbMV07XG4gICAgfVxuXG4gICAgaWYgKDIgaW4gbG9jcykge1xuICAgICAgZW50cnkuZmluYWxseUxvYyA9IGxvY3NbMl07XG4gICAgICBlbnRyeS5hZnRlckxvYyA9IGxvY3NbM107XG4gICAgfVxuXG4gICAgdGhpcy50cnlFbnRyaWVzLnB1c2goZW50cnkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzZXRUcnlFbnRyeShlbnRyeSkge1xuICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uIHx8IHt9O1xuICAgIHJlY29yZC50eXBlID0gXCJub3JtYWxcIjtcbiAgICBkZWxldGUgcmVjb3JkLmFyZztcbiAgICBlbnRyeS5jb21wbGV0aW9uID0gcmVjb3JkO1xuICB9XG5cbiAgZnVuY3Rpb24gQ29udGV4dCh0cnlMb2NzTGlzdCkge1xuICAgIC8vIFRoZSByb290IGVudHJ5IG9iamVjdCAoZWZmZWN0aXZlbHkgYSB0cnkgc3RhdGVtZW50IHdpdGhvdXQgYSBjYXRjaFxuICAgIC8vIG9yIGEgZmluYWxseSBibG9jaykgZ2l2ZXMgdXMgYSBwbGFjZSB0byBzdG9yZSB2YWx1ZXMgdGhyb3duIGZyb21cbiAgICAvLyBsb2NhdGlvbnMgd2hlcmUgdGhlcmUgaXMgbm8gZW5jbG9zaW5nIHRyeSBzdGF0ZW1lbnQuXG4gICAgdGhpcy50cnlFbnRyaWVzID0gW3sgdHJ5TG9jOiBcInJvb3RcIiB9XTtcbiAgICB0cnlMb2NzTGlzdC5mb3JFYWNoKHB1c2hUcnlFbnRyeSwgdGhpcyk7XG4gICAgdGhpcy5yZXNldCh0cnVlKTtcbiAgfVxuXG4gIGV4cG9ydHMua2V5cyA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgfVxuICAgIGtleXMucmV2ZXJzZSgpO1xuXG4gICAgLy8gUmF0aGVyIHRoYW4gcmV0dXJuaW5nIGFuIG9iamVjdCB3aXRoIGEgbmV4dCBtZXRob2QsIHdlIGtlZXBcbiAgICAvLyB0aGluZ3Mgc2ltcGxlIGFuZCByZXR1cm4gdGhlIG5leHQgZnVuY3Rpb24gaXRzZWxmLlxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgd2hpbGUgKGtleXMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBrZXkgPSBrZXlzLnBvcCgpO1xuICAgICAgICBpZiAoa2V5IGluIG9iamVjdCkge1xuICAgICAgICAgIG5leHQudmFsdWUgPSBrZXk7XG4gICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVG8gYXZvaWQgY3JlYXRpbmcgYW4gYWRkaXRpb25hbCBvYmplY3QsIHdlIGp1c3QgaGFuZyB0aGUgLnZhbHVlXG4gICAgICAvLyBhbmQgLmRvbmUgcHJvcGVydGllcyBvZmYgdGhlIG5leHQgZnVuY3Rpb24gb2JqZWN0IGl0c2VsZi4gVGhpc1xuICAgICAgLy8gYWxzbyBlbnN1cmVzIHRoYXQgdGhlIG1pbmlmaWVyIHdpbGwgbm90IGFub255bWl6ZSB0aGUgZnVuY3Rpb24uXG4gICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWx1ZXMoaXRlcmFibGUpIHtcbiAgICBpZiAoaXRlcmFibGUpIHtcbiAgICAgIHZhciBpdGVyYXRvck1ldGhvZCA9IGl0ZXJhYmxlW2l0ZXJhdG9yU3ltYm9sXTtcbiAgICAgIGlmIChpdGVyYXRvck1ldGhvZCkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JNZXRob2QuY2FsbChpdGVyYWJsZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgaXRlcmFibGUubmV4dCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBpdGVyYWJsZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc05hTihpdGVyYWJsZS5sZW5ndGgpKSB7XG4gICAgICAgIHZhciBpID0gLTEsIG5leHQgPSBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgIHdoaWxlICgrK2kgPCBpdGVyYWJsZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd24uY2FsbChpdGVyYWJsZSwgaSkpIHtcbiAgICAgICAgICAgICAgbmV4dC52YWx1ZSA9IGl0ZXJhYmxlW2ldO1xuICAgICAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV4dC52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG5leHQubmV4dCA9IG5leHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIGFuIGl0ZXJhdG9yIHdpdGggbm8gdmFsdWVzLlxuICAgIHJldHVybiB7IG5leHQ6IGRvbmVSZXN1bHQgfTtcbiAgfVxuICBleHBvcnRzLnZhbHVlcyA9IHZhbHVlcztcblxuICBmdW5jdGlvbiBkb25lUmVzdWx0KCkge1xuICAgIHJldHVybiB7IHZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWUgfTtcbiAgfVxuXG4gIENvbnRleHQucHJvdG90eXBlID0ge1xuICAgIGNvbnN0cnVjdG9yOiBDb250ZXh0LFxuXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKHNraXBUZW1wUmVzZXQpIHtcbiAgICAgIHRoaXMucHJldiA9IDA7XG4gICAgICB0aGlzLm5leHQgPSAwO1xuICAgICAgLy8gUmVzZXR0aW5nIGNvbnRleHQuX3NlbnQgZm9yIGxlZ2FjeSBzdXBwb3J0IG9mIEJhYmVsJ3NcbiAgICAgIC8vIGZ1bmN0aW9uLnNlbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICB0aGlzLnNlbnQgPSB0aGlzLl9zZW50ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5kb25lID0gZmFsc2U7XG4gICAgICB0aGlzLmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgdGhpcy5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgIHRoaXMuYXJnID0gdW5kZWZpbmVkO1xuXG4gICAgICB0aGlzLnRyeUVudHJpZXMuZm9yRWFjaChyZXNldFRyeUVudHJ5KTtcblxuICAgICAgaWYgKCFza2lwVGVtcFJlc2V0KSB7XG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcykge1xuICAgICAgICAgIC8vIE5vdCBzdXJlIGFib3V0IHRoZSBvcHRpbWFsIG9yZGVyIG9mIHRoZXNlIGNvbmRpdGlvbnM6XG4gICAgICAgICAgaWYgKG5hbWUuY2hhckF0KDApID09PSBcInRcIiAmJlxuICAgICAgICAgICAgICBoYXNPd24uY2FsbCh0aGlzLCBuYW1lKSAmJlxuICAgICAgICAgICAgICAhaXNOYU4oK25hbWUuc2xpY2UoMSkpKSB7XG4gICAgICAgICAgICB0aGlzW25hbWVdID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG5cbiAgICAgIHZhciByb290RW50cnkgPSB0aGlzLnRyeUVudHJpZXNbMF07XG4gICAgICB2YXIgcm9vdFJlY29yZCA9IHJvb3RFbnRyeS5jb21wbGV0aW9uO1xuICAgICAgaWYgKHJvb3RSZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJvb3RSZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5ydmFsO1xuICAgIH0sXG5cbiAgICBkaXNwYXRjaEV4Y2VwdGlvbjogZnVuY3Rpb24oZXhjZXB0aW9uKSB7XG4gICAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICAgIHRocm93IGV4Y2VwdGlvbjtcbiAgICAgIH1cblxuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzO1xuICAgICAgZnVuY3Rpb24gaGFuZGxlKGxvYywgY2F1Z2h0KSB7XG4gICAgICAgIHJlY29yZC50eXBlID0gXCJ0aHJvd1wiO1xuICAgICAgICByZWNvcmQuYXJnID0gZXhjZXB0aW9uO1xuICAgICAgICBjb250ZXh0Lm5leHQgPSBsb2M7XG5cbiAgICAgICAgaWYgKGNhdWdodCkge1xuICAgICAgICAgIC8vIElmIHRoZSBkaXNwYXRjaGVkIGV4Y2VwdGlvbiB3YXMgY2F1Z2h0IGJ5IGEgY2F0Y2ggYmxvY2ssXG4gICAgICAgICAgLy8gdGhlbiBsZXQgdGhhdCBjYXRjaCBibG9jayBoYW5kbGUgdGhlIGV4Y2VwdGlvbiBub3JtYWxseS5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICEhIGNhdWdodDtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uO1xuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPT09IFwicm9vdFwiKSB7XG4gICAgICAgICAgLy8gRXhjZXB0aW9uIHRocm93biBvdXRzaWRlIG9mIGFueSB0cnkgYmxvY2sgdGhhdCBjb3VsZCBoYW5kbGVcbiAgICAgICAgICAvLyBpdCwgc28gc2V0IHRoZSBjb21wbGV0aW9uIHZhbHVlIG9mIHRoZSBlbnRpcmUgZnVuY3Rpb24gdG9cbiAgICAgICAgICAvLyB0aHJvdyB0aGUgZXhjZXB0aW9uLlxuICAgICAgICAgIHJldHVybiBoYW5kbGUoXCJlbmRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldikge1xuICAgICAgICAgIHZhciBoYXNDYXRjaCA9IGhhc093bi5jYWxsKGVudHJ5LCBcImNhdGNoTG9jXCIpO1xuICAgICAgICAgIHZhciBoYXNGaW5hbGx5ID0gaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKTtcblxuICAgICAgICAgIGlmIChoYXNDYXRjaCAmJiBoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzQ2F0Y2gpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0cnkgc3RhdGVtZW50IHdpdGhvdXQgY2F0Y2ggb3IgZmluYWxseVwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgYWJydXB0OiBmdW5jdGlvbih0eXBlLCBhcmcpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldiAmJlxuICAgICAgICAgICAgaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKSAmJlxuICAgICAgICAgICAgdGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgIHZhciBmaW5hbGx5RW50cnkgPSBlbnRyeTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZmluYWxseUVudHJ5ICYmXG4gICAgICAgICAgKHR5cGUgPT09IFwiYnJlYWtcIiB8fFxuICAgICAgICAgICB0eXBlID09PSBcImNvbnRpbnVlXCIpICYmXG4gICAgICAgICAgZmluYWxseUVudHJ5LnRyeUxvYyA8PSBhcmcgJiZcbiAgICAgICAgICBhcmcgPD0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgLy8gSWdub3JlIHRoZSBmaW5hbGx5IGVudHJ5IGlmIGNvbnRyb2wgaXMgbm90IGp1bXBpbmcgdG8gYVxuICAgICAgICAvLyBsb2NhdGlvbiBvdXRzaWRlIHRoZSB0cnkvY2F0Y2ggYmxvY2suXG4gICAgICAgIGZpbmFsbHlFbnRyeSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHZhciByZWNvcmQgPSBmaW5hbGx5RW50cnkgPyBmaW5hbGx5RW50cnkuY29tcGxldGlvbiA6IHt9O1xuICAgICAgcmVjb3JkLnR5cGUgPSB0eXBlO1xuICAgICAgcmVjb3JkLmFyZyA9IGFyZztcblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSkge1xuICAgICAgICB0aGlzLm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICB0aGlzLm5leHQgPSBmaW5hbGx5RW50cnkuZmluYWxseUxvYztcbiAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmNvbXBsZXRlKHJlY29yZCk7XG4gICAgfSxcblxuICAgIGNvbXBsZXRlOiBmdW5jdGlvbihyZWNvcmQsIGFmdGVyTG9jKSB7XG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwiYnJlYWtcIiB8fFxuICAgICAgICAgIHJlY29yZC50eXBlID09PSBcImNvbnRpbnVlXCIpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gcmVjb3JkLmFyZztcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgdGhpcy5ydmFsID0gdGhpcy5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICB0aGlzLm1ldGhvZCA9IFwicmV0dXJuXCI7XG4gICAgICAgIHRoaXMubmV4dCA9IFwiZW5kXCI7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiICYmIGFmdGVyTG9jKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IGFmdGVyTG9jO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9LFxuXG4gICAgZmluaXNoOiBmdW5jdGlvbihmaW5hbGx5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LmZpbmFsbHlMb2MgPT09IGZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB0aGlzLmNvbXBsZXRlKGVudHJ5LmNvbXBsZXRpb24sIGVudHJ5LmFmdGVyTG9jKTtcbiAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBcImNhdGNoXCI6IGZ1bmN0aW9uKHRyeUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPT09IHRyeUxvYykge1xuICAgICAgICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uO1xuICAgICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICB2YXIgdGhyb3duID0gcmVjb3JkLmFyZztcbiAgICAgICAgICAgIHJlc2V0VHJ5RW50cnkoZW50cnkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhyb3duO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSBjb250ZXh0LmNhdGNoIG1ldGhvZCBtdXN0IG9ubHkgYmUgY2FsbGVkIHdpdGggYSBsb2NhdGlvblxuICAgICAgLy8gYXJndW1lbnQgdGhhdCBjb3JyZXNwb25kcyB0byBhIGtub3duIGNhdGNoIGJsb2NrLlxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaWxsZWdhbCBjYXRjaCBhdHRlbXB0XCIpO1xuICAgIH0sXG5cbiAgICBkZWxlZ2F0ZVlpZWxkOiBmdW5jdGlvbihpdGVyYWJsZSwgcmVzdWx0TmFtZSwgbmV4dExvYykge1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IHtcbiAgICAgICAgaXRlcmF0b3I6IHZhbHVlcyhpdGVyYWJsZSksXG4gICAgICAgIHJlc3VsdE5hbWU6IHJlc3VsdE5hbWUsXG4gICAgICAgIG5leHRMb2M6IG5leHRMb2NcbiAgICAgIH07XG5cbiAgICAgIGlmICh0aGlzLm1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgLy8gRGVsaWJlcmF0ZWx5IGZvcmdldCB0aGUgbGFzdCBzZW50IHZhbHVlIHNvIHRoYXQgd2UgZG9uJ3RcbiAgICAgICAgLy8gYWNjaWRlbnRhbGx5IHBhc3MgaXQgb24gdG8gdGhlIGRlbGVnYXRlLlxuICAgICAgICB0aGlzLmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuICB9O1xuXG4gIC8vIFJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGlzIHNjcmlwdCBpcyBleGVjdXRpbmcgYXMgYSBDb21tb25KUyBtb2R1bGVcbiAgLy8gb3Igbm90LCByZXR1cm4gdGhlIHJ1bnRpbWUgb2JqZWN0IHNvIHRoYXQgd2UgY2FuIGRlY2xhcmUgdGhlIHZhcmlhYmxlXG4gIC8vIHJlZ2VuZXJhdG9yUnVudGltZSBpbiB0aGUgb3V0ZXIgc2NvcGUsIHdoaWNoIGFsbG93cyB0aGlzIG1vZHVsZSB0byBiZVxuICAvLyBpbmplY3RlZCBlYXNpbHkgYnkgYGJpbi9yZWdlbmVyYXRvciAtLWluY2x1ZGUtcnVudGltZSBzY3JpcHQuanNgLlxuICByZXR1cm4gZXhwb3J0cztcblxufShcbiAgLy8gSWYgdGhpcyBzY3JpcHQgaXMgZXhlY3V0aW5nIGFzIGEgQ29tbW9uSlMgbW9kdWxlLCB1c2UgbW9kdWxlLmV4cG9ydHNcbiAgLy8gYXMgdGhlIHJlZ2VuZXJhdG9yUnVudGltZSBuYW1lc3BhY2UuIE90aGVyd2lzZSBjcmVhdGUgYSBuZXcgZW1wdHlcbiAgLy8gb2JqZWN0LiBFaXRoZXIgd2F5LCB0aGUgcmVzdWx0aW5nIG9iamVjdCB3aWxsIGJlIHVzZWQgdG8gaW5pdGlhbGl6ZVxuICAvLyB0aGUgcmVnZW5lcmF0b3JSdW50aW1lIHZhcmlhYmxlIGF0IHRoZSB0b3Agb2YgdGhpcyBmaWxlLlxuICB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiID8gbW9kdWxlLmV4cG9ydHMgOiB7fVxuKSk7XG5cbnRyeSB7XG4gIHJlZ2VuZXJhdG9yUnVudGltZSA9IHJ1bnRpbWU7XG59IGNhdGNoIChhY2NpZGVudGFsU3RyaWN0TW9kZSkge1xuICAvLyBUaGlzIG1vZHVsZSBzaG91bGQgbm90IGJlIHJ1bm5pbmcgaW4gc3RyaWN0IG1vZGUsIHNvIHRoZSBhYm92ZVxuICAvLyBhc3NpZ25tZW50IHNob3VsZCBhbHdheXMgd29yayB1bmxlc3Mgc29tZXRoaW5nIGlzIG1pc2NvbmZpZ3VyZWQuIEp1c3RcbiAgLy8gaW4gY2FzZSBydW50aW1lLmpzIGFjY2lkZW50YWxseSBydW5zIGluIHN0cmljdCBtb2RlLCB3ZSBjYW4gZXNjYXBlXG4gIC8vIHN0cmljdCBtb2RlIHVzaW5nIGEgZ2xvYmFsIEZ1bmN0aW9uIGNhbGwuIFRoaXMgY291bGQgY29uY2VpdmFibHkgZmFpbFxuICAvLyBpZiBhIENvbnRlbnQgU2VjdXJpdHkgUG9saWN5IGZvcmJpZHMgdXNpbmcgRnVuY3Rpb24sIGJ1dCBpbiB0aGF0IGNhc2VcbiAgLy8gdGhlIHByb3BlciBzb2x1dGlvbiBpcyB0byBmaXggdGhlIGFjY2lkZW50YWwgc3RyaWN0IG1vZGUgcHJvYmxlbS4gSWZcbiAgLy8geW91J3ZlIG1pc2NvbmZpZ3VyZWQgeW91ciBidW5kbGVyIHRvIGZvcmNlIHN0cmljdCBtb2RlIGFuZCBhcHBsaWVkIGFcbiAgLy8gQ1NQIHRvIGZvcmJpZCBGdW5jdGlvbiwgYW5kIHlvdSdyZSBub3Qgd2lsbGluZyB0byBmaXggZWl0aGVyIG9mIHRob3NlXG4gIC8vIHByb2JsZW1zLCBwbGVhc2UgZGV0YWlsIHlvdXIgdW5pcXVlIHByZWRpY2FtZW50IGluIGEgR2l0SHViIGlzc3VlLlxuICBGdW5jdGlvbihcInJcIiwgXCJyZWdlbmVyYXRvclJ1bnRpbWUgPSByXCIpKHJ1bnRpbWUpO1xufVxuIl19
