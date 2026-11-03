const express = require('express');
const router = express.Router();

const User = require('../models/user-model');
const Activity = require('../models/activity-model');
const Vip = require('../models/vip-model');
const Wealth = require('../models/wealth-model');
const ActivityManager = require('../common/helpers/activityHelper');
const { getConfig } = require('../common/helpers/configHelper');
const logger = require('../common/logger');

const rewardsConfig = require('../config/activity/signin/rewards.json');
const ActivityLoginStatuses = require('../common/constants/ActivityLoginStatuses');
const Genders = require("../common/constants/Genders");
const Currencies = require("../common/constants/Currencies");
const RewardTypes = require("../common/constants/RewardTypes");

const ERROR_ALREADY_CLAIMED = 1;

async function getRewardListByUser(userId) {
    const user = await User.findOne({ userId });

    // Without structureClone the statements below would have modified the items of `rewardsConfig`
    // `rewardList` would have only stored the references of the items instead of copying
    const rewardList = structuredClone(rewardsConfig);
    for (let i = 0; i < rewardList.length; i++) {
        if (!rewardList[i].rewards) {
            rewardList[i].rewards = rewardList[i][`rewardList_${user.sex}`]; 

            delete rewardList[i][`rewardList_${Genders.BOY}`];
            delete rewardList[i][`rewardList_${Genders.GIRL}`];
        }
    }

    return rewardList;
}

async function claimReward(userId) {
    const user = await User.findOne({ userId });
    const vip = await Vip.findOne({ userId });
    const wealth = await Wealth.findOne({ userId });
    const activity = await Activity.findOne({ userId });  
    const { currentSignInDay, signInDay } = activity;
    
    const currentDay = currentSignInDay;
    const hasClaimed = signInDay

    const claimStatus = currentDay >= rewardsConfig.length ? ActivityLoginStatuses.FINISHED : (hasClaimed ? ActivityLoginStatuses.CLAIMED : ActivityLoginStatuses.NOT_CLAIMED);
    if (claimStatus > 0) {
        return { code: ERROR_ALREADY_CLAIMED };
    }

    const rewardList = await getRewardListByUser(userId);
    const rewardInfo = rewardList[currentDay];

    for (let i = 0; i < rewardInfo.rewards.length; i++) {
        const reward = rewardInfo.rewards[i];
        switch (reward.rewardType) {
            case RewardTypes.VIP:
                vip.vip = reward.level;
                await vip.save();
                break;
            case RewardTypes.DRESS:
                // the user has every decoration already
                break;
            case RewardTypes.DIAMOND:
                wealth.diamonds = wealth.diamonds + reward.quantity;
                await wealth.save();
                break;
            case RewardTypes.GOLD:
                wealth.gold = wealth.gold + reward.quantity;
                await wealth.save();
                break;
        }
    }

    activity.currentDay = currentDay + 1;
    await activity.save();

    return {
        signInId: activity.currentDay // Zero-based
    };
}

router.get('/api/v1/lucky/turntable/gold/status', async (req, res) => {
    try {
        const userId = req.headers.userid;
        if (!userId) return res.status(400).json({ code: 400, message: 'UserId header is required', data: null });

        let activity = await Activity.findOne({ userId });
        if (!activity) activity = await ActivityManager.createActivitySession(userId);

        res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: { isFree: activity.freeWheel }
        });
    } catch (err) {
        console.error('Error fetching wheel status:', err);
        res.status(500).json({ code: 0, message: 'Failed to fetch wheel status' });
    }
});

router.get('/api/v1/activity/title', async (req, res) => {
    try {
        const config = await getConfig('activityTitles');
        res.status(200).json({ code: 1, message: 'SUCCESS', data: config.configData });
    } catch (err) {
        console.error('Error fetching activity titles:', err);
        res.status(500).json({ code: 0, message: 'Failed to load activity titles' });
    }
});

router.get('/api/v1/activity/action', async (req, res) => {
    try {
        const config = await getConfig('activityActions');
        const list = config?.configData?.activityTitleList || [];

        res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: req.query.titleType ? list : []
        });
    } catch (err) {
        console.error('Error loading activity actions:', err);
        res.status(500).json({ code: 0, message: 'Failed to load activity actions' });
    }
});

router.get('/api/v1/signIn', async (req, res) => {
    try {
        const userId = req.headers.userid;
        if (!userId) return res.status(400).json({ code: 400, message: 'UserId header is required', data: null });

        const user = await User.findOne({ userId });
        const activity = await Activity.findOne({ userId });
        if (!user || !activity) {
            return res.status(404).json({ code: 404, message: 'User or activity not found', data: null });
        }

        const { currentSignInDay, signInDay } = activity;
        const rewardList = structuredClone(rewardsConfig);

        for (const reward of rewardList) {
            if (!reward.rewards) {
                reward.rewards = reward[`rewardList_${user.sex}`];
                delete reward[`rewardList_${Genders.BOY}`];
                delete reward[`rewardList_${Genders.GIRL}`];
            }
        }

        for (let i = 0; i < rewardList.length; i++) {
            if (currentSignInDay > i) rewardList[i].status = ActivityLoginStatuses.CLAIMED;
        }

        const signInStatus =
            currentSignInDay >= rewardsConfig.length
                ? ActivityLoginStatuses.FINISHED
                : signInDay
                ? ActivityLoginStatuses.CLAIMED
                : ActivityLoginStatuses.NOT_CLAIMED;

        res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: { signInStatus, userSignInList: rewardList }
        });
    } catch (err) {
        console.error('Error fetching sign-in data:', err);
        res.status(500).json({ code: 0, message: 'Failed to fetch sign-in data' });
    }
});

router.post('/api/v1/signIn', async (req, res) => {
    const userId = req.headers.userid;
    const claimInfo = await claimReward(userId);
    switch (claimInfo.code) {
        case ERROR_ALREADY_CLAIMED:
            return res.status(200).json({ code: 8006, message: 'Activity is finished', data: null });
    }

    return res.status(200).json({
        code: 1,
        message: 'SUCCESS',
        data: claimInfo
    });
});

module.exports = router;