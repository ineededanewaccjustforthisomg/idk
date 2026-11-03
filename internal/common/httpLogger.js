const onFinished = require('on-finished');
const chalk = require('chalk');
const logger = require('./logger');

const methodColors = {
  GET: chalk.bold.green,
  POST: chalk.bold.blue,
  PUT: chalk.bold.yellow,
  DELETE: chalk.bold.red,
  PATCH: chalk.bold.magenta,
  OPTIONS: chalk.bold.cyan,
};

const requestLogger = (req, res, next) => {
  const start = Date.now();

  onFinished(res, () => {
    const duration = Date.now() - start;

    const method = methodColors[req.method];
    let statusColor = chalk.white;
    if (res.statusCode >= 500) statusColor = chalk.red;
    else if (res.statusCode >= 400) statusColor = chalk.yellow;
    else if (res.statusCode >= 300) statusColor = chalk.cyan;
    else if (res.statusCode >= 200) statusColor = chalk.green;

    console.log(`${method(req.method)} [${req.url}] Sent ${statusColor(res.statusCode)} | Delta: ${duration}ms`);
  });
  
  next();
};

module.exports = requestLogger;