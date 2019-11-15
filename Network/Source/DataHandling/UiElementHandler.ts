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

    public static webSocketServerChatBox: HTMLElement;
    public static webSocketServerMessageInput: HTMLInputElement;
    public static webSocketServerSendMessageButton: HTMLElement;


    public static authoritativeSwitchToServerOrClientModeButton: HTMLElement;
    public static authoritativeServerElements: HTMLElement;
    public static authoritativeServerStartSignalingButton: HTMLElement;
    public static authoritativeServerStopSignalingButton: HTMLElement;
    public static authoritativeServerBroadcastButton: HTMLElement;
    public static authoritativeServerMessageInput: HTMLInputElement;
    public static authoritativeServerMovingDiv: HTMLElement;
    public static authoritativeClientElements: HTMLElement;
    public static authoritativeClientSignalingUrlInput: HTMLInputElement;
    public static authoritativeClientConnectToServerButton: HTMLElement;
    public static authoritativeClientLoginNameInput: HTMLInputElement;
    public static authoritativeClientLoginButton: HTMLElement;
    public static authoritativeClientChatArea: HTMLInputElement;
    public static authoritativeClientMessageInput: HTMLInputElement;
    public static authoritativeClientSendMessageButton: HTMLElement;


    public static meshNetworkClientOrServerSwitch: HTMLElement;
    public static meshServerElements: HTMLElement;
    public static meshServerStartSignalingButton: HTMLElement;
    public static meshServerStopSignalingButton: HTMLElement;
    public static meshClientElements: HTMLElement;
    public static meshClientSignalingURL: HTMLInputElement;
    public static meshClientSubmitButton: HTMLElement;
    public static meshClientReadyButton: HTMLElement;


    public static getFundamentalDOMElements(): void {
        UiElementHandler.electronWindow = document;
    }

    public static getMeshUiElements(): void {
        this.getFundamentalDOMElements();
        UiElementHandler.meshNetworkClientOrServerSwitch = document.getElementById("switch") as HTMLElement;
        UiElementHandler.meshServerElements = document.getElementById("server_elements") as HTMLElement;
        UiElementHandler.meshServerStartSignalingButton = document.getElementById("start_signalingServerButton") as HTMLElement;
        UiElementHandler.meshServerStopSignalingButton = document.getElementById("stop_signalingServerButton") as HTMLElement;
        UiElementHandler.meshClientElements = document.getElementById("client_elements") as HTMLElement;
        UiElementHandler.meshClientSignalingURL = document.getElementById("signaling_uri") as HTMLInputElement;
        UiElementHandler.meshClientSubmitButton = document.getElementById("submit_button") as HTMLElement;
        UiElementHandler.meshClientReadyButton = document.getElementById("readyForMesh") as HTMLElement;
    }

    public static getAuthoritativeUiElements(): void {
        UiElementHandler.getFundamentalDOMElements();

        UiElementHandler.authoritativeSwitchToServerOrClientModeButton = document.getElementById("switch") as HTMLElement;

        UiElementHandler.authoritativeServerElements = document.getElementById("authoritative_elements") as HTMLElement;
        UiElementHandler.authoritativeServerStartSignalingButton = document.getElementById("start_signalingServerButton") as HTMLElement;
        UiElementHandler.authoritativeServerStopSignalingButton = document.getElementById("stop_signalingServerButton") as HTMLElement;
        UiElementHandler.authoritativeServerBroadcastButton = document.getElementById("broadcastButton") as HTMLElement;
        UiElementHandler.authoritativeServerMessageInput = document.getElementById("auth_server_input") as HTMLInputElement;
        // UiElementHandler.authoritativeServerMovingDiv = document.getElementById("moveIt") as HTMLElement;
        // UiElementHandler.authoritativeServerMovingDiv.style.position = "relative";
        // UiElementHandler.authoritativeServerMovingDiv.style.left = "0px";
        // UiElementHandler.authoritativeServerMovingDiv.style.top = "0px";
        UiElementHandler.authoritativeClientElements = document.getElementById("auth_client_elements") as HTMLElement;
        UiElementHandler.authoritativeClientSignalingUrlInput = document.getElementById("signaling_uri") as HTMLInputElement;
        UiElementHandler.authoritativeClientConnectToServerButton = document.getElementById("submit_button") as HTMLElement;
        UiElementHandler.authoritativeClientChatArea = document.getElementById("auth_client_chatbox") as HTMLInputElement;
        UiElementHandler.authoritativeClientMessageInput = document.getElementById("auth_client_message_input") as HTMLInputElement;
        UiElementHandler.authoritativeClientSendMessageButton = document.getElementById("auth_client_send_message_button") as HTMLElement;
    }

    public static getPureWebSocketUiElements(): void {
        UiElementHandler.getFundamentalDOMElements();


        UiElementHandler.webSocketServerChatBox = document.getElementById("chatboxServer") as HTMLElement;
        UiElementHandler.webSocketServerMessageInput = document.getElementById("msgInputServer") as HTMLInputElement;
        UiElementHandler.webSocketServerSendMessageButton = document.getElementById("sendMessageAsServer") as HTMLElement;
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



    public static getAllUiElements(): void {
        UiElementHandler.getFundamentalDOMElements();

        UiElementHandler.moveableBoxElement = document.getElementById("moveIt") as HTMLElement;
        UiElementHandler.switchModeButton = document.getElementById("switch") as HTMLElement;
        UiElementHandler.authoritativeElements = document.getElementById("authoritative_elements") as HTMLElement;
        UiElementHandler.stopSignalingServer = document.getElementById("stop_signalingServerButton") as HTMLElement;
        UiElementHandler.signalingUrl = document.getElementById("signaling_uri") as HTMLInputElement;
        UiElementHandler.signalingSubmit = document.getElementById("submit_button") as HTMLElement;
        UiElementHandler.loginNameInput = document.getElementById("login_name") as HTMLInputElement;
        UiElementHandler.loginButton = document.getElementById("login_button") as HTMLElement;
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


    private static colorList: string[] = ["#ff1100", "#ffe600", "#aaff00", "#26ff00", "#00ffd9", "#0059ff", "#d900ff", "#ff0084"]
    private static colorListIndex: number = 0;
    public static addMovingDivForAuth(): HTMLElement {
        let movingDiv = document.createElement('div');
        movingDiv.style.cssText = "style=height:50px;width:50px;background-color:" + this.colorList[this.colorListIndex] + "; position:relative; left: 0px; top: 0px;";
        this.colorListIndex++;
        document.body.appendChild(movingDiv);
        return movingDiv;
    }

}