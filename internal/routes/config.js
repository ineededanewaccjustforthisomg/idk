const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const { getConfig } = require('../common/helpers/configHelper');

router.get('/files/:filename', async (req, res) => {
    const { filename } = req.params;

    try {
        const response = await fetch(`https://static-xenox-service.vercel.app/appconfigs/${filename}.json`);
        if (!response.ok) {
            return res.status(404).json({ code: 404, message: 'Config not found', data: null });
        }

        const data = await response.json();

        if (filename === 'blockymods-check-version') {
            return res.status(200).json({
                code: 1,
                message: 'SUCCESS',
                data: {
                    picUrl: 'https://i.ibb.co/3YN62Tw9/20250511-091050.png',
                    versionCode: 0,
                    updateInfo: 'NEW:\n- Online & Offline System \n- Actvity System \n\nFixes:\n- Fixed issue with dressing.',
                    forceUpdate: true,
                    newVersionCode: 0,
                    smallerThanVersion: 0,
                    forceUpdateMinVersionCode: 0,
                    forceUpdateMaxVersionCode: 0,
                    apkUrl: 'https://www.mediafire.com/file/1qzimbbpn24fr9b/app-blockveil-build-10003-10038-debug.apk/file?dkey=hehr1me8rhi&r=817#',
                    status: 0,
                    url: 'https://www.mediafire.com/file/1qzimbbpn24fr9b/app-blockveil-build-10003-10038-debug.apk/file?dkey=hehr1me8rhi&r=817#'
                }
            });
        }

        if (filename === 'blockmods-config' || filename === 'blockymods-check-version') {
            return res.status(200).json({ code: 1, message: 'SUCCESS', data });
        }

        return res.status(200).json(data);
    } catch (err) {
        console.error('Error fetching config:', err);
        res.status(500).json({ code: 0, message: 'Failed to load config' });
    }
});

router.get('/files/announcement/info', async (req, res) => {
    try {
        const config = await getConfig('announcement');
        res.status(200).json({ code: 1, message: 'SUCCESS', data: config.configData });
    } catch (err) {
        console.error('Error loading announcement:', err);
        res.status(500).json({ code: 0, message: 'Failed to load announcement data' });
    }
});

router.get('/files/stop/announcement/info', async (req, res) => {
    try {
        const config = await getConfig('stop-announcement');
        if (!config?.configData) {
            return res.status(404).json({ code: 0, message: 'Stop announcement not found' });
        }
        res.status(200).json({ code: 1, message: 'SUCCESS', data: config.configData });
    } catch (err) {
        console.error('Error loading stop announcement:', err);
        res.status(500).json({ code: 0, message: 'Failed to load stop announcement data' });
    }
});

module.exports = router;