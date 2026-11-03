const mongoose = require('mongoose');
const logger = require('./logger');
const databaseConfig = require('../config/database');

function connect() {
  mongoose.connect(databaseConfig.databaseType)
    .then(() => {
      logger.info(`Database connection established`);
    });
}

module.exports = {
  connect
};