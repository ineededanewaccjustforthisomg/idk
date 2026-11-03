const crypto = require('crypto');
const Account = require('../../models/account-model'); // keep this if you're using it

const WEB_HTTP_SECRET = 'pq0194mxoqfh48L362G6R09T737E273X'; // same as C++ HttpRequest::WEB_HTTP_SECRET

// Generate SHA1 token: SHA1(WEB_HTTP_SECRET + userId + timestamp)
const jwtSign = async (userId, secret = WEB_HTTP_SECRET) => {
    try {
        const timestamp = Math.floor(Date.now() / 1000); // same style as server timestamp
        const raw = secret + String(userId) + String(timestamp);
        const token = crypto.createHash('sha1').update(raw).digest('hex');
        return { token, timestamp };
    } catch (error) {
        throw new Error('Error generating token');
    }
};

// Verify SHA1 token using the same algorithm
const jwtVerify = async (req, res, next) => {
    const userId = req.headers.userid;
    const accessToken = req.headers['access-token'];
    const gameTimestamp = req.headers['game-timestamp']; // client must also send this

    if (!userId || !accessToken || !gameTimestamp) {
        return res.status(401).json({
            code: 3,
            message: 'UserId, Access-Token, and Game-Timestamp are required'
        });
    }

    const account = await Account.findOne({ userId });
    if (!account) {
        return res.status(404).json({
            code: 102,
            message: 'Account not found',
            data: null
        });
    }

    const raw = WEB_HTTP_SECRET + String(userId) + String(gameTimestamp);
    const expectedToken = crypto.createHash('sha1').update(raw).digest('hex');

    if (accessToken !== expectedToken) {
        return res.status(403).json({
            code: 403,
            message: 'Access-Token does not match',
            data: null
        });
    }

    next();
};

module.exports = {
    jwtSign,
    jwtVerify
};