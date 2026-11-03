const Locale = require('../../models/locale-model');
const languages = require('../../config/language');

async function setUserLanguage(userId, languageName) {
    if (!userId || !languageName) {
        throw new Error("The parameter userId and language are required");
    }

    if (!languages.includes(languageName)) {
        throw new Error("The language does not exist");
    }

    let locale = await Locale.findOne({ userId });

    if (!locale) {
        locale = new Locale({ userId, language: languageName });
        await locale.save();
    } else {
        locale.language = languageName;
        await locale.save();
    }

    return locale;
}

async function getUserLocale(userId, field) {
    if (!userId) {
        throw new Error("The parameter userId is required");
    }

    const locale = await Locale.findOne({ userId });
    return locale ? locale[field] : null;
}

module.exports = { setUserLanguage, getUserLocale };