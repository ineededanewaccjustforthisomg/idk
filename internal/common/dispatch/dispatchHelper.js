const { spawn } = require("child_process");
const treeKill = require("tree-kill");
const logger = require("../logger");
const configuration = require("../../config/highLevelConfig");

const servers = new Map();

function addServer(pid, serverAddress, gameType, mapName, maxPlayers) {
    servers.set(pid, {
        pid: pid,
        serverSocket: {},
        serverAddress: serverAddress,
        gameType: gameType,
        mapName: mapName,
        maxPlayers: maxPlayers,
        currentPlayers: 0,
        status: 7,
        gamePlayers: [],
        heartbeatCount: 0
    });
}

const usedPorts = new Set();
const portRange = {
    start: configuration.dispNextPortA,
    end: configuration.dispNextPortB,
};

async function getNextPort() {
    for (let port = 19130; port <= portRange.end; port++) {
        if (!usedPorts.has(port)) {
            usedPorts.add(port);
            return port;
        }
    }
}

async function getAllPorts() {
    return Array.from(servers.values())
        .map(s => {
            const parts = s.serverAddress.split(":");
            return parts[1];
        })
        .filter(Boolean);
}

function getServerList(gameType) {
    const availableServers = Array.from(servers.values())
        .filter(s => s.gameType === gameType && s.currentPlayers < s.maxPlayers);

    if (availableServers.length === 0) return undefined;
    const randomIndex = Math.floor(Math.random() * availableServers.length);
    return availableServers[randomIndex];
}

function getAllPlayers(gameType) {
    return Array.from(servers.values())
        .filter(s => s.gameType === gameType && s.currentPlayers > 0) // only servers with players
        .reduce((sum, s) => sum + s.currentPlayers, 0); // sum currentPlayers
}

async function getRandomMapConfiguration(gameId) {
    const GAME_MAPS = {
        g1001: { maps: ["m1001_1", "m1001_2", "m1001_3", "m1001_4", "m1001_5"], maxPlayers: 24, teamNumber: 0 },
        g1002: { maps: ["m1002_1", "m1002_2", "m1002_3", "m1002_4", "m1002_5", "m1002_6", "m1002_7", "m1002_8", "m1002_9"], maxPlayers: 8, teamNumber: 0 },
        g1003: { maps: ["m1003_1"], maxPlayers: 24, teamNumber: 4 },
        g1007: { maps: ["m1007"], maxPlayers: 12, teamNumber: 0 },
        g1008: { maps: ["m1008_1", "m1008_2", "m1008_3", "m1008_4"], maxPlayers: 16, teamNumber: 4 },
        g1009: { maps: ["m1009"], maxPlayers: 12, teamNumber: 0 },
        g1010: { maps: ["m1010"], maxPlayers: 8, teamNumber: 0 },
        g1011: { maps: ["m1011_1", "m1011_2", "m1011_3", "m1011_4"], maxPlayers: 8, teamNumber: 2 },
        g1012: { maps: ["m1012"], maxPlayers: 12, teamNumber: 2 },
        g1013: { maps: ["m1013"], maxPlayers: 25, teamNumber: 0 },
        g1014: { maps: ["m1014"], maxPlayers: 30, teamNumber: 0 },
        g1015: { maps: ["m1015"], maxPlayers: 10, teamNumber: 0 },
        g1016: { maps: ["m1016"], maxPlayers: 30, teamNumber: 0 },
        g1017: { maps: ["m1017"], maxPlayers: 15, teamNumber: 0 },
        g1018: { maps: ["m1018_1", "m1018_2", "m1018_3", "m1018_4"], maxPlayers: 16, teamNumber: 4 },
        g1019: { maps: ["m1019"], maxPlayers: 10, teamNumber: 0 },
        g1020: { maps: ["m1020"], maxPlayers: 10, teamNumber: 0 },
        g1021: { maps: ["m1021_1", "m1021_2", "m1021_3", "m1021_4"], maxPlayers: 12, teamNumber: 0 },
        g1022: { maps: ["m1022"], maxPlayers: 16, teamNumber: 2 },
        g1023: { maps: ["m1023"], maxPlayers: 8, teamNumber: 0 },
        g1024: { maps: ["m1024"], maxPlayers: 32, teamNumber: 4 },
        g1025: { maps: ["m1025"], maxPlayers: 10, teamNumber: 0 },
        g1026: { maps: ["m1026_1", "m1026_2"], maxPlayers: 30, teamNumber: 0 },
        g1027: { maps: ["m1027"], maxPlayers: 16, teamNumber: 4 },
        g1028: { maps: ["m1028"], maxPlayers: 16, teamNumber: 0 },
        g1029: { maps: ["m1029_1", "m1029_2"], maxPlayers: 16, teamNumber: 4 },
        g1030: { maps: ["m1030_1", "m1030_2", "m1030_3"], maxPlayers: 12, teamNumber: 2 },
        g1031: { maps: ["m1031"], maxPlayers: 6, teamNumber: 0 },
        g1032: { maps: ["m1032"], maxPlayers: 30, teamNumber: 0 },
        g1033: { maps: ["m1033"], maxPlayers: 12, teamNumber: 2 },
        g1036: { maps: ["m1036_1", "m1036_2"], maxPlayers: 18, teamNumber: 2 },
        g1046: { maps: ["m1046"], maxPlayers: 30, teamNumber: 0 },
    };

    const mapData = GAME_MAPS[gameId];
    if (mapData) {
        const { maps, maxPlayers, teamNumber } = mapData;
        const randomIndex = Math.floor(Math.random() * maps.length);
        const randomMap = maps[randomIndex];
        return {
            maps: [randomMap],
            maxPlayers,
            teamNumber
        };
    }

    return null;
}

async function newServer(gameId, gameName, mapId, maxPlayer, teamNumber) {
    if (!mapId || !maxPlayer || !teamNumber) {
        let { maps, maxPlayers, teamNumber } = await getRandomMapConfiguration(gameId);
        logger.info("Selected Map Config " + maps[0] + " " + maxPlayers + " " + teamNumber);
        mapId = maps[0];
        maxPlayer = maxPlayers;
        teamNumber = teamNumber;
    }

    const port = await getNextPort();
    const args = {
        ip: "0.0.0.0",
        port: port,
        logdir: `./Logs/${gameId}`,
        scriptdir: `./Script/g1001_g1030/${gameName}/src`,
        testscriptdir: `./Script/g1001_g1030/${gameName}/src`,
        scriptcommondir: "./Script/Common",
        testscriptcommondir: "./Script/Common",
        mapdir: `./map/${mapId}`,
        teamnum: teamNumber,
        id: gameId,
        mapid: mapId,
        name: mapId,
        monitoraddr: `127.0.0.1:${configuration.roomPort}`,
        maxplayer: maxPlayer,
        gtype: gameId,
        propAddr: "http://127.0.0.1:8080",
        rankAddr: "http://127.0.0.1:8080",
        rewardAddr: "http://127.0.0.1:8080",
        blockymodsUrl: "http://127.0.0.1:8080",
        blockymodsRewardAddr: "http://127.0.0.1:8080",
        blockmanUrl: "http://127.0.0.1:8080",
        gameDataServiceAddr: "http://127.0.0.1:8080",
        gameRankParams: "http://127.0.0.1:8080",
        dbconfig: configuration.dbConfig,
        redisConfig: configuration.redisConfig
    };
    
    const cmdString = JSON.stringify(args).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const command = `C:/Users/angelo/Documents/blockman-server/server-root/res/GameServer_d.exe ${cmdString}`;
    const serverProcess = spawn(command, { cwd: "C:/Users/angelo/Documents/blockman-server/server-root/res", shell: true, detached: true, windowsHide: false });

    serverProcess.on('error', (err) => {
        logger.error(`Failed to start server process: ${err.message}`);
    });

    serverProcess.on('exit', (code, signal) => {
        logger.info(`Server process exited: PID=${serverProcess.pid}, Code=${code}, Signal=${signal}`);
        servers.delete(serverProcess.pid);
    });
    
    logger.info(`Selected URL for ${gameId}: ${args.ip}:${args.port}`);
    addServer(serverProcess.pid, `${args.ip}:${args.port}`, args.gtype, args.mapid, args.maxplayer);
}

async function shutdownGame(pid) {
    const server = servers.get(pid);
    if (server) {
        treeKill(server.pid, 'SIGINT', (err) => {
            if (err) {
                logger.error(`Failed to kill server process with PID=${pid}: ${err.message}`);
            }
            logger.info(`Successfully killed server process with PID=${pid}`);
            servers.delete(pid);
        });
    } else {
        logger.error(`Server with PID=${pid} not found in servers map`);
    }
}

async function modifyServerConnect(newSocket, serverAddress) {
    for (const server of servers.values()) {
        if (server.serverAddress === serverAddress) {
            server.serverSocket = newSocket;
            logger.info(`Server with address ${serverAddress} has been updated with a new socket.`);
            break;
        }
    }
}

function removeServer(serverSocket) {
    for (const [pid, server] of servers.entries()) {
        if (server.serverSocket === serverSocket) {
            servers.delete(pid);
            logger.info(`Server with address ${server.serverAddress} has been removed from the server list.`);
            break;
        }
    }
}

async function modifyServerUpdate(socket, currentPlayers, status) {
    for (const server of servers.values()) {
        if (server.serverSocket === socket) {
            server.currentPlayers = currentPlayers;
            server.status = status;
            logger.info(`Server with address ${server.serverAddress} has been updated to it's latest server status and player count.`);
            break;
        }
    }
}

async function modifyUserIn(socket, userId) {
    for (const server of servers.values()) {
        if (server.serverSocket === socket) {
            server.currentPlayers += 1;
            server.gamePlayers.push(userId);
            logger.info(`Server with address ${server.serverAddress} has user id ${userId} joining!`);
            break;
        }
    }
}

async function modifyUserOut(socket, userId) {
    for (const server of servers.values()) {
        if (server.serverSocket === socket) {
            server.currentPlayers = Math.max(0, server.currentPlayers - 1);
            server.gamePlayers = server.gamePlayers.filter(id => id !== userId);
            logger.info(`User id ${userId} is leaving from server with address ${server.serverAddress}`);
            break;
        }
    }
}

async function handleHeartbeat(socket) {
    for (const server of servers.values()) {
        if (server.serverSocket === socket) {
            if (server.currentPlayers === 0) {
                server.heartbeatCount += 1;
                logger.warn(`Server with address ${server.serverAddress} sent a heartbeat with no players, shutdown is near!`);
                if (server.heartbeatCount >= 20) {
                    logger.info(`Shutting down server with address ${server.serverAddress} due to inactivity for 1 min`);
                    await shutdownGame(server.pid);
                }
            } else {
                server.heartbeatCount = 0;
                logger.info(`Server with address ${server.serverAddress} sent a heartbeat!`);
            }
            break;
        }
    }
}

function getServerSocket(serverAddress) {
    var serverArray = Array.from(servers.values());
    for(var i = 0; i < serverArray.length; i++) {
        if(serverArray[i].serverAddress == serverAddress) {
            return serverArray[i].serverSocket;
        }
    }
}

module.exports = { getAllPlayers, getServerSocket, handleHeartbeat, modifyUserIn, modifyUserOut, modifyServerUpdate, removeServer, modifyServerConnect, shutdownGame, getServerList, getRandomMapConfiguration, newServer }