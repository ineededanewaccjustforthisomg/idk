const express = require('express');
const router = express.Router();

const MailManager = require('../common/helpers/mailHelper');
const Mail = require('../models/mail-model');
const { MailStatuses } = require('../constants/MailStatuses');

router.get('/api/v1/mail', async (req, res) => {
    try {
        const userId = req.headers['userid'];
        const mailbox = (await MailManager.getMail(userId))
            .sort((a, b) => {
                if (a.getStatus() !== b.getStatus()) {
                    return a.getStatus() - b.getStatus();
                }
                return b.getCreationTime() - a.getCreationTime();
            })
            .map(mail => mail.response());

        res.status(200).json({ code: 1, message: 'SUCCESS', data: mailbox });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 0, message: 'Server error', data: null });
    }
});

router.put('/api/v1/mail', async (req, res) => {
    try {
        const userId = req.headers['userid'];
        let ids = req.query.ids;
        const status = parseInt(req.query.status);

        if (!status || !ids) {
            return res.status(400).json({ code: 6, message: 'Invalid parameter', data: null });
        }

        if (status < MailStatuses.READ || status > MailStatuses.DELETE) {
            return res.status(400).json({ code: 6, message: 'Invalid parameter', data: null });
        }

        if (status === MailStatuses.NONE) {
            return res.status(400).json({ code: 6, message: 'Status cannot be 0', data: null });
        }

        ids = Array.isArray(ids) ? ids : [ids];

        const mailbox = await Mail.find({ id: { $in: ids }, userId });

        if (!mailbox.length) {
            return res.status(404).json({ code: 1, message: 'Mail not found', data: null });
        }

        for (const mail of mailbox) {
            if (status === MailStatuses.DELETE) {
                if (mail.status === MailStatuses.READ) {
                    await Mail.deleteMany({ id: mail.id, userId });
                }
                continue;
            }

            if (status === MailStatuses.READ && mail.attachment !== null) {
                continue;
            }

            if (status < mail.status) continue;

            mail.status = status;
            await mail.save();
        }

        res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 0, message: 'Server error', data: null });
    }
});

router.get('/api/v1/mail/new', async (req, res) => {
    try {
        const userId = req.headers['userid'];
        const newMail = await MailManager.isNewMail(userId);
        res.status(200).json({ code: 1, message: 'SUCCESS', data: newMail });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 0, message: 'Server error', data: null });
    }
});

module.exports = router;