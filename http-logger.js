/**
 * logs both request and response
 * logging request with remote-addr and remote-user helps when server crashes
 * includes a visual clue to differentiate req/res
 * `id` token to corelate the req/res
 * ref; https://github.com/expressjs/morgan/issues/40
 */
const morgan = require("morgan");
const fs = require('fs');
const path = require('path');
const rfs = require('rotating-file-stream')

var stream = rfs.createStream('serverout.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'logs')
})

morgan.token("id", function (req) {
  return req.id;
})

let req = morgan('--> :id [:date[clf]] :remote-addr :remote-user ":method :url "', {
  immediate: true,
  stream,
  interval: '1d'
});
let res = morgan('<-- :id [:date[clf]] ":method :url " :status :res[content-length] :response-time ms', {
  immediate: false
});

let log = req;

module.exports = { req, res, log };
