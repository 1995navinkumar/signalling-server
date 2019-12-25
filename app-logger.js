const winston = require("winston");
const DailyRotateFile = require('winston-daily-rotate-file');

var transport = new DailyRotateFile({
    filename: "serverout-%DATE%.log",
    dirname: "logs"
})

const logger = winston.createLogger({
    level: 'info',
    transports: [
        transport
    ]
});

module.exports = logger;