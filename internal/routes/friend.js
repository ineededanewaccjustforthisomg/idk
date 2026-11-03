const express = require('express');
const router = express.Router();

const User = require('../models/user-model');
const Friend = require('../models/friend-model');
const FriendRequest = require('../models/friendRequest-model');
const Vip = require('../models/vip-model');
const ClanMember = require('../models/clanMember-model');
const Clan = require('../models/clan-model');
const Account = require('../models/account-model');

const serverConfig = require('../server-configuration');
const languages = require('../common/language');
const locale = require('../common/helpers/localeHelper');

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

async function getUserLocale(userId) {
    const langCode = await locale.getUserLocale(userId, 'language');
    return languages[langCode] || 'Unknown';
}

async function formatUser(user) {
    return {
        userId: user.userId,
        nickName: user.nickname,
        picUrl: user.picUrl,
        country: await getUserLocale(user.userId),
        sex: user.sex || 2,
        details: user.introduction || '',
    };
}

async function checkFriendship(userId, friendId) {
    return Friend.exists({ userId, friendFor: friendId });
}

async function getFriendData(userId, friendId) {
    const user = await User.findOne({ userId: friendId });
    if (!user) return null;

    const vip = await Vip.findOne({ userId: friendId });
    const friendEntry = await Friend.findOne({ userId: friendId, friendFor: userId });
    const clanMember = await ClanMember.findOne({ userId: friendId });
    let clan = null;
    if (clanMember?.clanId) clan = await Clan.findOne({ clanId: clanMember.clanId });

    return {
        userId: user.userId,
        nickName: user.nickname,
        picUrl: user.picUrl,
        alias: friendEntry?.alias || '',
        status: 30,
        vip: vip?.vip || 0,
        expireDate: null,
        sex: user.sex || 2,
        details: user.introduction || '',
        birthday: "",
        friend: !!friendEntry,
        clanId: clan?.clanId || 0,
        clanName: clan?.name || null,
        role: clanMember?.clanRole || 0
    };
}

router.get('/api/v1/friends/requests', async (req, res) => {
    try {
        const userId = req.headers.userid;
        const pageNo = parseInt(req.query.pageNo) || 0;
        const pageSize = 20;

        const [requests, totalSize] = await Promise.all([
            FriendRequest.find({ forId: userId })
                .sort({ sendDate: -1 })
                .skip(pageNo * pageSize)
                .limit(pageSize)
                .lean(),
            FriendRequest.countDocuments({ forId: userId })
        ]);

        const senderIds = requests.map(r => r.sentFrom);
        const senders = await User.find({ userId: { $in: senderIds } })
            .select('userId nickname picUrl sex')
            .lean();
        const vipMap = Object.fromEntries((await Vip.find({ userId: { $in: senderIds } })).map(v => [v.userId, v.vip || 0]));
        
        const requestData = await Promise.all(requests.map(async reqItem => {
            const sender = senders.find(s => s.userId === reqItem.sentFrom) || {};
            return {
                requestId: reqItem.requestId,
                userId: sender.userId || reqItem.sentFrom,
                nickName: sender.nickname || '',
                picUrl: sender.picUrl || '',
                vip: vipMap[sender.userId] || 0,
                sex: sender.sex || 0,
                msg: reqItem.msg || "Let's be friends",
                status: reqItem.status || 0,
                age: 0,
                country: '',
                language: await getUserLocale(reqItem.sentFrom),
                onlineStatus: 0
            };
        }));

        const totalPage = Math.ceil(totalSize / pageSize);

        res.json({
            code: 1,
            message: 'SUCCESS',
            data: {
                pageNo,
                pageSize,
                totalPage,
                totalSize,
                data: requestData
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 0, message: 'Server error' });
    }
});

router.get('/api/v1/friends/info/:nickName', async (req, res) => {
    try {
        const pageNo = parseInt(req.query.pageNo) || 0;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const nickName = req.params.nickName || '';
        const userId = req.headers.userid;

        if (!nickName) return res.json({ code: 1, message: 'SUCCESS', data: { pageNo: 1, pageSize: 10, totalSize: 0, totalPage: 0, data: [] } });

        const friendIds = (await Friend.find({ friendFor: userId }).select('friendId').lean()).map(f => f.friendId);

        const filter = {
            nickname: { $regex: escapeRegex(nickName), $options: 'i' },
            userId: { $ne: userId, $nin: friendIds }
        };

        const totalSize = await User.countDocuments(filter);
        const users = await User.find(filter).skip(pageNo * pageSize).limit(pageSize).lean();
        const formattedUsers = await Promise.all(users.map(formatUser));

        res.json({ code: 1, message: 'SUCCESS', data: { totalSize, totalPage: Math.ceil(totalSize / pageSize), pageNo, pageSize, data: formattedUsers } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 0, message: 'Server error' });
    }
});

router.get('/api/v1/friends/status', async (req, res) => {
    const userId = req.headers.userid;
    const friendList = await Friend.find({ friendFor: userId });

    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);

    const onlineUsers = await Account.find({ lastSeen: { $gte: thirtySecondsAgo } }).select('userId');
    const onlineUserIds = new Set(onlineUsers.map(u => u.userId));

    const status = await Promise.all(friendList.map(async (friend) => {
        const friendUser = await User.findOne({ userId: friend.userId }).select('userId nickname');

        return {
            userId: friendUser.userId,
            status: onlineUserIds.has(friendUser.userId) ? 10 : 30,
            gameId: 'g1008',
            gameName: 'Bedwars'
        };
    }));

    const response = {
        maxFriendCount: 500,
        curFriendCount: status.length,
        status,
        currentTime: Date.now()
    };
    
    res.status(200).json({ code: 1, message: 'SUCCESS', data: response });
});


router.get('/api/v1/friends', async (req, res) => {
    try {
        const userId = req.headers.userid;
        const pageNo = parseInt(req.query.pageNo) || 0;
        const pageSize = parseInt(req.query.pageSize) || 10;

        // Get friend entries with pagination
        const [friendList, totalFriends] = await Promise.all([
            Friend.find({ friendFor: userId })
                .skip(pageNo * pageSize)
                .limit(pageSize)
                .lean(),
            Friend.countDocuments({ friendFor: userId })
        ]);

        // Get friend user details and VIP info in batch
        const friendIds = friendList.map(f => f.userId);
        const users = await User.find({ userId: { $in: friendIds } })
            .select('userId nickname picUrl alias')
            .lean();
        const vips = await Vip.find({ userId: { $in: friendIds } }).lean();
        const vipMap = Object.fromEntries(vips.map(v => [v.userId, v.vip || 0]));

        const formattedFriends = friendList.map(f => {
            const friendUser = users.find(u => u.userId === f.userId);
            if (!friendUser) return null;

            return {
                userId: userId || '0',
                friendId: friendUser.userId || '0',
                nickName: friendUser.nickname,
                picUrl: friendUser.picUrl,
                alias: friendUser.alias || '',
                vip: vipMap[friendUser.userId] || 0
            };
        }).filter(f => f !== null);

        res.json({
            code: 1,
            message: 'SUCCESS',
            data: {
                pageNo,
                pageSize,
                totalPage: Math.ceil(totalFriends / pageSize),
                totalSize: totalFriends,
                data: formattedFriends
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 0, message: 'Server error' });
    }
});

router.post('/api/v1/friends', async (req, res) => {
    try {
        const userId = req.headers.userid;
        const { friendId, msg } = req.body;

        if (!friendId) return res.status(400).json({ code: 6, message: 'Missing friendId' });
        if (msg?.length > serverConfig.friend.friendRequestMsgMax) return res.status(400).json({ code: 60005, message: 'Request message too long' });
        if (userId === friendId) return res.json({ code: 6, message: "Cannot add yourself" });

        const friendUser = await User.findOne({ userId: friendId });
        if (!friendUser) return res.json({ code: 3004, message: 'Friend does not exist' });

        if (await checkFriendship(userId, friendId)) return res.json({ code: 3001, message: 'Already friends' });
    
        const userFriendCount = await Friend.countDocuments({ friendFor: userId });
        const friendFriendCount = await Friend.countDocuments({ friendFor: friendId });
    
        if (userFriendCount >= 500 || friendFriendCount >= 500) {
            return res.status(200).json({ code: 3002, message: 'Max friend limit reached', data: null });
        }
        
        const existingRequest = await FriendRequest.findOne({ userId, forId: friendId, status: 0 });
        if (existingRequest && existingRequest._id) {
            return res.status(200).json({
                code: 1,
                message: 'Request already sent',
                data: null
            });
        }
    
        const totalRequests = await FriendRequest.countDocuments({ userId });
        if (totalRequests >= 20) {
            const requestToDelete = await FriendRequest.findOne({ userId, status: { $in: [1, 2] } });
            if (requestToDelete) await FriendRequest.deleteOne({ requestId: requestToDelete.requestId });
        }
        
        const newRequest = new FriendRequest({
            requestId: (Math.floor(Math.random() * 100000) + 600000).toString(),
            userId,
            forId: friendId,
            msg: msg || "Let's be friends",
            status: 0,
            sentFrom: userId,
            sendDate: new Date()
        });
        await newRequest.save();

        res.json({ code: 1, message: 'SUCCESS', data: null });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 0, message: 'Server error' });
    }
});

router.put('/api/v1/friends/:friendId/rejection', async (req, res) => {
    try {
        const userId = req.headers.userid;
        const friendId = req.params.friendId;

        const pendingRequests = await FriendRequest.find({ forId: userId, sentFrom: friendId, status: 0 });

        if (!pendingRequests.length) {
            return res.json({ code: 11001, message: 'No friend requests to reject', data: null });
        }

        await FriendRequest.updateMany(
            { forId: userId, sentFrom: friendId, status: 0 },
            { status: 2 }
        );

        res.json({ code: 1, message: 'SUCCESS', data: null });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 0, message: 'Server error' });
    }
});

router.put('/api/v1/friends/:friendId/agreement', async (req, res) => {
    try {
        const userId = parseInt(req.headers.userid);
        const friendId = parseInt(req.params.friendId);

        const request = await FriendRequest.findOne({ forId: userId, sentFrom: friendId });
        if (!request) return res.json({ code: 1200, message: 'Friend request not found' });

        if (await checkFriendship(userId, friendId)) return res.json({ code: 3001, message: 'Already friends' });

        const userFriendCount = await Friend.countDocuments({ friendFor: userId });
        const friendFriendCount = await Friend.countDocuments({ friendFor: friendId });
        if (userFriendCount >= 500 || friendFriendCount >= 500) return res.json({ code: 3002, message: 'Max friend limit reached' });

        await Promise.all([
            new Friend({ userId, friendFor: friendId }).save(),
            new Friend({ userId: friendId, friendFor: userId }).save(),
            FriendRequest.updateOne({ _id: request._id }, { status: 1 })
        ]);

        res.json({ code: 1, message: 'SUCCESS', data: null });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 0, message: 'Server error' });
    }
});

router.get('/api/v2/friends/:friendId', async (req, res) => {
    try {
        const userId = req.headers.userid;
        const friendId = req.params.friendId;

        const data = await getFriendData(userId, friendId);
        if (!data) return res.json({ code: 3004, message: 'User does not exist', data: null });

        res.json({ code: 1, message: 'SUCCESS', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 0, message: 'Server error' });
    }
});

router.get('/api/v1/friends/recommendation', async (req, res) => {
    try {
        const userId = req.headers.userid;
        const pageNo = parseInt(req.query.pageNo) || 0;
        const pageSize = parseInt(req.query.pageSize) || 10;

        const users = await User.find({ userId: { $ne: userId } })
            .select('userId nickname sex picUrl')
            .lean();

        const formattedUsers = await Promise.all(
            users.map(async u => ({
                userId: u.userId,
                nickName: u.nickname,
                sex: u.sex || 2,
                picUrl: u.picUrl,
                country: await getUserLocale(u.userId)
            }))
        );

        const shuffled = formattedUsers.sort(() => Math.random() - 0.5);
        const paginated = shuffled.slice(pageNo * pageSize, pageNo * pageSize + pageSize);

        res.json({
            code: 1,
            message: 'SUCCESS',
            data: paginated
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 0, message: 'Server error' });
    }
});

module.exports = router;