const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const router = express.Router();
const fs = require('fs');

router.get('/api/v1/msg/group/chat/list', async (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;
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

        res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: {
                pageNo,
                pageSize,
                totalPage: 0,
                totalSize: 0,
                data: [],
                other: null
            }
        });
});

router.get('/api/v1/group/chat/price', async (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;
    res.status(200).json({ 
        code: 1, 
        message: 'SUCCESS', 
        data: {
            "maxRequestLength": 32,
            "maxAliasLength": 16,
            "currencyGroup": 1,
            "priceGroup": 60
        } 
    });
});

module.exports = router;