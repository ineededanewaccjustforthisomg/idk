const express = require('express');
const router = express.Router();
const Account = require('../models/account-model');
const MailBindTypes = require('../constants/MailBindTypes');
const Mailer = require('../common/Mailer');

const emailCodes = new Map();
const emailReqs = new Map();

router.post('/api/v1/email/send', async (req, res) => {
    const userId = req.headers.userid;
    const bindType = Number(req.query.bindType);
    const email = req.body.email;

    if (![MailBindTypes.BIND, MailBindTypes.UNBIND].includes(bindType)) {
        return res.status(200).json({ code: 6, message: 'Invalid parameter', data: null });
    }

    if (bindType === MailBindTypes.BIND && !email) {
        return res.status(200).json({ code: 6, message: 'Invalid parameter', data: null });
    }

    const existing = await Account.findOne({ email });
    if (existing && bindType === MailBindTypes.BIND) {
        return res.status(200).json({
            code: 113,
            message: 'This email was already bound to an account',
            data: null
        });
    }

    const code = Math.floor(100000 + Math.random() * 900000);
    emailCodes.set(`request_${userId}`, String(code));

    if (bindType === MailBindTypes.BIND) {
        emailReqs.set(`email_request_${userId}`, email);
    }

    setTimeout(() => {
        emailCodes.delete(`request_${userId}`);
        emailReqs.delete(`email_request_${userId}`);
    }, 300000);

    const mailResult = await Mailer.send(
        'Blockveil',
        'blockveil.smtp@gmail.com',
        'angelojudeserranothe2nd@gmail.com',
        `Blockveil Email Binding ${code}`,
        `Your code is <b>${code}</b>.`
    );

    if (!mailResult.success) {
        return res.status(200).json({ code: 4, message: 'INNER ERROR', data: null });
    }

    return res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
});

router.post('/api/v1/email/bind', async (req, res) => {
    const userId = req.headers.userid;
    const verifyCode = Number(req.query.verifyCode);

    if (!verifyCode) {
        return res.status(200).json({ code: 6, message: 'Invalid parameter', data: null });
    }

    const email = emailReqs.get(`email_request_${userId}`);
    const code = emailCodes.get(`request_${userId}`);

    if (!email || code !== String(verifyCode)) {
        return res.status(200).json({
            code: 107,
            message: 'The provided code is invalid or no request has been made to bind an email',
            data: null
        });
    }

    const account = await Account.findOne({ userId });
    account.email = email;
    await account.save();

    return res.status(200).json({ code: 1, message: 'SUCCESS', data: email });
});

router.delete('/api/v1/email/bind', async (req, res) => {
    const userId = req.headers.userid;
    const verifyCode = Number(req.query.verifyCode);
    const code = emailCodes.get(`request_${userId}`);

    if (!verifyCode || code !== String(verifyCode)) {
        return res.status(200).json({
            code: 107,
            message: 'The provided code is invalid or no request has been made to bind an email',
            data: null
        });
    }

    const account = await Account.findOne({ userId });
    account.email = '';
    await account.save();

    return res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
});

module.exports = router;