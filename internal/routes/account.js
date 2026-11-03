const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const User = require('../models/user-model');
const Account = require('../models/account-model');
const ClanMember = require('../models/clanMember-model');

const { jwtSign } = require('../common/helpers/JwtHelper');
const serverConfiguration = require('../server-configuration');
const VipManager = require('../common/helpers/vipHelper');
const ActivityManager = require('../common/helpers/activityHelper');
const WealthManager = require('../common/helpers/wealthHelper');
const policyConfig = require('../config/policies');

router.post('/api/v1/app/set-password', async (req, res) => {
    try {
        const { password } = req.body;
        const userId = req.headers.userid;

        if (!userId || !password) {
            return res.status(400).json({
                code: 6,
                message: 'Bad request: Missing userId or password',
                data: null
            });
        }

        const user = await Account.findOne({ userId });
        if (!user) {
            return res.status(404).json({
                code: 108,
                message: 'User not found',
                data: null
            });
        }

        const salt = await bcrypt.genSalt(8);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
    } catch (err) {
        console.error('Error in set-password:', err);
        res.status(500).json({ code: 4, message: 'INNER ERROR', data: null });
    }
});

router.post('/api/v1/app/renew', async (req, res) => {
    try {
        if (policyConfig.disableAccountCreation) {
            return res.status(403).json({
                code: 403,
                message: 'Account creation is disabled by policy',
                data: null
            });
        }

        const accountCount = await Account.countDocuments();
        const userId = (16 + accountCount * 16).toString();

        const { token } = await jwtSign(userId);

        const newAccount = new Account({
            userId,
            accessToken: token,
            creationTime: new Date(),
            lastSeen: new Date(),
            email: ''
        });

        await newAccount.save();

        res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: { userId, accessToken: token }
        });
    } catch (err) {
        console.error('Error in renew:', err);
        res.status(500).json({ code: 4, message: 'INNER ERROR', data: null });
    }
});

router.post('/api/v1/user/register', async (req, res) => {
    try {
        const { nickName, sex } = req.body;
        const userId = req.headers.userid;

        if (!nickName || !sex) {
            return res.status(400).json({
                code: 6,
                message: 'Bad request: Missing nickname or sex',
                data: null
            });
        }

        if (nickName.length > serverConfiguration.user.userNicknameMax) {
            return res.status(200).json({
                code: 60001,
                message: 'Nickname exceeds maximum length',
                data: null
            });
        }

        if (nickName.length < serverConfiguration.user.userNicknameMin) {
            return res.status(200).json({
                code: 60002,
                message: 'Nickname below minimum length',
                data: null
            });
        }

        const account = await Account.findOne({ userId });
        if (account && !account.password) {
            return res.status(200).json({
                code: 106,
                message: 'The profile does not have a password set',
                data: null
            });
        }

        if (await User.findOne({ nickname: nickName })) {
            return res.status(400).json({
                code: 7,
                message: 'Nickname already exists',
                data: null
            });
        }

        if (await User.findOne({ userId })) {
            return res.status(200).json({
                code: 110,
                message: 'The profile is already registered',
                data: null
            });
        }

        const user = new User({
            userId,
            nickname: nickName,
            sex,
            picUrl: '',
            birthday: '',
            introduction: '',
            isFreeNickname: true,
            status: 0,
            stopToTime: null,
            stopReason: null
        });

        await user.save();

        await Promise.all([
            VipManager.createVipSession(userId),
            ActivityManager.createActivitySession(userId),
            WealthManager.createWealthSession(userId)
        ]);

        const clanMember = new ClanMember({
            userId,
            clanId: 0,
            clanRole: 0,
            experience: 0,
            currentDiamond: 0,
            currentGold: 0,
            lastDonationDate: null
        });

        await clanMember.save();

        res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: {
                userId,
                nickName,
                sex,
                picUrl: '',
                introduction: '',
                birthday: '',
                hasPassword: true
            }
        });
    } catch (err) {
        console.error('Error in register:', err);
        res.status(500).json({ code: 4, message: 'INNER ERROR', data: null });
    }
});

router.post('/api/v1/app/login', async (req, res) => {
    try {
        const { uid, password } = req.body;

        if (!uid || !password) {
            return res.status(400).json({
                code: 6,
                message: 'Bad request: Missing uid or password',
                data: null
            });
        }

        const account = await Account.findOne({ userId: uid });
        const user = await User.findOne({ userId: uid });

        if (!account || !user) {
            return res.status(200).json({
                code: 102,
                message: 'User not found',
                data: null
            });
        }

        const isMatch = await bcrypt.compare(password, account.password);
        if (!isMatch) {
            return res.status(200).json({
                code: 108,
                message: 'Incorrect password',
                data: null
            });
        }

        const { token } = await jwtSign(uid);
        account.accessToken = token;
        await account.save();

        res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: {
                userId: uid,
                accessToken: token,
                hasPassword: true
            }
        });
    } catch (err) {
        console.error('Error in login:', err);
        res.status(500).json({ code: 4, message: 'INNER ERROR', data: null });
    }
});

module.exports = router;