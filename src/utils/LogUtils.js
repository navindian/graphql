const winston = require('winston');
require('winston-daily-rotate-file');

let logLevel = 'debug';
// sets the maximum size and number of days for logs to be kept
let rotateTransport = new (winston.transports.DailyRotateFile)({
  filename: process.cwd() + `/logs/photo_upload.log`,
  zippedArchive: true,
  maxSize: '1m',
  maxFiles: '7d'
});
const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    rotateTransport
  ]
});
winston.add(rotateTransport);


module.exports = logger;