const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const axios = require('axios');
const User = require('../models/user-model');
const Account = require('../models/account-model');
const Vip = require('../models/vip-model');
const locale = require('../common/helpers/localeHelper');
const DailyLoginStatuses = require("../common/constants/DailyLoginStatuses");
const signInConfig = require("../config/activity/signin/daily.json");
const logger = require("../common/logger");

async function getDiscordAvatarUrl(discordId) {
    try {
        const userRes = await axios.get(`https://discord.com/api/v10/users/${discordId}`, {
            headers: {
                Authorization: `Bot MTI2NzI4NTc3NjkyODk5NzM4Nw.GXkJ5a.JkO8M9dLBpLrS3biKmsKcPTURMGHsqMKvO_Qf4`
            }
        });
        const user = userRes.data;
        return user.avatar
            ? `https://cdn.discordapp.com/avatars/${discordId}/${user.avatar}.png?size=4096`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(discordId) % 5}.png`;
    } catch (err) {
        logger.warn("getDiscordAvatarUrl: " + err.message);
        return null;
    }
}

router.post('/api/v1/user/details/info', async (req, res) => {
    const userId = req.headers.userid;
    const user = await User.findOne({ userId });
    const account = await Account.findOne({ userId });
    if (!user || !account) return res.status(404).json({ code: 1, message: 'User not found', data: null });
    const userInfo = {
        userId: user.userId,
        sex: user.sex || 2,
        nickName: user.nickname,
        birthday: user.birthday || '',
        details: user.introduction,
        diamonds: user.diamonds,
        golds: user.gold,
        email: account.email,
        vip: user.vip,
        picUrl: user.picUrl || '',
        hasPassword: true,
        stopToTime: null
    };
    res.status(200).json({ code: 1, message: 'SUCCESS', data: userInfo });
});

router.post('/api/v1/user/details/info', async (req, res) => {
    const userId = req.headers.userid;
    const { oldName, newName } = req.query;
    if (!userId || !oldName || !newName) return res.status(400).json({ code: 6, message: 'Params missing', data: null });
    const user = await User.findOne({ userId });
    if (!user) return res.status(200).json({ code: 102, message: 'User not found', data: null });
    if (user.nickname !== oldName) return res.status(200).json({ code: 108, message: 'Incorrect nickname', data: null });
});

router.post('/api/v1/user/password/modify', async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.headers.userid;
    if (!newPassword || newPassword.trim() === '') return res.status(400).json({ code: 1, message: 'New password cannot be empty', data: null });
    const account = await Account.findOne({ userId });
    const user = await User.findOne({ userId });
    if (!account || !user) return res.status(404).json({ code: 1, message: 'User not found', data: null });
    const isMatch = await bcrypt.compare(oldPassword, account.password);
    if (!isMatch) return res.status(200).json({ code: 108, message: 'Incorrect old password', data: null });
    const saltRounds = await bcrypt.genSalt(8);
    account.password = await bcrypt.hash(newPassword, saltRounds);
    await account.save();
    res.status(200).json({ code: 1, message: 'SUCCESS', data: { userId: user.userId, nickName: user.nickname, diamonds: user.diamonds, gold: user.gold, picUrl: user.picUrl || '', vip: user.vip } });
});

router.post('/api/v1/emails/password/reset', async (req, res) => {
    const email = req.query.email;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ code: 1, message: 'Email not found', data: null });
    res.status(200).json({ code: 1, message: 'SUCCESS', data: { userId: user.userId, nickName: user.nickname, diamonds: user.diamonds, gold: user.gold, picUrl: user.picUrl || '', vip: user.vip } });
});

router.put('/api/v1/user/info', async (req, res) => {
    const userId = req.headers.userid;
    const { birthday, details } = req.body;
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ code: 1, message: 'User not found', data: null });
    if (details) user.introduction = details;
    if (birthday) user.birthday = birthday;
    await user.save();
    const userInfo = { userId: user.userId, sex: user.sex || 2, nickName: user.nickname, birthday: user.birthday || '', details: user.introduction, diamonds: user.diamonds, golds: user.gold, vip: user.vip, picUrl: user.picUrl || '', isFreeNickname: user.isFreeNickname || true, hasPassword: true, stopToTime: null };
    res.status(200).json({ code: 1, message: 'SUCCESS', data: userInfo });
});

router.get('/api/v1/user/nickName/free', async (req, res) => {
    const userId = req.headers.userid;
    const user = await User.findOne({ userId });
    res.status(200).json({ code: 1, message: 'SUCCESS', data: { currencyType: 1, quantity: 50, free: user.isFreeNickname } });
});

router.put('/api/v1/user/nickName', async (req, res) => {
    const userId = req.headers.userid;
    const newNickname = req.query.newName;
    const user = await User.findOne({ userId });
    if (!newNickname) return res.status(200).json({ code: 3, message: "Invalid parameter", data: null });
    if (await User.findOne({ nickname: newNickname })) return res.status(200).json({ code: 1003, message: "Nickname is already in use", data: null });
    if (user.nickname === newNickname) return res.status(200).json({ code: 3, message: "Invalid parameter", data: null });
    if (user.isFreeNickname) user.isFreeNickname = false;
    else {
        if (user.diamonds < 50) return res.status(200).json({ code: 5006, message: 'Not enough diamonds or gold', data: null });
        user.diamonds -= 50;
    }
    user.nickname = newNickname;
    await user.save();
    res.status(200).json({ code: 1, message: 'SUCCESS', data: { userId: user.userId, sex: user.sex || 2, nickName: user.nickname, birthday: user.birthday || '', details: user.introduction, diamonds: user.diamonds, golds: user.gold, vip: user.vip, picUrl: user.picUrl || '', hasPassword: true, stopToTime: null } });
});

router.post('/api/v1/user/language', async (req, res) => {
    const userId = req.headers.userid;
    const languageName = req.query.language;
    if (!languageName) return res.status(200).json({ code: 6, message: "Invalid parameter", data: null });
    await locale.setUserLanguage(userId, languageName);
    res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
});

router.get('/api/v1/app/auth-token', async (req, res) => {
    const userId = req.headers.userid;
    res.status(200).json({ code: 1, message: 'SUCCESS', data: userId });
});

router.get('/api/v1/user/player/info', async (req, res) => {
    const userId = req.headers.userid;
    const vip = await Vip.findOne({ userId });
    let formattedDate = null;
    if (vip?.expireDate) {
        const date = new Date(vip.expireDate);
        const pad = n => n.toString().padStart(2, '0');
        formattedDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
    }
    res.status(200).json({ code: 1, message: 'SUCCESS', data: { vip, expireDate: formattedDate } });
});

router.put("/api/v1/user/icon", async (req, res) => {
    const discordId = req.query.discordId;
    const userId = req.headers.userid;
    if (!discordId) return res.status(200).json({ code: 3, message: "Invalid parameter", data: null });
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ code: 3, message: "User not found", data: null });
    const profileUrl = await getDiscordAvatarUrl(discordId);
    if (!profileUrl) return res.status(500).json({ code: 4, message: 'INNER ERROR', data: null });
    user.picUrl = profileUrl;
    await user.save();
    res.status(200).json({ code: 1, message: 'SUCCESS', data: { picUrl: user.picUrl } });
});

router.get("/api/v2/users/:userId/daily/sign/in", async (req, res) => {
    const currentDay = 0;
    const rewards = structuredClone(signInConfig);
    const rewardList = Object.values(rewards);
    for (let i = 0; i < rewardList.length; i++) if (currentDay > i) rewardList[i].status = DailyLoginStatuses.CLAIMED;
    rewardList[currentDay].status = DailyLoginStatuses.NOT_CLAIMED;
    res.status(200).json({ code: 1, message: 'SUCCESS', data: rewards });
});

router.put("/api/v2/users/:userId/daily/sign/in", async (req, res) => {
    logger.warn("PUT: DailySignIn Implementation Needed!");
    res.status(500).json({ code: 4, message: 'INNER ERROR', data: null });
});

module.exports = router;