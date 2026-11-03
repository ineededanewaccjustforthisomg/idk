const express = require('express');
const router = express.Router();
const logger = require("../common/logger");
const User = require('../models/user-model');
const Account = require('../models/account-model');
const Wealth = require('../models/wealth-model');
const Vip = require('../models/vip-model');
const UserData = require("../models/userdata-model");
const GameLog = require("../models/gamelog-model");

const getCurrentSeason = () => `s${new Date().getFullYear()}${String(Math.floor(new Date().getMonth() / 2) * 2 + 1).padStart(2, '0')}`;

function apiResponse(code, message, data = null) {
  return { code, message, data };
}

function validateTableName(name) {
  return /^[a-zA-Z0-9_]+$/.test(name);
}

function validateUserId(id) {
  return /^[0-9]+$/.test(id);
}

router.get("/pass/api/v1/inner/user/season/list", (req, res) => res.json({ code: 1, message: "Success", data: [{ season: getCurrentSeason(), startTime: Math.floor(Date.now() / 1000) - 86400, endTime: Math.floor(Date.now() / 1000) + (86400 * 30) }] }));
router.get("/pass/api/v1/inner/user/season/info", (req, res) => res.json({ code: 1, message: "Success", data: { level: 1, exp: 0, rewards: {} } }));
router.post("/pass/api/v1/inner/user/season/reward/collect", (req, res) => res.json({ code: 1, message: "Success" }));
router.get("/activity/api/v1/inner/collect/exchange/treasurebox/timeline", (req, res) => res.json({ code: 1, message: "Success", data: [] }));
router.get("/activity/api/v1/inner/activity/games/settlement/rule", (req, res) => res.json({ code: 1, message: "Success", data: { rules: [] } }));
router.post("/game/api/v1/inner/users/games/reporting/list", (req, res) => res.json({ code: 1, message: "Success", data: {} }));
router.post("/gameaide/api/v1/inner/game/party/create", (req, res) => res.json({ code: 1, message: "Success", data: {} }));
router.get("/gameaide/api/v1/inner/user/game/props", (req, res) => res.json({ code: 1, message: "Success", data: [] }));
router.get("/pay/api/v1/inner/user/game/recharge/sum/gDiamond", (req, res) => res.json({ code: 1, message: "Success", data: { gDiamondSum: 0 } }));
router.get("/pay/api/v1/pay/inner/has/user/recharge", (req, res) => res.json({ code: 1, message: "Success", data: { hasRecharge: false } }));
router.all("/activity/api/v1/inner/collect/exchange/game/props", (req, res) => res.json({ code: 200, message: "OK" }));
router.post('/gameaide/api/v1/inner/msg/send', (req, res) => res.json({ code: 0, message: "Message sent successfully" }));
router.get("/config/files/player-identity-config", (req, res) => res.json({ code: 1, message: "Success", data: {} }));
router.get("/gameaide/api/v1/inner/my/game/build", (req, res) => res.json({ code: 1, message: "Success", data: {} }));
router.get("/friend/api/v1/inner/friends/filter", (req, res) => res.json({ code: 1, message: "Success", data: []}));
router.post("/charmingtown/api/v1/inner/manor/praise", (req, res) => res.json({ code: 0, msg: "ok", data: { praiseCount: 0 } }));

router.get('/user/api/v1/inner/user/details', async (req, res) => {
    const { userId, gameId } = req.query;
    const wealth = await Wealth.findOne({ userId });
    const user = await User.findOne({ userId });
    const vip = await Vip.findOne({ userId });
    
    res.status(200).json({
        code: 1,
        message: "SUCCESS",
        data: {
            userId: Number(userId),
            nickName: user.nickname,
            level: 1,
            experience: 0,
            vip: vip.vip,
            diamonds: wealth.diamonds,
            gold: wealth.gold,
            gDiamonds: wealth.diamonds
        }
    });
});

router.get('/api/v1/game/rank', (req, res) => {
    logger.warn("Inner GET /api/v1/game/rank needs implementation!");
    res.json({ success: true, score: 0 });
});

router.post('/api/v1/game/rank', (req, res) => {
    logger.warn("Inner POST /api/v1/game/rank needs implementation!");
    const { key, member } = req.body;
    res.json({ success: true, key, member, newScore: 0 });
});

router.get('/api/v1/game/rank/list', (req, res) => {
    logger.warn("Inner GET /api/v1/game/rank/list needs implementation!");
    res.json({ success: true });
});

router.put('/api/v1/game/rank/expire', (req, res) => {
    logger.warn("Inner PUT /api/v1/game/rank/expire needs implementation!");
    res.json({ success: true });
});

router.post("/game/api/v1/users/games/settlement/golds", (req, res) => {
    logger.warn("Inner POST /game/api/v1/users/games/settlement/golds needs implementation!");
    res.json({ code: 1, message: "Success" });
});

router.get('/api/v1/gcubes/:userId', async (req, res) => {
    const userId = req.params.userId;
    if (!validateUserId(userId)) return res.json(apiResponse(3, 'Invalid userId'));
    try {
        const wealth = await Wealth.findOne({ userId });
        return res.json(apiResponse(1, 'Success', { userId: Number(userId), gcubes: wealth.diamonds }));
    } catch (err) {
        return res.json(apiResponse(4, 'Internal server error'));
    }
});

router.post('/api/v1/gcubes/modify', async (req, res) => {
  const { userId, amount, reason } = req.body;
  if (!validateUserId(userId) || typeof amount !== 'number' || amount === 0) {
    return res.json(apiResponse(3, 'Invalid parameters'));
  }

  try {
      const wealth = await Wealth.findOne({ userId });
      let current = wealth.diamonds
      let newBalance = current + amount;

      if (newBalance < 0) {
        return res.json(apiResponse(5, 'Insufficient balance'));
      }

      await Wealth.updateOne(
            { userId: userId },
            { $set: { diamonds: newBalance } }, 
            { upsert: true }
      );

      return res.json(apiResponse(1, 'Success', { userId: Number(userId), gcubes: newBalance }));
  } catch (err) {
    return res.json(apiResponse(4, 'Internal server error'));
  }
});

router.get('/api/v1/game/data', async (req, res) => {
    try {
        const { userId, subKey, tableName } = req.query;
        if (!userId || !subKey || !validateTableName(tableName)) {
            return res.json(apiResponse(3, 'PARAM ERROR'));
        }

        // tableName is used to allow multiple "tables" via sub-collections
        // We'll store everything in the same UserData collection; tableName is ignored
        // but kept for API parity. If you prefer separate collections per tableName,
        // we can dynamic-create models — but that'll complicate this single-file.

        const doc = await UserData.findOne({ userId: Number(userId), subKey: String(subKey) }).lean();

        return res.json(apiResponse(1, 'Success', doc ? {
            userId: Number(userId),
            subKey: Number(subKey),
            data: doc.data,
        } : null));
    } catch (err) {
        console.error('GET /data error:', err);
        res.json(apiResponse(4, 'INNER ERROR'));
    }
});

router.post('/api/v1/game/data', async (req, res) => {
    try {
        const { tableName } = req.query;
        const dataArr = req.body;

        if (!validateTableName(tableName) || !Array.isArray(dataArr) || dataArr.length === 0) {
            return res.json(apiResponse(3, 'PARAM ERROR'));
        }

        const ops = dataArr.map(({ userId, subKey, data }) => {
            if (userId === undefined || subKey === undefined || data === undefined) throw new Error('PARAM ERROR');
            return {
                updateOne: {
                    filter: { userId: Number(userId), subKey: String(subKey) },
                    update: { $set: { data: data, updatedAt: new Date() } },
                    upsert: true,
                }
            };
        });

        await UserData.bulkWrite(ops);
        return res.json(apiResponse(1, 'Success'));
    } catch (err) {
        console.error('POST /data error:', err.message);
        return res.json(apiResponse(4, 'INNER ERROR'));
    }
});

router.get('/api/v1/data/init', async (req, res) => {
    try {
        await UserData.init();
        res.json({ code: 1, message: 'UserData collection ready (index ensured)' });
    } catch (err) {
        console.error('/api/v1/data/init error:', err);
        res.json({ code: 4, message: 'INNER ERROR', detail: err.message });
    }
});

router.get('/pay/i/api/v1/wealth/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) return res.json({ code: 3, message: 'PARAM ERROR', data: null });
        const wealthData = await Wealth.findOne({ userId });
        const wealth = {
            diamonds: wealthData.diamonds,
            gDiamonds: wealthData.diamonds,
            ngDiamonds: wealthData.diamonds,
            gold: wealthData.gold
        };

        res.json({
            code: 1,
            message: 'SUCCESS',
            data: {
                userId: Number(userId),
                ...wealth
            }
        });
    } catch (err) {
        console.error('/pay/i/api/v1/wealth/users/:userId error:', err);
        res.json({ code: 4, message: 'INNER ERROR', data: null });
    }
});

router.post('/api/v1/game/log', async (req, res) => {
    try {
        const { tableName } = req.query;
        const logArr = req.body;

        if (!validateTableName(tableName) || !Array.isArray(logArr) || logArr.length === 0) {
            return res.json(apiResponse(3, 'PARAM ERROR'));
        }

        const docs = logArr.map(({ userId, serverInfo, gameType, dataAction, data }) => {
            if (userId === undefined || serverInfo === undefined || gameType === undefined || dataAction === undefined || data === undefined) throw new Error('PARAM ERROR');
            return {
                userId: Number(userId),
                serverInfo,
                gameType: String(gameType),
                dataAction: String(dataAction),
                data,
            };
        });

        await GameLog.insertMany(docs);
        return res.json(apiResponse(1, 'Success'));
    } catch (err) {
        console.error('POST /log error:', err.message);
        return res.json(apiResponse(4, 'INNER ERROR'));
    }
});

router.post('/pay/api/v1/pay/users/purchase/game/props', async (req, res) => {
    try {
        const userId = String(req.body?.userId || req.query?.userId || '16');
        const propsId = Number(req.body?.propsId || req.query?.propsId || 0);
        const quantity = Number(req.body?.quantity || req.query?.quantity || 1);
        const currencyNum = Number(req.body?.currency || req.query?.currency || 1);

        const currencyMap = { 1: 'diamonds', 2: 'gold' };
        const currencyKey = currencyMap[currencyNum] || 'diamonds';

        let wealth = await Wealth.findOne({ userId });
        if (!wealth) {
            wealth = new Wealth({
                userId,
                clanGold: 0,
                diamonds: 0,
                gold: 0
            });
        }

        if (wealth[currencyKey] >= quantity) {
            wealth[currencyKey] -= quantity;
        } else {
            return res.status(200).json({
                code: 2,
                message: 'Not enough balance',
                data: {
                    userId,
                    diamonds: wealth.diamonds,
                    gold: wealth.gold
                }
            });
        }
        await wealth.save();

        res.json({
            code: 1,
            message: 'Success',
            data: {
                userId,
                propsId,
                quantity,
                diamonds: wealth.diamonds,
                gold: wealth.gold
            }
        });

    } catch (err) {
        console.error('Purchase API error:', err);
        res.json({
            code: 1,
            message: 'Success',
            data: {
                userId: '16',
                propsId: 0,
                quantity: 0,
                diamonds: 0,
                gold: 0
            }
        });
    }
});

module.exports = router;