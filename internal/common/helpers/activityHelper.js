const Vip = require('../../models/vip-model');
const User = require('../../models/user-model');
const Account = require('../../models/account-model');
const Activity = require('../../models/activity-model');

const createActivitySession = async (userId) => {
    const existingSession = await Activity.findOne({ userId });

    if (!existingSession) {
        const activity = new Activity({
            userId,
            freeWheel: 1,
            moneyClaimed: false,
            luckDiamonds: 0,
            luckGold: 0,
            blockDiamonds: 0,
            blockGold: 0,
            signInDay: 0,
            currentSignInDay: 0
        });
        await activity.save();
    }
};

module.exports = {
    createActivitySession
};