export abstract class UiElementHandler {
    // tslint:disable-next-line: typedef
    public static electronWindow: Document;
    public static signalingSubmit: HTMLElement;
    public static signalingUrl: HTMLInputElement;
    public static loginNameInput: HTMLInputElement | null;
    public static loginButton: HTMLElement;
    public static msgInput: HTMLInputElement;
    public static chatbox: HTMLInputElement;
    public static sendMsgButton: HTMLElement;
    public static connectToUserButton: HTMLElement;
    public static usernameToConnectTo: HTMLInputElement;
    public static disconnectButton: HTMLElement;
    public static startSignalingButton: HTMLElement;
    public static peerToPeerHtmlElements: HTMLElement;
    public static authoritativeElements: HTMLElement;
    public static switchModeButton: HTMLElement;
    public static stopSignalingServer: HTMLElement;
    public static broadcastButton: HTMLElement;
    public static moveableBoxElement: HTMLElement;
    public static signalingElements: HTMLElement;
    public static serverElements: HTMLElement;

    public static chatBoxServer: HTMLElement;
    public static msgInputServer: HTMLInputElement;
    public static sendMessageAsServer: HTMLElement;
    public static getAllUiElements(): void {
        UiElementHandler.electronWindow = document;
        UiElementHandler.moveableBoxElement = document.getElementById("moveIt") as HTMLElement;
        UiElementHandler.switchModeButton = document.getElementById("switch") as HTMLElement;
        UiElementHandler.authoritativeElements = document.getElementById("authoritative_elements") as HTMLElement;
        UiElementHandler.stopSignalingServer = document.getElementById("stop_signalingServerButton") as HTMLElement;
        UiElementHandler.signalingUrl = document.getElementById("signaling_uri") as HTMLInputElement;
        UiElementHandler.signalingSubmit = document.getElementById("submit_button") as HTMLElement;
        UiElementHandler.loginNameInput = document.getElementById("login_name") as HTMLInputElement;
        UiElementHandler.loginButton = document.getElementById("login_button") as HTMLElement;
        console.log("UI ELEMENT HANDLER LOGIC: ", UiElementHandler.loginButton);
        UiElementHandler.msgInput = document.getElementById("msgInput") as HTMLInputElement;
        UiElementHandler.chatbox = document.getElementById("chatbox") as HTMLInputElement;
        UiElementHandler.sendMsgButton = document.getElementById("sendMessage") as HTMLElement;
        UiElementHandler.connectToUserButton = document.getElementById("userConnect") as HTMLElement;
        UiElementHandler.usernameToConnectTo = document.getElementById("connectToUsername") as HTMLInputElement;
        UiElementHandler.disconnectButton = document.getElementById("disconnectBtn") as HTMLElement;
        UiElementHandler.startSignalingButton = document.getElementById("start_signalingServerButton") as HTMLElement;
        UiElementHandler.peerToPeerHtmlElements = document.getElementById("peer_to_peer_elements") as HTMLElement;
        UiElementHandler.broadcastButton = document.getElementById("broadcastButton") as HTMLElement;
    }

    public static getPureWebSocketUiElements(): void {
        UiElementHandler.chatBoxServer = document.getElementById("chatboxServer") as HTMLElement;
        UiElementHandler.msgInputServer = document.getElementById("msgInputServer") as HTMLInputElement;
        UiElementHandler.sendMessageAsServer = document.getElementById("sendMessageAsServer") as HTMLElement;
        UiElementHandler.switchModeButton = document.getElementById("switch") as HTMLElement;
        UiElementHandler.serverElements = document.getElementById("server_elements") as HTMLElement;
        UiElementHandler.signalingElements = document.getElementById("signaling_elements") as HTMLElement;
        UiElementHandler.startSignalingButton = document.getElementById("start_signalingServerButton") as HTMLElement;
        UiElementHandler.stopSignalingServer = document.getElementById("stop_signalingServerButton") as HTMLElement;
        UiElementHandler.signalingUrl = document.getElementById("signaling_uri") as HTMLInputElement;
        UiElementHandler.signalingSubmit = document.getElementById("submit_button") as HTMLElement;
        UiElementHandler.loginNameInput = document.getElementById("login_name") as HTMLInputElement;
        UiElementHandler.loginButton = document.getElementById("login_button") as HTMLElement;
        UiElementHandler.msgInput = document.getElementById("msgInput") as HTMLInputElement;
        UiElementHandler.chatbox = document.getElementById("chatbox") as HTMLInputElement;
        UiElementHandler.sendMsgButton = document.getElementById("sendMessage") as HTMLElement;
    }

}