"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const FudgeNetwork = __importStar(require("./../ModuleCollector"));
class PeerMessageSimpleText {
    constructor(_originatorId, _messageData) {
        this.messageType = FudgeNetwork.MESSAGE_TYPE.PEER_TEXT_MESSAGE;
        this.commandType = FudgeNetwork.SERVER_COMMAND_TYPE.UNDEFINED;
        this.originatorId = _originatorId;
        this.messageData = _messageData;
    }
}
exports.PeerMessageSimpleText = PeerMessageSimpleText;
class PeerMessageDisconnectClient {
    constructor(_originatorId) {
        this.messageType = FudgeNetwork.MESSAGE_TYPE.PEER_TO_SERVER_COMMAND;
        this.commandType = FudgeNetwork.SERVER_COMMAND_TYPE.DISCONNECT_CLIENT;
        this.originatorId = _originatorId;
    }
}
exports.PeerMessageDisconnectClient = PeerMessageDisconnectClient;
class PeerMessageKeysInput {
    constructor(_originatorId, _pressedKeycode, _pressedKeyCodes) {
        this.messageType = FudgeNetwork.MESSAGE_TYPE.PEER_TO_SERVER_COMMAND;
        this.commandType = FudgeNetwork.SERVER_COMMAND_TYPE.KEYS_INPUT;
        this.originatorId = _originatorId;
        this.pressedKey = _pressedKeycode;
        if (_pressedKeyCodes) {
            this.pressedKeys = _pressedKeyCodes;
        }
        else {
            this.pressedKeys = null;
        }
    }
}
exports.PeerMessageKeysInput = PeerMessageKeysInput;
