const network = require("net");
const logger = require("../internal/common/logger");
const controller = require("../internal/common/dispatch/controller");
const configuration = require("../internal/config/highLevelConfig");

const server = network.createServer((socket) => {
  socket.on("data", (data) => {
      controller.handleResponse(socket, data);
  });

  socket.on("error", (err) => {
    if (err.message.includes("ECONNRESET")) {
      // logger.error("Server disconnected unexpectedly: Did the server crash?");
    } else {
      logger.error(err);
    }
  });
});

module.exports = () => {
  server.listen(configuration.roomPort, () => {
    logger.info(`Room server started on port ${configuration.roomPort}`);
  });
}