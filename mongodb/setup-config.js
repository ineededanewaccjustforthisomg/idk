const mongoose = require('mongoose');
const { saveConfig } = require('../internal/common/helpers/configHelper');

mongoose.connect('mongodb+srv://julia:juliams2g@blockyplanet.etaegaj.mongodb.net/?retryWrites=true&w=majority&appName=BlockyPlanet', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

const defaultConfigs = [
    {
        name: "dispatch",
        data: {
            "g1014": "147.185.221.19:10554",
            "g1001": "147.185.221.19:10554"
        }
    },
    {
        name: "activityTitles",
        data: {
            activityTitleList: [
                { "titleName": "Login Gift", "pic": "http://static.sandboxol.com/sandbox/activity/sign_up_gift/sign_gift.png", "content": "activity:sign" }
            ]
        }
    },
    {
        name: "stop-announcement",
        data: {
           "id": "17",
           "content": "We will get to you shortly! This maintenance is due to bug fixing, go to our server to get more information.",
           "title": "Maintenance",
           "isShow": "false",
           "isShowInGame": "false"
        }
    },
    {
        name: "announcement",
        data: {
            "id": "17",
            "content": "This is a beta test, this game is unreliable to be online at all times.",
            "title": "Announcement!",
            "isShow": "true",
            "isShowInGame": "true",
            "updateTime": "0"
        }
    },
    {
        name: "activityActions",
        data: {
            activityTitleList: [
                {
                    "actionId": 7,
                    "actionName": "Login on Saturday",
                    "quantity": 1,
                    "dateType": "day",
                    "condition": "6",
                    "actionType": "common",
                    "actionFlag": "saturday_login",
                    "actionRewards": [
                        {
                            "rewardName": "1",
                            "rewardType": "diamond",
                            "quantity": 1,
                            "rewardPic": "http://static.sandboxol.com/sandbox/activity/treasurebox/Bcubes.png"
                        },
                        {
                            "rewardName": "200",
                            "rewardType": "gold",
                            "quantity": 200,
                            "rewardPic": "http://static.sandboxol.com/sandbox/activity/treasurebox/coin.png"
                        }
                    ]
                },
                {
                    "actionId": 8,
                    "actionName": "Login on Sunday",
                    "quantity": 1,
                    "dateType": "day",
                    "condition": "7",
                    "actionType": "common",
                    "actionFlag": "sunday_login",
                    "status": 1,
                    "actionRewards": [
                        {
                            "rewardName": "1",
                            "rewardType": "diamond",
                            "quantity": 1,
                            "rewardPic": "http://static.sandboxol.com/sandbox/activity/treasurebox/Bcubes.png"
                        },
                        {
                            "rewardName": "200",
                            "rewardType": "gold",
                            "quantity": 200,
                            "rewardPic": "http://static.sandboxol.com/sandbox/activity/treasurebox/coin.png"
                        }
                    ]
                }
            ]
        }
    }
];

async function init() {
    for (const cfg of defaultConfigs) {
        await saveConfig(cfg.name, cfg.data, false);
        console.log(`Config "${cfg.name}" initialized.`);
    }

    console.log("All default configs initialized!");
    mongoose.disconnect();
}

init();