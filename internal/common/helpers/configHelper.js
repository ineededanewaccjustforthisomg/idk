const Config = require('../../models/configuration-model');

const createOrModifyConfig = async (name, data) => {
    try {
        let existing = await Config.findOne({ configName: name });
        if (existing) {
            existing.configData = data;
            await existing.save();
            return existing;
        }

        const config = new Config({
            configName: name,
            configData: data
        });

        await config.save();
        return config;
    } catch (err) {
        return { error: err.message };
    }
};

const updateConfigData = async (name, updates) => {
    try {
        let config = await Config.findOne({ configName: name });

        if (!config) {
            config = new Config({
                configName: name,
                configData: updates
            });
        } else {
            config.configData = { ...config.configData, ...updates };
        }

        await config.save();
        return config;
    } catch (err) {
        return { error: err.message };
    }
};

const getConfig = async (name) => {
        const config = await Config.findOne({ configName: name });
        return config;
};

const saveConfig = async (name, data, merge = false) => {
    if (merge) return await updateConfigData(name, data);
    return await createOrModifyConfig(name, data);
};

module.exports = {
    createOrModifyConfig,
    updateConfigData,
    getConfig,
    saveConfig
};