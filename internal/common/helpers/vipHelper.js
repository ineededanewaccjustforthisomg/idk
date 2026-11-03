const Vip = require('../../models/vip-model');
const User = require('../../models/user-model');

async function addVip(userId, newVipLevel, vipDays) {
    const currentDate = new Date();
    let userVip = await Vip.findOne({ userId });

    if (userVip) {
        if (userVip.vip >= newVipLevel) {
            newVipLevel = userVip.vip;
        }

        let expireDate = new Date(userVip.expireDate);
        if (expireDate > currentDate) {
            expireDate.setDate(expireDate.getDate() + vipDays);
        } else {
            expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + vipDays);
        }
        expireDate.setHours(5, 0, 0, 0);

        userVip.vip = newVipLevel;
        userVip.expireDate = expireDate;

    } else {
        const expireDate = new Date();
        expireDate.setDate(currentDate.getDate() + vipDays);
        expireDate.setHours(5, 0, 0, 0);

        userVip = new Vip({
            userId,
            vip: newVipLevel,
            expireDate
        });
    }

    await userVip.save();
    return userVip;
}

async function checkVipExpireDate(userId) {
    const userVip = await Vip.findOne({ userId });
    const User = await User.findOne({ userId });

    if (!userVip) {
        throw new Error(`No VIP record found for user ${userId}`);
    }

    if (!User) {
        throw new Error(`The selected user does not exist or does have any data user ${userId}`);
    }

    const currentDate = new Date();
    const expireDate = userVip.expireDate;

    if (currentDate > expireDate) {
        userVip.vip = 0;
        userVip.expireDate = 0;
        User.vip = 0;
        await userVip.save();
        await User.save();
        console.log(`VIP status expired for user ${userId}`);
        return true;
    }

    return false;
}

async function createVipSession(userId) {
    const existingVip = await Vip.findOne({ userId });

    if (!existingVip) {
        const vip = new Vip({
            userId,
            vip: 0,
            expireDate: null,
            lastClaimedReward: null
        });
        await vip.save();
    }
}

async function getVip(userId) {
    const userVip = await Vip.findOne({ userId });

    if (!userVip) {
        throw new Error(`No VIP record found for user ${userId}`);
    }

    return {
        vip: userVip.vip,
        expireDate: userVip.expireDate
    };
}

module.exports = {
    addVip,
    checkVipExpireDate,
    createVipSession,
    getVip
};