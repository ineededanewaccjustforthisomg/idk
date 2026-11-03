// =====================================================
// Imports
// =====================================================
const express = require('express');
const mongoose = require('mongoose');
const chalk = require('chalk');
const figlet = require('figlet');
const path = require('path');
const fs = require('fs');

// Internal modules
const configuration = require("../internal/config/highLevelConfig");
const requestLogger = require('../internal/common/httpLogger');
const printStartupBanner = require('../internal/common/printStartupBanner');
const database = require('../internal/common/database');
const logger = require('../internal/common/logger');
const responser = require('../internal/common/response');

// Protection
const { generalLimiter, authLimiter } = require('../internal/common/protection/rateLimiters');
const requireAuth = require('../internal/common/protection/requireAuth');

// =====================================================
// App Initialization
// =====================================================
const app = express();

// =====================================================
// Routers
// =====================================================
const configRouter = require('../internal/routes/config');
const userRouter = require('../internal/routes/user');
const accountRouter = require('../internal/routes/account');
const emailRouter = require('../internal/routes/email');
const activityRouter = require('../internal/routes/activity');
const clanRouter = require('../internal/routes/clan');
const decorRouter = require('../internal/routes/decor');
const friendRouter = require('../internal/routes/friend');
const gameRouter = require('../internal/routes/game');
const msgRouter = require('../internal/routes/msg');
const mailRouter = require('../internal/routes/mail');
const payRouter = require('../internal/routes/pay');
const shopRouter = require('../internal/routes/shop');
const dispatchRouter = require('../internal/routes/dispatch');
const innerRouter = require('../internal/routes/inner');

// =====================================================
// Database Connection
// =====================================================
database.connect();

// =====================================================
// Middleware
// =====================================================
app.use(requestLogger);
app.use(requireAuth);
app.use(responser);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// =====================================================
// Routes
// =====================================================
app.use('/config', configRouter);
app.use('/user', userRouter);
app.use('/user', accountRouter);
app.use('/user', emailRouter);
app.use('/activity', activityRouter);
app.use('/clan', clanRouter);
app.use('/decoration', decorRouter);
app.use('/friend', friendRouter);
app.use('/game', gameRouter);
app.use('/msg', msgRouter);
app.use('/mailbox', mailRouter);
app.use('/pay', payRouter);
app.use('/shop', shopRouter);
app.use('/', dispatchRouter);
app.use('/', innerRouter);

// =====================================================
// Rate Limiters
// =====================================================
app.use('/user', authLimiter);
app.use(generalLimiter);

// =====================================================
// Health Check
// =====================================================
app.get('/ping', (req, res) => res.send('pong'));
app.get('/', (req, res) => res.send('OK'));
app.post('/user/api/v1/file', (req, res) => {
    logger.info(`Query: ${JSON.stringify(req.query, null, 2)}`);
    logger.info(`Headers: ${JSON.stringify(req.headers, null, 2)}`);
    logger.info(`Body: ${JSON.stringify(req.body, null, 2)}`);
    res.status(200).json({ code: 1, message: "SUCCESS", data: null });
});
// =====================================================
// Server Startup
// =====================================================
printStartupBanner(configuration.mainPort);
app.listen(configuration.mainPort, () => {
    require("./room")();
    require("./maps")();
    require("./res")();
    logger.info(`Server started at port ${configuration.mainPort}`);
});