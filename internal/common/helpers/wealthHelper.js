const crypto = require("crypto");

const Wealth = require('../../models/wealth-model');
const User = require('../../models/user-model');
const TransactionTypes = require('../../constants/TransactionTypes');
const TransactionResults = require('../../constants/TransactionResults');
const Transaction = require('../../models/transaction-model');
const WealthTypes = require('../../constants/WealthTypes');


const addWealth = async (userId, currencyType, amount) => {
    const wealth = await Wealth.findOne({ userId });

    if (!wealth) {
        throw new Error(`Wealth record not found for user ${userId}`);
    }
    
    const wealthType = WealthTypes[currencyType];

    wealth[wealthType] += amount;
    await wealth.save();

    if (currencyType !== '3') {
        const transaction = new Transaction({
            userId: userId,
            created: Date.now(),
            currency: currencyType,
            inoutType: TransactionTypes.ADDED,
            orderId: crypto.randomBytes(8).toString("hex"),
            qty: amount,
            status: TransactionResults.SUCCESS,
            transactionType: 9
        });

        await transaction.save();
    }
};

const removeWealth = async (userId, currencyType, amount) => {
    if (amount === 0) { return false; }

    const wealth = await Wealth.findOne({ userId });

    if (!wealth) {
        throw new Error(`Wealth record not found for user ${userId}`);
    }
    
    const wealthType = WealthTypes[currencyType];

    wealth[wealthType] -= amount;
    await wealth.save();
    
    if (currencyType !== '3') {
        const transaction = new Transaction({
            userId: userId,
            created: Date.now(),
            currency: currencyType,
            inoutType: TransactionTypes.REMOVED,
            orderId: crypto.randomBytes(8).toString("hex"),
            qty: amount,
            status: TransactionResults.ALREADY_PAID,
            transactionType: 9
        });

        await transaction.save();
    }
    
    return true;
};

const isWealthSufficient = async (userId, currencyType, amount) => {
    const wealth = await Wealth.findOne({ userId });
    
    const wealthType = WealthTypes[currencyType];

    if (!wealth) {
        throw new Error(`Wealth record not found for user ${userId}`);
    }

    return wealth[wealthType] >= amount;
};

const getWealth = async (userId, currencyType) => {
    const wealth = await Wealth.findOne({ userId });
    
    const wealthType = WealthTypes[currencyType];

    if (!wealth) {
        throw new Error(`Wealth record not found for user ${userId}`);
    }

    return wealth[wealthType];
};

const createWealthSession = async (userId) => {
    const existingWealth = await Wealth.findOne({ userId });

    if (!existingWealth) {
        const wealth = new Wealth({
            userId,
            clanGold: 0,
            diamonds: 0,
            gold: 0
        });
        await wealth.save();
    }
};

const getGold = async (userId) => {
    const wealthGold = await Wealth.findOne({ userId });

    if (!wealthGold) {
        const wealth = new Wealth({
            userId,
            clanGold: 0,
            diamonds: 0,
            gold: 0
        });
        await wealth.save();
    }
    
    return wealthGold.gold;
};


const getDiamonds = async (userId) => {
    const wealthDiamonds = await Wealth.findOne({ userId });

    if (!wealthDiamonds) {
        const wealth = new Wealth({
            userId,
            clanGold: 0,
            diamonds: 0,
            gold: 0
        });
        await wealth.save();
    }
    
    return wealthGold.diamonds;
};

module.exports = {
    createWealthSession,
    addWealth,
    removeWealth,
    isWealthSufficient,
    getWealth,
    getDiamonds,
    getGold
};