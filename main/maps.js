const express = require("express");
const cors = require("cors");
const path = require("path");
const compression = require("compression");
const logger = require("../internal/common/logger");
const configuration = require("../internal/config/highLevelConfig");

const app = express();

app.use(cors());
app.use(compression());

app.use("/maps", express.static(path.join(__dirname, "../internal/maps/"), {
    maxAge: "30d",
}));

app.get('/', (req, res) => res.send('OK'));

app.use((req, res) => {
  res.status(404).type('application/xml').send(`
    <?xml version="1.0" encoding="UTF-8"?>
    <error>
      <code>404</code>
      <message>File not found</message>
      <path>${req.originalUrl}</path>
    </error>
  `.trim());
});

module.exports = () => {
    app.listen(configuration.mapPort, '0.0.0.0', () => {
        logger.info(`Map server started on 0.0.0.0:${configuration.mapPort}`);
    });
};
