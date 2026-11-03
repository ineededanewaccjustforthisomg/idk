const Vip = require('../../models/vip-model');
const User = require('../../models/user-model');
const Account = require('../../models/account-model');
const Wealth = require('../../models/wealth-model');

const getBanInfo = async (userId) => {
    const user = User.findOne({ userId });
    const account = Account.findOne({ userId });
    
    return {
        userId: userId,
        status: user.stopToTime > 0 ? 1 : 0,
        stopToTime: user.stopToTime,
        stopReason: `ban_reason_${user.stopReason}`
    }
};

const getUserInfo = async (userId) => {
    const user = User.findOne({ userId });
    const account = Account.findOne({ userId });
    const wealth = Wealth.findOne({ userId });
    
    return {
        userId: userId,
        accessToken: account.accessToken,
        hasPassword: true,
        sex: user.sex,
        nickName: user.nickname,
        birthday: user.birthday || '',
        details: user.introduction,
        email: account.email || '',
        vip: user.vip,
        picUrl: user.picUrl || '',
        diamonds: wealth.diamonds,
        golds: wealth.gold,
        hasDeviceBinding: false,
        connectId: 0
    }
};

module.exports = {
    getUserInfo,
    getBanInfo
};