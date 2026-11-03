const express = require('express');
const router = express.Router();

const aa = require('../config/firstrecharge');
const ab = require('../config/recharge');

const User = require('../models/user-model');
const Transaction = require('../models/transaction-model');
const Wealth = require('../models/wealth-model');

router.get('/api/v1/pay/payssion/flag', async (req, res) => {
    res.status(200).json({ code: 1, message: "SUCCESS", data: true });
});

router.get('/api/v1/wealth/user', async (req, res) => {
    try {
        const userId = req.headers.userid;
        const user = await Wealth.findOne({ userId });
        if (!user) {
            return res.status(404).json({ code: 0, message: 'Wealth data has not been added', data: null });
        }

        res.status(200).json({
            code: 1,
            message: "SUCCESS",
            data: {
                userId,
                golds: user.gold,
                diamonds: user.diamonds,
                clanGolds: user.clanGold
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 0, message: 'Server error', data: null });
    }
});

router.get('/api/v1/pay/products', async (req, res) => {
    try {
        res.status(200).json({ code: 1, message: "SUCCESS", data: ab });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 0, message: 'Server error', data: null });
    }
});

router.get('/api/v1/pay/products/vip', async (req, res) => {
    try {
        res.status(200).json({ code: 1, message: "SUCCESS", data: [] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 0, message: 'Server error', data: null });
    }
});

router.get('/api/v1/first/punch/reward', async (req, res) => {
    try {
        res.status(200).json({ code: 1, message: "SUCCESS", data: aa });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 0, message: 'Server error', data: null });
    }
});

function convertToUnixTimestamp(date) {
    if (date instanceof Date) return Math.floor(date.getTime() / 1000);
    return null;
}

router.get('/api/v1/wealth/record/users/:userId', async (req, res) => {
    try {
        const pageNo = parseInt(req.query.pageNo) || 0;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const userId = req.headers.userid;

        const transactions = await Transaction.find({ userId }).sort({ created: -1 });

        if (pageNo !== 0) {
            return res.status(200).json({
                code: 1,
                message: 'SUCCESS',
                data: { pageNo, pageSize, totalPage: 0, totalSize: 0, data: [] }
            });
        }

        const mappedTransactions = transactions.map(tx => ({
            ...tx.toObject(),
            created: convertToUnixTimestamp(tx.created)
        }));

        res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: {
                pageNo,
                pageSize,
                totalPage: 0,
                totalSize: mappedTransactions.length,
                data: mappedTransactions,
                other: null
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 0, message: 'Server error', data: null });
    }
});

module.exports = router;