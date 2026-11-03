const constants = require("./constants");
const ServerManager = require("./dispatchHelper");
const createPacket = require("./packet");

exports.handleResponse = (socket, data) => {
    const request = this.parsePacket(data);

    switch(request.type) {
        case constants.GAME_SERVER_CONNECT:
            return this.onServerConnects(socket, request.data);
        case constants.GAME_SERVER_GAME_STATUS:
            return this.onGameStatusUpdate(socket, request.data);
        case constants.GAME_SERVER_USER_IN:
            return this.onUserInUpdate(socket, request.data);
        case constants.GAME_SERVER_USER_OUT:
            return this.onUserOutUpdate(socket, request.data);
        case constants.GAME_SERVER_HEARTBEAT:
            return this.onHeartbeat(socket);
        default:
            return this.emptyResponse();
    }
}

exports.onServerConnects = (socket, data) => {
    const serverInfo = JSON.parse(data)["config"];
    ServerManager.modifyServerConnect(socket, `${serverInfo.ip}:${serverInfo.port}`);

    return this.emptyResponse();
}

exports.onGameStatusUpdate = (socket, data) => {
    const statusInfo = JSON.parse(data);
    if (statusInfo.stat == 8) {
        return ServerManager.removeServer(socket);
    }

    ServerManager.modifyServerUpdate(socket, statusInfo.cur, statusInfo.stat)

    return this.emptyResponse();
}

exports.onUserInUpdate = (socket, data) => {
    const userInfo = JSON.parse(data);
    ServerManager.modifyUserIn(socket, userInfo.id);

    return this.emptyResponse();
}

exports.onUserOutUpdate = (socket, data) => {
    const userInfo = JSON.parse(data);
    ServerManager.modifyUserOut(socket, userInfo.id);

    return this.emptyResponse();
}

exports.onHeartbeat = (socket) => {
    ServerManager.handleHeartbeat(socket);
    
    return this.emptyResponse();
}

exports.sendUserToServer = (addr, data) => {
    const packetUserAttr = createPacket(constants.ROOM_MANAGER_USER_ATTRIBUTE, JSON.stringify(data));
    const socket = ServerManager.getServerSocket(addr);
    if (socket == null) {
        return;
    }

    this.sendResponse(socket, packetUserAttr);
}

exports.sendBroadcastMessage = (addr, data) => {
    const packetBroadcast = createPacket(constants.ROOM_MANAGER_BROADCAST_MESSAGE, JSON.stringify(data));
    const socket = ServerManager.getServerSocket(addr);
    if (socket == null) {
        return;
    }

    this.sendResponse(socket, packetBroadcast);
}

exports.sendResponse = (socket, response) => {
    const packet = Buffer.alloc(response.length + 12);
    packet.writeInt32BE(response.length + 4, 0);
    packet.writeInt32BE(response.type, 4);
    packet.write(response.data, 8, "utf-8");

    socket.write(packet);
}

exports.emptyResponse = () => {
    return createPacket(0, "");
}

exports.parsePacket = (requestData) => {
    const packetLength = requestData.readInt32BE(0);
    const packetType = requestData.readInt32BE(4);
    const packetData = requestData.toString("utf8", 8, packetLength + 4);

    return createPacket(packetType, packetData);
}