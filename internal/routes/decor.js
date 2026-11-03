const express = require('express');
const router = express.Router();

const dressingEquipped = require('../models/dressingEquipped-model');

// Decoration configs
const tops = require('../config/decoration/tops');
const hairs = require('../config/decoration/hats');
const wings = require('../config/decoration/backs');
const faces = require('../config/decoration/faces');
const emotes = require('../config/decoration/idles');
const colors = require('../config/decoration/colors');
const backgrounds = require('../config/decoration/backgrounds');
const vipColors = require('../config/decoration/vip-colors');

const decorations = [tops, hairs, wings, faces, emotes, colors, backgrounds, vipColors];

function filterByKeyValues(data, key, values) {
    return Array.isArray(data) ? data.filter(item => values.includes(item[key])) : [];
}

function buildPaginatedResponse(pageNo, pageSize, data, other = null) {
    const isEmpty = pageNo !== 0;
    return {
        code: 1,
        message: 'SUCCESS',
        data: {
            pageNo,
            pageSize,
            totalPage: 0,
            totalSize: 0,
            data: isEmpty ? [] : data,
            other
        }
    };
}

function registerDecorationRoute(index, dataSource) {
    router.get(`/api/:version/decorations/${index}`, (req, res) => {
        const pageNo = parseInt(req.query.pageNo) || 0;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const result = filterByKeyValues(dataSource, 'sex', [0, 1]);
        res.status(200).json(buildPaginatedResponse(pageNo, pageSize, result));
    });
}

registerDecorationRoute(1, tops);
registerDecorationRoute(2, hairs);
registerDecorationRoute(3, wings);
registerDecorationRoute(4, faces);
registerDecorationRoute(5, emotes);
registerDecorationRoute(6, colors);
registerDecorationRoute(7, backgrounds);

router.get('/api/:version/vip/decorations/users/6', (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;
    res.status(200).json(buildPaginatedResponse(pageNo, pageSize, vipColors));
});

['1', '3'].forEach(id => {
    router.get(`/api/:version/vip/decorations/users/${id}`, (req, res) => {
        res.json({ code: 1, message: 'SUCCESS', data: [], other: null });
    });
});

router.put('/api/v1/decorations/using/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.headers.userid;
        if (!userId) return res.status(400).json({ code: 400, message: 'UserId header is required', data: null });

        let foundAvatar = null;
        for (const decoration of decorations) {
            foundAvatar = decoration.find(avatar => avatar.id === parseInt(id, 10));
            if (foundAvatar) break;
        }

        if (!foundAvatar) {
            return res.status(200).json({ code: 121, message: 'Decoration not exist', data: null });
        }

        await dressingEquipped.deleteOne({ userId, avatarTypeId: foundAvatar.typeId });

        const newItem = new dressingEquipped({
            userId,
            avatarId: foundAvatar.id,
            avatarTypeId: foundAvatar.typeId,
            avatarCamera: foundAvatar.camera,
            avatarName: foundAvatar.name,
            avatarIconUrl: foundAvatar.iconUrl,
            avatarResourceId: foundAvatar.resourceId,
            avatarDetails: foundAvatar.details,
            status: 1
        });

        await newItem.save();

        res.status(200).json({ code: 1, message: 'SUCCESS', data: foundAvatar });
    } catch (err) {
        console.error('Error in PUT /decorations/using:', err);
        res.status(500).json({ code: 500, message: 'Internal server error', data: null });
    }
});

router.delete('/api/v1/decorations/using/:id', async (req, res) => {
    try {
        const userId = req.headers.userid;
        const { id: avatarId } = req.params;

        const deletedAvatar = await dressingEquipped.findOneAndDelete({ userId, avatarId });
        if (!deletedAvatar) {
            return res.status(404).json({ code: 6001, message: 'You have not equipped this', data: null });
        }

        const responseData = {
            id: deletedAvatar.avatarId,
            typeId: deletedAvatar.avatarTypeId,
            camera: deletedAvatar.avatarCamera,
            name: deletedAvatar.avatarName,
            iconUrl: deletedAvatar.avatarIconUrl,
            resourceId: deletedAvatar.avatarResourceId,
            details: deletedAvatar.avatarDetails
        };

        res.status(200).json({ code: 1, message: 'SUCCESS', data: responseData });
    } catch (err) {
        console.error('Error in DELETE /decorations/using:', err);
        res.status(500).json({ code: 500, message: 'Internal server error', data: null });
    }
});

router.get('/api/:version/decorations/:otherId/using', async (req, res) => {
    try {
        const otherId = req.params.otherId;
        const items = await dressingEquipped.find({ userId: otherId });

        const data = items.map(d => ({
            id: d.avatarId,
            typeId: d.avatarTypeId,
            camera: d.avatarCamera,
            name: d.avatarName,
            iconUrl: d.avatarIconUrl,
            resourceId: d.avatarResourceId,
            details: d.avatarDetails,
            price: d.avatarPrice,
            currency: d.avatarCurrency,
            status: 1
        }));

        res.status(200).json({ code: 1, message: 'SUCCESS', data });
    } catch (err) {
        console.error('Error fetching decorations for otherId:', err);
        res.status(500).json({ code: 500, message: 'Internal server error', data: null });
    }
});

router.get('/api/v1/decorations/using', async (req, res) => {
    try {
        const userId = req.headers.userid;
        if (!userId) return res.status(400).json({ code: 400, message: 'UserId header is required', data: null });

        const items = await dressingEquipped.find({ userId });

        const data = items.map(d => ({
            id: d.avatarId,
            typeId: d.avatarTypeId,
            camera: d.avatarCamera,
            name: d.avatarName,
            iconUrl: d.avatarIconUrl,
            resourceId: d.avatarResourceId,
            details: d.avatarDetails,
            price: d.avatarPrice,
            currency: d.avatarCurrency,
            status: 1
        }));

        res.status(200).json({ code: 1, message: 'SUCCESS', data });
    } catch (err) {
        console.error('Error fetching user decorations:', err);
        res.status(500).json({ code: 500, message: 'Internal server error', data: null });
    }
});

module.exports = router;