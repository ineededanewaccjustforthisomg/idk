const express = require('express');
const router = express.Router();
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const axios = require("axios");

const logger = require("../common/logger");
const { getConfig } = require('../common/helpers/configHelper');
const Locale = require('../models/locale-model');
const languages = require('../common/language');
const dispatchConfig = require("../common/dispatch/defaultDispatchConfig");
const configuration = require("../config/highLevelConfig");
const dispatchManager = require("../common/dispatch/dispatchHelper");
const RoomController = require("../common/dispatch/controller");
const Dressing = require('../models/dressingEquipped-model');
const User = require('../models/user-model');
const Vip = require('../models/vip-model');

// Made by Fijlow 10/17/25

router.post('/v1/dispatch', async (req, res) => {
    try {
        const gameId = req.query.gameId;
        const userId = req.headers.userid;
        const userToken = req.headers['access-token'];

        if (!userId || !userToken) {
            return res.status(400).json({
                code: 400,
                message: "userId and access-token are expected",
                data: null
            });
        }

        if (!gameId) {
            return res.status(500).json({
                code: 4,
                message: "INNER ERROR",
                data: null
            });
        }

        const DressIds = {
            HAIR: 2,
            GLASSES: 3,
            FACE: 4,
            ACTION: 5,
            SKIN: 6,
            TOP: 8,
            PANTS: 9,
            SHOES: 10,
            HAT: 11,
            SCARF: 13,
            WINGS: 14,
            CROWN: 15
        };

        const validAvatarTypeIds = Object.values(DressIds);

        const [user, vip, localeData, clothes] = await Promise.all([
            User.findOne({ userId }),
            Vip.findOne({ userId }),
            Locale.findOne({ userId }),
            Dressing.find({
                userId,
                avatarTypeId: { $in: validAvatarTypeIds }
            })
        ]);

        if (!user || !vip) {
            return res.status(200).json({
                code: 1002,
                message: "The profile doesn't exist",
                data: null
            });
        }

        const gameNames = {
            games: [
                { id: "g1008", name: "BedWar" },
                { id: "g1007", name: "BowSpleef" },
                { id: "g1028", name: "Budokai" },
                { id: "g1023", name: "BuildBattle" },
                { id: "g1001", name: "HungryGame" },
                { id: "g1019", name: "CreepyAliens" },
                { id: "g1018", name: "EggWar" },
                { id: "g1022", name: "FlagWar" },
                { id: "g1017", name: "HideAndSeek" },
                { id: "g1003", name: "TeamHungryGame" },
                { id: "g1014", name: "JailBreak" },
                { id: "g1024", name: "JewelKnight" },
                { id: "g1009", name: "MurderMystery" },
                { id: "g1021", name: "Parkour" },
                { id: "g1027", name: "SkyRoyale" },
                { id: "g1002", name: "SkyWar" },
                { id: "g1011", name: "SnowballBattle" },
                { id: "g1030", name: "SnowmanBattle" },
                { id: "g1012", name: "SnowBattle" },
                { id: "g1029", name: "SuperWall" },
                { id: "g1026", name: "ThrowPot" },
                { id: "g1020", name: "TinyTown" },
                { id: "g1010", name: "TNTRun" },
                { id: "g1025", name: "Tycoon" },
                { id: "g1013", name: "ZombieInfecting" }
            ]
        };

        const serverList = dispatchManager.getServerList(gameId);

        if (!serverList) {
            const game = gameNames.games.find(g => g.id === gameId);
            const gameName = game ? game.name : "HungryGame";

            dispatchManager.newServer(gameId, gameName);
            return res.status(200).json({ code: 2, message: "create_game", data: null });
        }

        const serverIp = serverList.serverAddress;
        const mapId = serverList.mapName;
        const address = configuration.dispAddress;

        if (userToken?.length !== 40) {
            return res.status(500).json({
                code: 4,
                message: "INNER ERROR",
                data: null
            });
        }

        const gameDispatchConfig = { ...dispatchConfig };
        gameDispatchConfig.timestamp = Math.floor(Date.now() / 1000);
        gameDispatchConfig.gaddr = serverIp.replace("0.0.0.0", address);
        gameDispatchConfig.downurl = `http://192.168.1.7:7500/maps/${mapId}.zip`;
        gameDispatchConfig.name = gameId;
        gameDispatchConfig.mname = gameId;
        gameDispatchConfig.mid = gameId;
        gameDispatchConfig.signature = userToken;
        
        function getRegionId() {
            if (localeData.language === 'en') return 1001;
        
            const languageKeys = Object.keys(languages);
            const index = languageKeys.indexOf(localeData.language);
        
            if (index === -1) return 1001;
            return 1002 + index;
        }
        
        const userAttributes = {
            id: Number(userId),
            clz: 0,
            team: crypto.randomInt(2, 5),
            rid: getRegionId(),
            pioneer: true,
            sex: user.sex,
            vip: vip.vip,
            tid: Number(userId),
            loc: 1,
            skin: {
                custom_face: "1",
                custom_hair: "1",
                clothes_tops: "1",
                clothes_pants: "1",
                custom_shoes: "1",
                custom_glasses: "0",
                custom_scarf: "0",
                custom_wing: "0",
                custom_hat: "0",
                custom_crown: "0",
                skin_color: "255-219-172-255",
                animation_idle: "0"
            }
        };

        function getResourceId(clothes, typeId) {
            if (!Array.isArray(clothes)) return "1";
            const item = clothes.find(i => Number(i.avatarTypeId) === Number(typeId));
            if (item && item.avatarResourceId) {
                const match = item.avatarResourceId.match(/\.(\d+)$/);
                if (match) return match[1];
            }
            return "1";
        }

        if (clothes && clothes.length > 0) {
            userAttributes.skin.custom_face = getResourceId(clothes, DressIds.FACE);
            userAttributes.skin.custom_hair = getResourceId(clothes, DressIds.HAIR);
            userAttributes.skin.clothes_tops = getResourceId(clothes, DressIds.TOP);
            userAttributes.skin.clothes_pants = getResourceId(clothes, DressIds.PANTS);
            userAttributes.skin.custom_shoes = getResourceId(clothes, DressIds.SHOES);
            userAttributes.skin.custom_glasses = getResourceId(clothes, DressIds.GLASSES);
            userAttributes.skin.custom_scarf = getResourceId(clothes, DressIds.SCARF);
            userAttributes.skin.custom_wing = getResourceId(clothes, DressIds.WINGS);
            userAttributes.skin.custom_hat = getResourceId(clothes, DressIds.HAT);
            userAttributes.skin.custom_crown = getResourceId(clothes, DressIds.CROWN);
        }

        setTimeout(() => {
            RoomController.sendUserToServer(serverIp, userAttributes);
        }, 3000);

        res.status(200).json({ code: 1, message: "SUCCESS", data: gameDispatchConfig });

    } catch (err) {
        logger.error(`Dispatch error: ${err.message}`);
        res.status(500).json({
            code: 500,
            message: "Internal server error",
            data: null
        });
    }
});

module.exports = router;