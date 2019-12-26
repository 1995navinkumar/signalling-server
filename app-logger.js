const { createLogger, format } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { combine, timestamp, json } = format;


var transport = new DailyRotateFile({
    filename: "serverout-%DATE%.log",
    dirname: "logs"
})

const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        json(),
    ),
    transports: [
        transport
    ]
});

module.exports = logger;