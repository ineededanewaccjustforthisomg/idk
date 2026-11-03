const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Clan = require('../models/clan-model');
const ClanMember = require('../models/clanMember-model');
const ClanMessage = require('../models/clanMessage-model');
const ClanDonation = require('../models/clanDonation-model');

const User = require('../models/user-model');
const Account = require('../models/account-model');
const Vip = require('../models/vip-model');
const WealthManager = require('../common/helpers/wealthHelper.js');

const clanConfig = require('../config/clan.json'); // adjust as needed
const Currencies = require('../constants/Currencies.js');
const TribeRoles = require('../constants/ClanRoles.js');

const ClanMessageTypes = require('../constants/ClanMessageTypes');
const RequestStatuses = require('../constants/RequestStatuses');
const TribePromotionTypes = require('../constants/ClanPromotionTypes');

const serverConfiguration = require('../server-configuration');

/*
    **HIGHLY UNSTABLE CODE**
    No helper is used in this code, 
    highly unstable and hardcoded.
*/

// Made by Fijlow 10/17/25

router.get('/api/v1/clan/tribe', async (req, res) => {
    const { clanId } = req.query;
    
    if (!clanId) {
       res.status(200).json({ code: 6, message: 'Invalid parameter', data: null });
       return;
    }
    
    const clanMembers = await ClanMember.find({ clanId: clanId, clanRole: { $in: [10, 20] } });

    const clan = await Clan.findOne({ clanId: clanId });
    if (!clan) {
        return res.status(200).json({ code: 7011, message: 'The provided tribe does not exist', data: null });
    }

    const clanMembersResponse = await Promise.all(
        clanMembers.map(async (member) => {
            const userInfo = await User.findOne({ userId: member.userId });

            return {
                userId: member.userId,
                role: member.clanRole,
                headPic: userInfo?.picUrl || "",
                nickName: userInfo?.nickname || "",
                colorfulNickName: userInfo?.colorfulNickName || null,
                avatarFrame: userInfo?.avatarFrame || "frame_bronze.png",
            };
        })
    );

    const responseData = {
        clanId: clan.clanId,
        name: clan.name,
        headPic: clan.headPic,
        tags: clan.tags,
        details: clan.details,
        experience: clan.experience,
        level: clan.level,
        currentCount: clan.currentCount,
        maxCount: clan.maxCount,
        clanMembers: clanMembersResponse,
        freeVerify: clan.freeVerify,
        region: clan.region
    };

    return res.status(200).json({ code: 1, message: 'SUCCESS', data: responseData });
});

router.get('/api/v1/clan/tribe/bulletin', async (req, res) => {
    const userId = req.headers['userid'];

    const user = await ClanMember.findOne({ userId });

    if (!user) {
        return res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
    }

    const clan = await Clan.findOne({ clanId: user.clanId });

    if (!clan) {
        return res.status(200).json({ code: 7000, message: 'You are not in a tribe', data: null });
    }

    const responseData = {
        content: clan.notice,
        updateTime: 999999999
    };

    return res.status(200).json({ code: 1, message: 'SUCCESS', data: responseData });
});

router.get('/api/v1/clan/tribe/member', async (req, res) => {
    const userId = req.headers['userid'];
    
    const user = await ClanMember.findOne({ userId });

    if (!user) {
        return res.status(200).json({ code: 404, message: 'User not found with the provided userId.', data: null });
    }

    const clan = await Clan.findOne({ clanId: user.clanId });

    if (!clan) {
        return res.status(200).json({ code: 7000, message: 'You are not in a tribe', data: null });
    }

    const clanMembers = await ClanMember.find({ clanId: user.clanId }).sort({ experience: -1 });

    const memberDetails = await Promise.all(
        clanMembers.map(async (member) => {
            const userInfo = await User.findOne({ userId: member.userId });
            return {
                userId: member.userId,
                role: member.clanRole,
                experience: member.experience,
                nickName: userInfo?.nickname || '',
                headPic: userInfo?.picUrl || '',
                vip: userInfo?.vip || 0
            };
        })
    );

    return res.status(200).json({ code: 1, message: 'SUCCESS', data: memberDetails });
});

router.get('/api/v1/clan/tribe/donation', async (req, res) => {
    const userId = req.headers['userid'];

    const user = await User.findOne({ userId });
    if (!user) {
        return res.status(200).json({ code: 404, message: 'User not found with the provided userId.', data: null });
    }

    const tribeMember = await ClanMember.findOne({ userId });
    if (!tribeMember) {
        return res.status(200).json({ code: 9, message: 'Tribe data not found for this user', data: null });
    }

    const clan = await Clan.findOne({ clanId: tribeMember.clanId });
    if (!clan) {
        return res.status(200).json({ code: 7000, message: 'You are not in a tribe', data: null });
    }

    const today = new Date();
    const lastDonationDate = new Date(tribeMember.lastDonationDate);

    if (lastDonationDate.toDateString() !== today.toDateString()) {
        tribeMember.currentGold = 0;
        tribeMember.currentDiamond = 0;
        tribeMember.lastDonationDate = today;
        await tribeMember.save();
    }
    
    const tribeDonation = new ClanDonation(); 
    const tribeDonationInfo = await tribeDonation.getInfo(userId);
    tribeDonationInfo.maxExperience = clan.maxExperience;

    return res.status(200).json({ code: 1, message: 'SUCCESS', data: tribeDonationInfo });
});

router.put('/api/v1/clan/tribe', async (req, res) => {
    const userId = req.headers['userid'];
    const { name, details, tags } = req.body;

    if (!name || !details || !tags) {
        console.log('6');
        res.status(200).json({ code: 6, message: 'Invalid parameter', data: null });
        return;
    }

    if (name.length > serverConfiguration.tribe.tribeNameMax) {
        console.log('10001');
        return res.status(400).json({
            code: 10001,
            message: `The server rules forbidden setting a name longer than ${serverConfiguration.tribe.tribeNameMax} characters`,
            data: null
        });
    }

    if (details.length > serverConfiguration.tribe.tribeDetailsMax) {
        console.log('10002');
        return res.status(400).json({
            code: 10002,
            message: `The server rules forbidden setting details longer than ${serverConfiguration.tribe.tribeDetailsMax} characters`,
            data: null
        });
    }

    if (tags.length > serverConfiguration.tribe.tribeMaxTags) {
        console.log('10003');
        return res.status(400).json({
            code: 10003,
            message: `The server rules forbidden using more than ${serverConfiguration.tribe.tribeMaxTags} tags`,
            data: null
        });
    }
    
    for (const tag of tags) {
        if (tag.length > serverConfiguration.tribe.tagsMaxLength) {
            console.log('10004');
            return res.status(400).json({
                code: 10004,
                message: `The server rules forbidden setting tags digits longer than ${serverConfiguration.tribe.tagsMaxLength} characters`,
                data: null
            });
        }
    }

    const user = await ClanMember.findOne({ userId });
    if (!user) {
        console.log('404');
        return res.status(200).json({ code: 404, message: 'User not found', data: null });
    }

    const clan = await Clan.findOne({ clanId: Number(user.clanId) });
    if (!clan) {
        console.log('7000');
        return res.status(200).json({ code: 7000, message: 'You are not in a tribe', data: null });
    }

    if (clan.name !== name) {
        const existingClan = await Clan.findOne({ name });
        if (existingClan) {
            console.log('1109');
            return res.status(200).json({ code: 1109, message: 'Clan name already exists', data: null });
        }
    }

    if (![10, 20].includes(user.clanRole)) {
        console.log('7002');
        return res.status(200).json({ code: 7002, message: 'Insufficient permissions to update clan', data: null });
    }

    Object.assign(clan, { name, details, tags });
    await clan.save();
    
    const data = {
        clanId: clan.clanId,
        name: clan.name,
        headPic: clan.headPic,
        tags: clan.tags,
        details: clan.details,
        experience: clan.experience,
        level: clan.level,
        role: user.clanRole,
        freeVerify: clan.freeVerify
    };
    
    console.log('1');
    return res.status(200).json({ code: 1, message: 'SUCCESS', data: data });
});

router.post('/api/v1/clan/tribe/bulletin', async (req, res) => {
    const userId = req.headers['userid'];
    const { content } = req.body;

    if (!content) {
        res.status(200).json({ code: 6, message: 'Invalid parameter', data: null });
        return;
    }

    if (content.length > serverConfiguration.tribe.noticeBoardMaxContent) {
        return res.status(400).json({
            code: 10001,
            message: `The server rules forbidden setting a content longer than ${serverConfiguration.tribe.noticeBoardMaxContent} characters`,
            data: null
        });
    }

    const user = await ClanMember.findOne({ userId });
    if (!user) {
        return res.status(200).json({ code: 404, message: 'User not found', data: null });
    }

    const clan = await Clan.findOne({ clanId: user.clanId });
    if (!clan) {
        return res.status(200).json({ code: 7000, message: 'You are not in a tribe', data: null });
    }

    if (user.clanRole !== 20) {
        return res.status(200).json({ code: 7002, message: 'Insufficient permissions to update bulletin', data: null });
    }

    clan.notice = content;
    await clan.save();

    const data = { content: clan.notice, updateTime: Date.now() };

    return res.status(200).json({ code: 1, message: 'SUCCESS', data });
});

router.get('/api/v1/clan/tribe/base', async (req, res) => {
    const userId = req.headers['userid'];

    if (!userId) {
       res.status(200).json({ code: 6, message: 'Invalid parameter', data: null });
       return;
    }

    const user = await ClanMember.findOne({ userId });
    if (!user) {
        return res.status(200).json({ code: 404, message: 'User not found.', data: null });
    }

    const clan = await Clan.findOne({ clanId: user.clanId });
    if (!clan) {
        return res.status(200).json({ code: 404, message: 'You are not in a tribe.', data: null });
    }
    
    const clanMembers = await ClanMember.find({ clanId: user.clanId }).sort({ experience: -1 });

    const memberDetails = await Promise.all(
        clanMembers.map(async (member) => {
            const userInfo = await User.findOne({ userId: member.userId });
            return {
                userId: member.userId,
                role: member.clanRole,
                experience: member.experience,
                nickName: userInfo?.nickname || '',
                headPic: userInfo?.picUrl || '',
                vip: userInfo?.vip || 0
            };
        })
    );

    const data = {
        clanId: clan.clanId,
        name: clan.name,
        headPic: clan.headPic,
        tags: clan.tags,
        clanMembers: memberDetails,
        details: clan.details,
        experience: clan.experience,
        maxExperience: clan.maxExperience,
        level: clan.level,
        role: clan.role,
        freeVerify: clan.freeVerify,
        currentCount: clan.currentCount,
        maxCount: clan.maxCount,
        maxElderCount: clan.maxElderCount,
        region: clan.region,
    };

    return res.status(200).json({ code: 1, message: 'SUCCESS', data });
});

router.get('/api/v1/clan/tribe/id', async (req, res) => {
    const userId = req.headers['userid'];
    
    if (!userId) {
       res.status(200).json({ code: 6, message: 'Invalid parameter', data: null });
       return;
    }

    const user = await ClanMember.findOne({ userId });
    if (!user) {
        return res.status(200).json({ code: 404, message: 'User not found.', data: null });
    }

    return res.status(200).json({ code: 1, message: 'SUCCESS', data: user.clanId });
});

router.get('/api/v1/clan/tribe/recommendation', async (req, res) => {
    const userId = req.headers['userid'];
    
    if (!userId) {
       res.status(200).json({ code: 6, message: 'Invalid parameter', data: null });
       return;
    }

    const clans = await Clan.aggregate([{ $sample: { size: 10 } }]);

    const data = await Promise.all(
        clans.map(async (clan) => {
            const user = await User.findOne({ userId: clan.chiefId });

            return {
                chiefId: clan.chiefId,
                chiefNickName: user ? user.nickname : '',
                headPic: clan.headPic || '',
                detail: clan.details,
                freeVerify: clan.freeVerify,
                isFirst: false,
                level: clan.level,
                clanId: clan.clanId,
                currentCount: clan.currentCount,
                maxCount: clan.maxCount,
                name: clan.name || null,
            };
        })
    );

    return res.status(200).json({ code: 1, message: 'SUCCESS', data });
});

router.post('/api/v1/clan/tribe', async (req, res) => {
    const userId = req.headers['userid'];
    
    const { name, details, tags } = req.body;

    if (!name || !details || !tags) {
        console.log('6');
        res.status(200).json({ code: 6, message: 'Invalid parameter', data: null });
        return;
    }
    
    if (name.length > serverConfiguration.tribe.tribeNameMax) {
        console.log('10001');
        return res.status(200).json({             
            code: 10001,
            message: `The server rules forbid setting a name longer than ${serverConfiguration.tribe.tribeNameMax} characters`,
            data: null,
        });
    }

    if (details.length > serverConfiguration.tribe.tribeDetailsMax) {
        console.log('10002');
        return res.status(200).json({
            code: 10002,
            message: `The server rules forbid setting details longer than ${serverConfiguration.tribe.tribeDetailsMax} characters`,
            data: null,
        });
    }

    if (tags.length > serverConfiguration.tribe.tagsMax) {
        console.log('10003');
        return res.status(200).json({
            code: 10003,
            message: `The server rules forbid using more than ${serverConfiguration.tribe.tagsMax} tags`,
            data: null,
        });
    }

    for (const tag of tags) {
        if (tag.length > serverConfiguration.tribe.tagsMaxLength) {
            console.log('10004');
            return res.status(200).json({
                code: 10004,
                message: `The server rules forbid setting tags longer than ${serverConfiguration.tribe.tagsMaxLength}) characters`,
                data: null,
            });
        }
    }

    const user = await ClanMember.findOne({ userId });
    if (!user) {
        console.log('404');
        return res.status(200).json({ code: 404, message: 'User not found.', data: null });
    }

    if (user.getClanId() !== 0) {
        console.log('7010');
        return res.status(200).json({ code: 7010, message: 'You are already in a tribe', data: null });
    }

    const existingClanName = await Clan.findOne({ name });
    if (existingClanName) {
        console.log('7002');
        return res.status(200).json({ code: 7002, message: 'Clan name already exists. Please choose another.', data: null });
    }
    
    if (WealthManager.getGold(userId) >= clanConfig.priceGold) {
        await WealthManager.removeWealth(userId, Currencies.GOLD, clanConfig.priceGold);
    } else if (WealthManager.getDiamonds(userId) >= clanConfig.priceDiamond) {
        await WealthManager.removeWealth(userId, Currencies.DIAMOND, clanConfig.priceDiamond);
    } else  {
        return res.status(200).json({
            code: 5006,
            message: "Not enough diamonds or gold",
            data: null
        });
    }

    const clanId = Math.floor(1000 + Math.random() * 9000);
    const maxCount = 30;

    const newClan = new Clan();
    newClan.setClanId(clanId);
    newClan.setChiefId(userId);
    newClan.setName(name);
    newClan.setTags(tags);
    newClan.setDetails(details);
    newClan.setMaxCount(maxCount);
    newClan.setLevel(1);
    newClan.setFreeVerify(0);
    newClan.setExperience(0);
    newClan.setMaxExperience(50000);
    newClan.setCurrentCount(1);

    await newClan.save();

    user.setClanId(clanId);
    user.setClanRole(TribeRoles.CHIEF);
    await user.save();
    
    return res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
});

router.put('/api/v1/clan/free/verification', async (req, res) => {
    const userId = req.headers['userid'];
    const { freeVerify } = req.query;

    if (!freeVerify) {
        res.status(200).json({ code: 6, message: 'Invalid parameter', data: null });
        return;
    }

    const user = await ClanMember.findOne({ userId });

    const clan = await Clan.findOne({ clanId: user.clanId });
    if (!clan) {
        return res.status(200).json({ code: 7000, message: 'You are not in a tribe', data: null });
    }

    if (user.getClanRole < TribeRoles.CHIEF) {
        return res.status(200).json({ code: 7002, message: 'You do not have permission to change verify', data: null });
    }

    if (freeVerify !== '0' && freeVerify !== '1') {
        return res.status(200).json({ code: 15, message: 'Invalid freeVerify, it can be either 0 or 1', data: null });
    }

    clan.setFreeVerify(freeVerify);
    await clan.save();

    const responseData = {
        clanId: clan.clanId,
        name: clan.name,
        headPic: clan.headPic,
        tags: clan.tags,
        details: clan.details,
        experience: clan.experience,
        level: clan.level,
        role: user.clanRole,
        freeVerify: clan.freeVerify,
    };

    return res.status(200).json({ code: 1, message: 'SUCCESS', data: responseData });
});

router.get('/api/v1/clan/tribe/currency', async (req, res) => {
    const userId = req.headers['userid'];

    const user = await ClanMember.findOne({ userId });
    
    const tribeGold = await WealthManager.getWealth(userId, 3);

    return res.status(200).json({ code: 1, message: 'SUCCESS', data: tribeGold });
});

router.post('/api/v1/clan/tribe/member', async (req, res) => {
    const userId = req.headers['userid'];
    const { clanId, msg } = req.body;

    if (!clanId) {
        res.status(200).json({ code: 6, message: 'Invalid parameter', data: null });
        return;
    }
    
    const user = await ClanMember.findOne({ userId });

    const gamemods = await Clan.findOne({ clanId });
    if (!gamemods) {
        return res.status(200).json({ code: 7023, message: 'The provided tribe does not exist', data: null });
    }

    if (user.getClanId() !== 0) {
       return res.status(200).json({ code: 7010, message: 'You are already in a tribe', data: null });
    }

    if (gamemods.currentCount === gamemods.maxCount) {
        return res.status(200).json({
            code: 7005,
            message: 'Tribe has reached the maximum count and cannot accept new members',
            data: null,
        });
    }
    
    const userinfo = await User.findOne({ userId });
    
    if (gamemods.freeVerify == 1) {
        gamemods.currentCount += 1;
        await gamemods.save();
    
        user.setClanId(gamemods.clanId);
        user.setClanRole(TribeRoles.MEMBER);
        await user.save();
    } else if (gamemods.freeVerify == 0) {
        const isAlreadyApply = await ClanMessage.findOne({ userId, clanId, type: ClanMessageTypes.JOIN_REQUEST, status: RequestStatuses.PENDING });
        if (!isAlreadyApply) {
            if (msg == null) {
                const randomId = Math.floor(Math.random() * 100000) + 100000;
                const tribeMessage = new ClanMessage({
                    id: randomId,
                    clanId: clanId,
                    headPic: userinfo.picUrl,
                    userId: userinfo.userId,
                    nickName: userinfo.nickname,
                    type: ClanMessageTypes.JOIN_REQUEST,
                    status: RequestStatuses.PENDING,
                    msg: `I want to join`,
                    sentDate: Date.now()
                });
                await tribeMessage.save();
            } else {
                const randomId = Math.floor(Math.random() * 100000) + 100000;
                const tribeMessage = new ClanMessage({
                    id: randomId,
                    clanId: clanId,
                    headPic: userinfo.picUrl,
                    userId: userinfo.userId,
                    nickName: userinfo.nickname,
                    type: ClanMessageTypes.JOIN_REQUEST,
                    status: RequestStatuses.PENDING,
                    msg: msg,
                    sentDate: Date.now()
                });
                await tribeMessage.save();
            }
        } else {
            return res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
        }
    }

    return res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
});

router.delete('/api/v1/clan/tribe/member', async (req, res) => {
    const userId = req.headers['userid'];
     const { clanId } = req.query;

    if (!clanId) {
        res.status(200).json({ code: 6, message: 'Invalid parameter', data: null });
        return;
    }

    const user = await ClanMember.findOne({ userId });
    if (!user) {
        return res.status(200).json({ code: 404, message: 'User not found.', data: null });
    }

    if (user.getClanId() === 0) {
        return res.status(200).json({ code: 7000, message: 'You are not in a tribe', data: null });
    }

    if (user.getClanRole() === TribeRoles.CHIEF) {
        return res.status(200).json({ code: 7020, message: 'Chief cannot quit the tribe', data: null });
    }

    const gamemods = await Clan.findOne({ clanId });
    if (!gamemods) {
        return res.status(200).json({ code: 7000, message: 'You are not in a tribe', data: null });
    }
    
    const userinfo = await User.findOne({ userId });

    gamemods.currentCount -= 1;
    await gamemods.save();

    user.setClanId(0);
    user.setClanRole(0);
    user.setExperience(0);
    await user.save();
    
    const randomId = Math.floor(Math.random() * 100000) + 100000;
    const tribeMessage = new ClanMessage({
        id: randomId,
        clanId: gamemods.clanId,
        headPic: userinfo.picUrl,
        userId: userinfo.userId,
        nickName: userinfo.nickname,
        type: ClanMessageTypes.MEMBER_LEFT,
        status: 0,
        msg: `You have left the tribe`,
        sentDate: Date.now()
    });
    await tribeMessage.save();

    return res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
});

router.get('/api/v1/clan/tribe/donation/history', async (req, res) => {
    const userId = req.headers['userid'];
    const pageNo = parseInt(req.query.pageNo) || 0;

    const pageSize = 999999999;
    
    const userInfo = await ClanMember.findOne({ userId });

    if (!userInfo) {
        return res.status(200).json({ code: 404, message: 'User not found with the provided userId.', data: null });
    }

    const clanId = userInfo.clanId;

    if (pageNo !== 0) {
        return res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: {
                pageNo,
                pageSize,
                totalPage: 0,
                totalSize: 0,
                data: []
            }
        });
    }

    const donations = await ClanDonation.find({ clanId }).skip(pageNo * pageSize).limit(pageSize);

    donations.sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalSize = await ClanDonation.countDocuments({ clanId });
    const totalPage = Math.ceil(totalSize / pageSize);

    const responseData = donations.map(donation => ({
        userId: donation.userId,
        nickName: donation.nickName,
        type: donation.type,
        quantity: donation.quantity,
        tribeCurrencyGot: donation.tribeCurrencyGot,
        experienceGot: donation.experienceGot,
        date: donation.date
    }));

    return res.status(200).json({
        code: 1,
        message: 'SUCCESS',
        data: {
            pageNo,
            pageSize,
            totalPage,
            totalSize,
            data: responseData
        }
    });
});

router.post('/api/v1/clan/tribe/donation', async (req, res) => {
    const userId = req.headers['userid'];
    const { currency, quantity } = req.query;

    if (!currency || !quantity) {
        res.status(200).json({ code: 6, message: 'Invalid parameter', data: null });
        return;
    }

    const parsedQuantity = parseFloat(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        return res.status(200).json({ code: 3, message: 'Quantity must be a positive number.', data: null });
    }

    const clanMember = await ClanMember.findOne({ userId: userId });
    if (clanMember.getClanId() === 0) {
        return res.status(200).json({ code: 7000, message: 'You are not in a tribe', data: null });
    }

    const vip = await Vip.findOne({ userId: userId });
    const clan = await Clan.findOne({ clanId: clanMember.clanId });
    const clanLevelConfig = clanConfig.levels[clan.level];

    if (clan.experience === 50000000) {
        return res.status(200).json({ code: 7011, message: 'The tribe is at maximum level', data: null });
    }

    const clanDonation = new ClanDonation({ userId: userId, clanId: clan.clanId });
    const clanDonationInfo = await clanDonation.getInfo(userId);

    let experienceGot, tribeCurrencyGot, currentDonation;

    switch (currency) {
        case '1':
            if (clanDonationInfo.currentDiamond + parsedQuantity > clanDonationInfo.maxDiamond) {
                return res.status(200).json({ code: 7011, message: 'Exceed max diamond donation limit.', data: null });
            }
            
            currentDonation = clanDonationInfo.currentDiamond + parsedQuantity;
            experienceGot = parsedQuantity * clanLevelConfig.diamondExperienceRate * clanConfig.vipBoosts[vip.getLevel()].diamondExperienceRate;
            tribeCurrencyGot = parsedQuantity * clanLevelConfig.diamondCurrencyRate * clanConfig.vipBoosts[vip.getLevel()].diamondCurrencyRate;
            
            clanMember.currentDiamond += parsedQuantity;
            break;
        case '2':
            if (clanDonationInfo.currentGold + parsedQuantity > clanDonationInfo.maxGold) {
                return res.status(200).json({ code: 7011, message: 'Exceed max gold donation limit.', data: null });
            }
            
            currentDonation = clanDonationInfo.currentGold + parsedQuantity;
            experienceGot = parsedQuantity * clanLevelConfig.goldExperienceRate * clanConfig.vipBoosts[vip.getLevel()].goldExperienceRate;
            tribeCurrencyGot = parsedQuantity * clanLevelConfig.goldCurrencyRate * clanConfig.vipBoosts[vip.getLevel()].goldCurrencyRate;
            
            clanMember.currentGold += parsedQuantity;
            break;
        default:
            return res.status(200).json({ code: 3, message: 'The currency is not valid', data: null });
    }

    const hasEnoughCurrency = await WealthManager.isWealthSufficient(userId, currency, parsedQuantity);
    if (!hasEnoughCurrency) {
        return res.status(200).json({ code: 7011, message: 'Insufficient money to donate to this tribe', data: null });
    }

    await WealthManager.removeWealth(userId, currency, parsedQuantity);
    await WealthManager.addWealth(userId, '3', tribeCurrencyGot);

    const user = await User.findOne({ userId: userId });

    clanDonation.setQuantity(currentDonation);
    clanDonation.setExperienceGot(experienceGot);
    clanDonation.setTribeCurrencyGot(tribeCurrencyGot);
    clanDonation.setType(currency);
    clanDonation.setNickname(user.nickname);
    clanDonation.setDate(Date.now());
    await clanDonation.save();

    clanMember.experience += experienceGot;
    clanMember.lastDonationDate = Date.now();
    await clanMember.save();

    await clan.addExperience(experienceGot);
    await clan.save();

    return res.status(200).json({
        code: 1,
        message: 'SUCCESS',
        data: {
            experienceGot: experienceGot,
            tribeCurrencyGot: tribeCurrencyGot
        }
    });
});

router.put('/api/v1/clan/tribe/member', async (req, res) => {
    const userId = req.headers['userid'];
    const { otherId } = req.query;
    
    const type = parseInt(req.query.type) || 0;

    if (!otherId || !type) {
        res.status(200).json({ code: 6, message: 'Invalid parameter', data: null });
        return;
    }

    const user = await ClanMember.findOne({ userId: otherId });
    if (!user) {
        return res.status(200).json({ code: 8, message: 'User does not exist in ClanMember', data: null });
    }

    const userinfo = await User.findOne({ userId: otherId });
    if (!userinfo) {
        return res.status(200).json({ code: 108, message: 'The user does not exist', data: null });
    }

    const headerUser = await ClanMember.findOne({ userId });
    if (!headerUser || headerUser.clanId !== user.clanId) {
        return res.status(200).json({ code: 7022, message: 'This user is not in the same tribe as you', data: null });
    }

    if (headerUser.clanRole !== TribeRoles.CHIEF) {
        return res.status(200).json({ code: 7002, message: 'No permission to modify members, only chief', data: null });
    }
    
    const randomId = Math.floor(Math.random() * 100000) + 100000;
    const tribeMessage = new ClanMessage();

    switch (type) {
        case TribePromotionTypes.ELDER:
            const elders = await ClanMember.find({ clanId: user.clanId, clanRole: TribeRoles.ELDER });
            if (elders.length >= 5) {
                return res.status(200).json({ code: 7010, message: 'Max elder count exceeded', data: null });
            }
            user.clanRole = TribeRoles.ELDER;
            
            tribeMessage.setId(randomId);
            tribeMessage.setClanId(headerUser.clanId);
            tribeMessage.setHeadPic(userinfo.picUrl);
            tribeMessage.setUserId(userinfo.userId);
            tribeMessage.setNickname(userinfo.nickname);
            tribeMessage.setType(ClanMessageTypes.ELDER_PROMOTION);
            tribeMessage.setStatus(0);
            tribeMessage.setMsg('');
            tribeMessage.setSentDate(Date.now());

            await tribeMessage.save();
            break;

        case TribePromotionTypes.MEMBER:
            user.clanRole = TribeRoles.MEMBER;
            break;

        case TribePromotionTypes.CHIEF:
            headerUser.clanRole = TribeRoles.MEMBER;
            await headerUser.save();
            user.clanRole = TribeRoles.CHIEF;
            
            tribeMessage.setId(randomId);
            tribeMessage.setClanId(headerUser.clanId);
            tribeMessage.setHeadPic(userinfo.picUrl);
            tribeMessage.setUserId(userinfo.userId);
            tribeMessage.setNickname(userinfo.nickname);
            tribeMessage.setType(ClanMessageType.CHIEF_PROMOTION);
            tribeMessage.setStatus(0);
            tribeMessage.setMsg('');
            tribeMessage.setSentDate(Date.now());

            await tribeMessage.save();
            break;

        default:
            return res.status(200).json({ code: 12, message: 'Invalid type', data: null });
    }

    await user.save();

    return res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
});

router.get('/api/v1/clan/tribe/member/message', async (req, res) => {
    const userId = req.headers['userid'];
    const pageNo = parseInt(req.query.pageNo) || 0;
    const pageSize = 999999999;

    const user = await ClanMember.findOne({ userId });

    if (!user) {
        return res.status(200).json({ code: 8, message: 'User not exist', data: null });
    }

    let tribemessages;
    
    if (pageNo !== 0) {
        return res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: {
                pageNo,
                pageSize,
                totalPage: 0,
                totalSize: 0,
                data: []
            }
        });
    }

    if (user.clanId === 0) {
        tribemessages = await ClanMessage.find({ forId: userId }).sort({ sentDate: -1 });
    } else {
        const clanExists = await Clan.exists({ clanId: user.clanId });

        if (!clanExists) {
            return res.status(200).json({ code: 7011, message: 'The tribe which server tried fetching does not exist', data: null });
        }

        tribemessages = await ClanMessage.find({
            $or: [
                { forId: userId },
                { clanId: user.clanId }
            ]
        }).sort({ sentDate: -1 });
    }

    const responseData = tribemessages.map(tribemessage => ({
        id: tribemessage.id,
        clanId: tribemessage.clanId,
        headPic: tribemessage.headPic,
        userId: tribemessage.userId,
        nickName: tribemessage.nickName,
        type: tribemessage.type,
        status: tribemessage.status,
        msg: tribemessage.msg || 'No message'
    }));

    return res.status(200).json({
        code: 1, 
        message: 'SUCCESS', 
        data: {
            pageNo,
            pageSize,
            totalPage: 0,
            totalSize: 0,
            data: responseData
        }, 
        other: null 
    });
});

router.delete('/api/v1/clan/tribe/member/remove', async (req, res) => {
    const userId = req.headers['userid'];
    const { otherId } = req.body;
    
    if (!otherId) {
        res.status(200).json({ code: 6, message: 'Invalid parameter', data: null });
        return;
    }

    const headerUser = await ClanMember.findOne({ userId: userId });
    if (!headerUser) {
        return res.status(200).json({ code: 8, message: 'Header user not exist', data: null });
    }

    const user = await ClanMember.findOne({ userId: otherId });
    if (!user) {
        return res.status(200).json({ code: 8, message: 'User not exist', data: null });
    }

    const userinfo = await User.findOne({ userId: otherId });
    if (!userinfo) {
        return res.status(200).json({ code: 108, message: 'The user does not exist', data: null });
    }

    if (headerUser.clanId !== user.clanId) {
        return res.status(200).json({ code: 7022, message: 'This user is not in the same tribe as you', data: null });
    }

    if (headerUser.userId === user.userId) {
        return res.status(200).json({ code: 7013, message: 'You cannot kick yourself, type other', data: null });
    }

    if (user.clanRole === 20) {
        return res.status(200).json({ code: 7012, message: 'You cannot kick the chief of the tribe', data: null });
    }

    if (user.official === 1) {
        return res.status(200).json({ code: 7003, message: 'You cannot kick the official of the game', data: null });
    }

    if (headerUser.clanRole === 10 && user.clanRole === 10) {
        return res.status(200).json({ code: 7015, message: 'You cannot kick another elder of the tribe', data: null });
    }

    if (headerUser.clanRole !== 20 && headerUser.clanRole !== 10) {
        return res.status(200).json({ code: 7002, message: 'No permission to kick members, only chief or elder', data: null });
    }

    user.clanId = 0;
    user.clanName = '';
    user.clanRole = 0;
    user.experience = 0;
    await user.save();

    const clan = await Clan.findOne({ clanId: headerUser.clanId });
    if (!clan) {
        return res.status(200).json({ code: 7000, message: 'You are not in a tribe', data: null });
    }
    clan.currentCount -= 1;
    await clan.save();

    const randomId = Math.floor(Math.random() * 100000) + 100000;
    const tribeMessage = new ClanMessage({
        id: randomId,
        clanId: headerUser.clanId,
        headPic: userinfo.picUrl,
        userId: userinfo.userId,
        nickName: userinfo.nickname,
        type: 3,
        status: 0,
        msg: `You have been kicked from ${clan.clanName} tribe`,
        forId: otherId,
        sentDate: Date.now()
    });
    await tribeMessage.save();

    return res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
});

router.get('/api/v1/clan/tribe/blurry/info', async (req, res) => {
    const { clanName } = req.query;
    const pageNo = req.query.pageNo ? parseInt(req.query.pageNo) : 0;
    
    if (!clanName) {
       res.status(200).json({ code: 6, message: 'Invalid parameter', data: null });
       return;
    }

    let query = {}; 
    if (clanName) {
        query = { name: { $regex: '^' + clanName, $options: 'i' } };
    }

    if (pageNo !== 0) {
        return res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: {
                pageNo,
                pageSize,
                totalPage: 0,
                totalSize: 0,
                data: []
            }
        });
    }

    const tribes = await Clan.find(query).skip(pageNo * pageSize).limit(pageSize);

    const responseData = tribes.map(tribe => ({
        clanId: tribe.clanId,
        name: tribe.name,
        headPic: tribe.headPic,
        tags: tribe.tags,
        details: tribe.details,
        experience: tribe.experience,
        level: tribe.level,
        currentCount: tribe.currentCount,
        maxCount: tribe.maxCount,
        freeVerify: tribe.freeVerify,
        region: tribe.region
    }));

    const totalSize = await Clan.countDocuments(query);
    const totalPage = Math.ceil(totalSize / pageSize);

    return res.status(200).json({ code: 1, message: 'SUCCESS', data: responseData });
});

router.delete('/api/v1/clan/tribe', async (req, res) => {
    const userId = req.headers['userid'];
    
    const user = await ClanMember.findOne({ userId });
    if (!user) {
        return res.status(200).json({ code: 8, message: 'User not found', data: null });
    }

    if (user.clanId === 0) {
        return res.status(200).json({ code: 7000, message: 'You are not in a tribe', data: null });
    }

    if (user.clanRole !== 20) {
        return res.status(200).json({ code: 7008, message: 'You cannot delete this tribe', data: null });
    }

    const clanId = user.clanId;

    await ClanMember.updateMany(
        { clanId },
        { clanId: 0, experience: 0, clanRole: 0 }
    );

    await ClanDonation.deleteMany({ clanId });
    await ClanMessage.deleteMany({ clanId });
    await Clan.deleteOne({ clanId });

    return res.status(200).json({
        code: 1,
        message: 'SUCCESS',
        data: null
    });
});

router.put('/api/v1/clan/tribe/member/agreement', async (req, res) => {
    const otherId = parseInt(req.query.otherId);
    const userId = req.headers.userid;
    if (!otherId) {
        res.status(200).json({ code: 6, message: 'Invalid parameter', data: null });
        return;
    }

    const clanMember = await ClanMember.findOne({ userId });
    if (!clanMember || clanMember.clanId == 0) {
        console.log('7006');
        return res.status(200).json({ code: 7006, message: "The specified user is not in this clan", data: null });
    }

    if (clanMember.role < TribeRoles.ELDER) {
        console.log('7002');
        return res.status(200).json({ code: 7002, message: 'Insufficient permissions to join clan', data: null });
    }

    const targetMember = await ClanMember.findOne({ userId: otherId });
    if (targetMember != null && targetMember.clanId != 0) {
        console.log('7001');
        return res.status(200).json({ code: 7001, message: "The user is already in a clan", data: null });
    }

    const request = await ClanMessage.findOne({
        userId: otherId,
        clanId: clanMember.clanId,
        type: ClanMessageTypes.JOIN_REQUEST,
        status: RequestStatuses.PENDING
    });
    
    if (!request) {
        console.log('11');
        return res.status(200).json({ code: 11, message: "The specified userId was not found in the clan messages", data: null });
    }

    const clan = await Clan.findOne({ clanId: clanMember.getClanId() });
    clan.currentCount += 1;
        await clan.save();
    
        targetMember.setClanId(clan.clanId);
        targetMember.setClanRole(TribeRoles.MEMBER);
        await targetMember.save();
        
    

    request.setStatus(RequestStatuses.ACCEPTED);
    await request.save();

    // TODO: Update all invitations and requests related to the user as well?
    console.log('1');
    return res.status(200).json({
        code: 1,
        message: 'SUCCESS',
        data: null
    });
});

router.put('/api/v1/clan/tribe/member/rejection', async (req, res) => {
    const otherId = parseInt(req.query.otherId);
    const userId = req.headers.userid;
    if (!otherId) {
        res.status(200).json({ code: 6, message: 'Invalid parameter', data: null });
        return;
    }

    const clanMember = await ClanMember.findOne({ userId });
    if (!clanMember || clanMember.clanId == 0) {
        console.log('7006');
        return res.status(200).json({ code: 7006, message: "The specified user is not in this clan", data: null });
    }

    if (clanMember.role < TribeRoles.ELDER) {
        console.log('7002');
        return res.status(200).json({ code: 7002, message: 'Insufficient permissions to join clan', data: null });
    }

    const targetMember = await ClanMember.findOne({ userId: otherId });
    if (targetMember != null && targetMember.clanId != 0) {
        console.log('7001');
        return res.status(200).json({ code: 7001, message: "The user is already in a clan", data: null });
    }

    const request = await ClanMessage.findOne({
        userId: otherId,
        clanId: clanMember.clanId,
        type: ClanMessageTypes.JOIN_REQUEST,
        status: RequestStatuses.PENDING
    });
    
    if (!request) {
        console.log('11');
        return res.status(200).json({ code: 11, message: "The specified userId was not found in the clan messages", data: null });
    }

    const clan = await Clan.findOne({ clanId: clanMember.getClanId() });

    request.setStatus(RequestStatuses.REFUSED);
    await request.save();

    // TODO: Update all invitations and requests related to the user as well?
    console.log('1');
    return res.status(200).json({
        code: 1,
        message: 'SUCCESS',
        data: null
    });
});

module.exports = router;