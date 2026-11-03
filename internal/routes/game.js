const express = require('express');
const router = express.Router();
const Game = require('../models/game-model');
const GameLike = require('../models/gamelike-model');
const User = require('../models/user-model');
const Friend = require('../models/friend-model');
const Account = require('../models/account-model');
const dispatchManager = require("../common/dispatch/dispatchHelper");
const configuration = require("../config/highLevelConfig");
const { getConfig } = require('../common/helpers/configHelper');

async function fetchRandomGames(count = 5) {
    return await Game.aggregate([{ $sample: { size: count } }]);
}

router.get('/api/v1/games/announcement/info', async (req, res) => {
    try {
        const config = await getConfig('announcement');
        if (!config?.configData) return res.status(404).json({ code: 0, message: 'Announcement not found' });

        res.json({ code: 1, message: 'SUCCESS', data: config.configData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 0, message: 'Failed to load announcement data' });
    }
});

router.get('/api/v1/games/stop/announcement', async (req, res) => {
    try {
        const config = await getConfig('stop-announcement');
        if (!config?.configData) return res.status(404).json({ code: 0, message: 'Stop announcement not found' });

        res.json({ code: 1, message: 'SUCCESS', data: config.configData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 0, message: 'Failed to load stop announcement data' });
    }
});

router.get(['/api/:version/games/recommendation', '/api/:version/games/recommendation/type', '/api/v1/games/playlist/recently', '/api/v1/games/ugc'], async (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;

    if (pageNo !== 0) return res.json({ code: 1, message: 'SUCCESS', data: { pageNo, pageSize, totalPage: 0, totalSize: 0, data: [] } });

    const randomGames = await fetchRandomGames(5);
    res.json({ code: 1, message: 'SUCCESS', data: { pageNo, pageSize, totalPage: 0, totalSize: 0, data: randomGames, other: null } });
});

router.get('/api/:version/games', async (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;

    try {
        const games = await Game.find({}).lean();
        games.forEach(game => {
            game.gameTitle += ` [${dispatchManager.getAllPlayers(game.gameId)}]`;
        });

        if (pageNo !== 0) return res.json({ code: 1, message: 'SUCCESS', data: { pageNo, pageSize, totalPage: 0, totalSize: 0, data: [] } });

        res.json({ code: 1, message: 'SUCCESS', data: { pageNo, pageSize, totalPage: 0, totalSize: 0, data: games, other: null } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 0, message: 'Error retrieving games.' });
    }
});

router.get('/api/v1/games/update/list/:userId', async (req, res) => {
    res.json({ code: 4, message: "INNER ERROR", data: null });
});

router.get('/api/v1/games/ugc/status', (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;

    if (pageNo !== 0) return res.json({ code: 1, message: 'SUCCESS', data: { pageNo, pageSize, totalPage: 0, totalSize: 0, data: [] } });

    res.json({ code: 1, message: 'SUCCESS', data: { pageNo, pageSize, totalPage: 0, totalSize: 0, data: null, other: null } });
});

router.get('/api/v1/games/app-engine/upgrade', (req, res) => {
    const gameId = req.query.gameType;
    res.json({ code: 1, message: "SUCCESS", data: { downloadUrl: `http://${configuration.resAddress}/res/${gameId}.zip` }});
});

router.get('/api/v1/games/update/tip/info/app/:gameId', (req, res) => {
    const gameId = req.params.gameId;
    res.json({ code: 1, message: "SUCCESS", data: { count: 90090, content: "Engine has been updated" }});
});

router.get('/api/v2/games/:gameId', async (req, res) => {
    const { gameId } = req.params;
    const userId = req.headers.userid;

    const gameData = await Game.findOne({ gameId });
    if (!gameData) return res.json({ code: 2002, message: "The specified game does not exist", data: null });

    const author = await User.findOne({ userId: gameData.authorId });
    if (!author) return res.json({ code: 2002, message: "The specified game does not exist", data: null });

    const friendEntry = (gameData.authorId == userId) ? false : await Friend.findOne({ userId: gameData.authorId, friendFor: userId });
    const likedGame = await GameLike.exists({ gameId, userId });

    res.json({
        code: 1,
        message: "SUCCESS",
        data: {
            gameId,
            gameName: gameData.gameTitle,
            gameDetail: gameData.gameDetail,
            gameTypes: gameData.gameTypes,
            appreciate: !!likedGame,
            praiseNumber: gameData.praiseNumber,
            bannerPic: [`https://static-xenox-service.vercel.app/game-banners/${gameId}.png`],
            authorInfo: {
                userId: gameData.authorId,
                nickName: author.nickname,
                headPic: author.picUrl,
                isAddFriend: !!friendEntry ? 1 : 0
            },
            warmUpResponse: {
                gameId,
                bannerPic: [`https://static-xenox-service.vercel.app/game-banners/${gameId}.png`],
                gameDetail: gameData.gameDetail,
                featuredPlay: gameData.featuredPlay
            }
        }
    });
});

router.put('/api/v1/games/:gameId/appreciation', async (req, res) => {
    const { gameId } = req.params;
    const userId = req.headers.userid;

    const gameData = await Game.findOne({ gameId });
    if (!gameData) return res.json({ code: 2002, message: "The specified game does not exist", data: null });

    const alreadyLiked = await GameLike.exists({ gameId, userId });
    if (alreadyLiked) return res.json({ code: 2005, message: "You already liked this game", data: null });

    await new GameLike({ gameId, userId }).save();
    await Game.findOneAndUpdate({ gameId }, { $inc: { praiseNumber: 1 } });

    res.json({ code: 1, message: "SUCCESS", data: null });
});

module.exports = router;