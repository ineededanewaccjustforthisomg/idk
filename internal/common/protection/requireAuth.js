const Account = require('../../models/account-model');
const requirementsConfig = require('../../config/requirements.json');

let bypassPaths = new Set();
let bypassPrefixes = [];

function loadRequirementsConfig() {
    if (bypassPaths.size === 0 && bypassPrefixes.length === 0) {
        if (Array.isArray(requirementsConfig.bypassAuthCheck)) {
            requirementsConfig.bypassAuthCheck.forEach(path => bypassPaths.add(path));
        }
        if (Array.isArray(requirementsConfig.bypassPrefix)) {
            bypassPrefixes = requirementsConfig.bypassPrefix;
        }
    }
}

const bypassExtra = {
  "dispatch": [
    { "method": "POST", "path": "/v1/dispatch" }
  ],
  "inner": [
    { "method": "GET", "path": "/pass/api/v1/inner/user/season/list" },
    { "method": "GET", "path": "/pass/api/v1/inner/user/season/info" },
    { "method": "POST", "path": "/pass/api/v1/inner/user/season/reward/collect" },
    { "method": "GET", "path": "/activity/api/v1/inner/collect/exchange/treasurebox/timeline" },
    { "method": "GET", "path": "/activity/api/v1/inner/activity/games/settlement/rule" },
    { "method": "POST", "path": "/game/api/v1/inner/users/games/reporting/list" },
    { "method": "POST", "path": "/gameaide/api/v1/inner/game/party/create" },
    { "method": "GET", "path": "/gameaide/api/v1/inner/user/game/props" },
    { "method": "GET", "path": "/pay/api/v1/inner/user/game/recharge/sum/gDiamond" },
    { "method": "GET", "path": "/pay/api/v1/pay/inner/has/user/recharge" },
    { "method": "ALL", "path": "/activity/api/v1/inner/collect/exchange/game/props" },
    { "method": "POST", "path": "/gameaide/api/v1/inner/msg/send" },
    { "method": "GET", "path": "/config/files/player-identity-config" },
    { "method": "GET", "path": "/gameaide/api/v1/inner/my/game/build" },
    { "method": "GET", "path": "/friend/api/v1/inner/friends/filter" },
    { "method": "POST", "path": "/charmingtown/api/v1/inner/manor/praise" },
    { "method": "GET", "path": "/user/api/v1/inner/user/details" },
    { "method": "GET", "path": "/api/v1/game/rank" },
    { "method": "POST", "path": "/api/v1/game/rank" },
    { "method": "GET", "path": "/api/v1/game/rank/list" },
    { "method": "PUT", "path": "/api/v1/game/rank/expire" },
    { "method": "POST", "path": "/game/api/v1/users/games/settlement/golds" },
    { "method": "GET", "path": "/api/v1/gcubes/:userId" },
    { "method": "POST", "path": "/api/v1/gcubes/modify" },
    { "method": "GET", "path": "/api/v1/game/data" },
    { "method": "POST", "path": "/api/v1/game/data" },
    { "method": "GET", "path": "/api/v1/data/init" },
    { "method": "GET", "path": "/pay/i/api/v1/wealth/users/:userId" },
    { "method": "POST", "path": "/pay/api/v1/pay/users/purchase/game/props" },
    { "method": "POST", "path": "/api/v1/game/log" }
  ]
}

function isBypassPath(req) {
    const reqPath = req.path;
    const reqMethod = req.method.toUpperCase();

    if (bypassPaths.has(reqPath) || bypassPrefixes.some(prefix => reqPath.startsWith(prefix))) {
        return true;
    }

    for (const group of Object.values(bypassExtra)) {
        for (const rule of group) {
            const ruleMethod = rule.method.toUpperCase();
            let pathMatch = false;

            if (rule.path.includes(':')) {
                const regex = new RegExp('^' + rule.path.replace(/:[^/]+/g, '[^/]+') + '$');
                pathMatch = regex.test(reqPath);
            } else {
                pathMatch = rule.path === reqPath;
            }

            if (pathMatch && (ruleMethod === 'ALL' || ruleMethod === reqMethod)) {
                return true;
            }
        }
    }

    return false;
}

async function requireAuth(req, res, next) {
    loadRequirementsConfig();

    if (isBypassPath(req)) {
        return next();
    }

    const userId = req.headers.userid;
    const accessToken = req.headers['access-token'];

    if (!userId || !accessToken) {
        return res.status(400).json({
            code: 400,
            message: 'UserId and Access-Token are required in headers',
            data: null
        });
    }

    try {
        const account = await Account.findOne({ userId });

        if (!account) {
            return res.status(404).json({ code: 102, message: 'Account not found', data: null });
        }

        if (account.accessToken !== accessToken) {
            return res.status(401).json({ code: 401, message: 'Access-Token does not match', data: null });
        }

        account.lastSeen = new Date();
        await account.save();

        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        return res.status(500).json({ code: 500, message: 'Internal server error', data: null });
    }
}

module.exports = requireAuth;