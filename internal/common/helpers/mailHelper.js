const User = require('../../models/user-model');
const Mail = require('../../models/mail-model');
const MailStatuses = require("../../common/constants/MailStatuses");
const MailAttachmentTypes = require("../../common/constants/MailAttachmentTypes");

const getMail = async (userId, removeReadMails) => {
    const userMails = await Mail.find({ userId });

    const mailRecords = userMails.map(mail => ({
        id: mail.id,
        title: mail.title,
        content: mail.description,
        sendDate: mail.sendDate.getTime(),
        status: mail.status,
        type: mail.type,
        attachment: mail.attachment || null,
        extra: mail.extra
    }));
    
    const mails = [];
    
    for (let i = 0; i < mailRecords.length; i++) {        
        if (mailRecords[i].status == MailStatuses.DELETE) {
            continue;
        }

        if (removeReadMails && mailRecords[i].status == MailStatuses.READ) {
            continue;
        }

        const mailId = mailRecords[i].id;
    
        const mailData = await Mail.findOne({ id: mailId });
        if (!mailData) {
            continue;
        }

        mailData.status = mailRecords[i].status;
        mails.push(mailData);
    }
    
    /* SOON
        const rewardMail = await getDiamondGiftMail(userId);
        if (rewardMail) {
            mails.push(rewardMail);
        }
    */
    
    return mails;
};

const isNewMail = async (userId) => {
    const userMails = await Mail.find({ userId });

    const mailRecords = userMails.map(mail => ({
        id: mail.id,
        title: mail.title,
        content: mail.description,
        sendDate: mail.sendDate.getTime(),
        status: mail.status,
        type: mail.type,
        attachment: mail.attachment || null,
        extra: mail.extra
    }));
    
    let hasNewMail = false;
    for (let i = 0; i < mailRecords.length; i++) {
        if (mailRecords[i].status == MailStatuses.UNREAD) {
            hasNewMail = true;
            break;
        }
    }
    
    return hasNewMail;
};

module.exports = {
    getMail,
    isNewMail
};