import * as FudgeNetwork from "./../ModuleCollector";
export interface PeerMessageTemplate {

    originatorId: string;
    messageType: FudgeNetwork.MESSAGE_TYPE;
    commandType: FudgeNetwork.SERVER_COMMAND_TYPE;

}

export class PeerMessageSimpleText implements PeerMessageTemplate {
    originatorId: string;
    messageType: FudgeNetwork.MESSAGE_TYPE = FudgeNetwork.MESSAGE_TYPE.PEER_TEXT_MESSAGE;
    commandType: FudgeNetwork.SERVER_COMMAND_TYPE = FudgeNetwork.SERVER_COMMAND_TYPE.UNDEFINED;

    messageData: string;

    constructor(_originatorId: string, _messageData: string) {
        this.originatorId = _originatorId;
        this.messageData = _messageData;
    }
}

export class PeerMessageDisconnectClient implements PeerMessageTemplate {
    originatorId: string;
    messageType: FudgeNetwork.MESSAGE_TYPE = FudgeNetwork.MESSAGE_TYPE.PEER_TO_SERVER_COMMAND;
    commandType: FudgeNetwork.SERVER_COMMAND_TYPE = FudgeNetwork.SERVER_COMMAND_TYPE.DISCONNECT_CLIENT;

    constructor(_originatorId: string) {
        this.originatorId = _originatorId;
    }
}

export class PeerMessageKeysInput implements PeerMessageTemplate {
    originatorId: string;
    messageType: FudgeNetwork.MESSAGE_TYPE = FudgeNetwork.MESSAGE_TYPE.PEER_TO_SERVER_COMMAND;
    commandType: FudgeNetwork.SERVER_COMMAND_TYPE = FudgeNetwork.SERVER_COMMAND_TYPE.KEYS_INPUT;

    pressedKey: number;
    pressedKeys: number[] | null;

    constructor(_originatorId: string, _pressedKeycode: number, _pressedKeyCodes?: number[]) {
        this.originatorId = _originatorId;
        this.pressedKey = _pressedKeycode;
        if (_pressedKeyCodes) {
            this.pressedKeys = _pressedKeyCodes;
        }
        else { this.pressedKeys = null; }
    }
}

