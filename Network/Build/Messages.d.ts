// manipulated by AddExport.bat 
export declare namespace Messages { 
enum MESSAGE_TYPE { 
UNDEFINED = "undefined", 
ERROR = "error", 
ID_ASSIGNED = "idAssigned", 
LOGIN_REQUEST = "loginRequest", 
LOGIN_RESPONSE = "loginResponse", 
CLIENT_TO_SERVER = "clientToServer", 
SERVER_TO_CLIENT = "serverToClient", 
PEER_TO_PEER = "peerToPeer", 
SERVER_HEARTBEAT = "serverHeartbeat", 
CLIENT_HEARTBEAT = "clientHeartbeat", 
RTC_OFFER = "rtcOffer", 
RTC_ANSWER = "rtcAnswer", 
ICE_CANDIDATE = "rtcCandidate" 
} 
enum SERVER_COMMAND { 
UNDEFINED = "undefined", 
DISCONNECT_CLIENT = "disconnect_client", 
CREATE_MESH = "createMesh", 
CONNECT_HOST = "connectHost", 
CONNECT_PEERS = "connectPeers" 
} 
class MessageBase { 
readonly messageType: MESSAGE_TYPE; 
readonly idSource: string; 
constructor(messageType: MESSAGE_TYPE, idSource: string); 
static deserialize(_message: string): MessageBase; 
serialize(): string; 
} 
class IdAssigned extends MessageBase { 
assignedId: string; 
constructor(assignedId: string); 
} 
class LoginRequest extends MessageBase { 
loginUserName: string; 
constructor(_idSource: string, loginUserName?: string); 
} 
class LoginResponse extends MessageBase { 
loginSuccess: boolean; 
originatorUsername: string; 
constructor(loginSuccess: boolean, _assignedId: string, originatorUsername: string); 
} 
class RtcOffer extends MessageBase { 
idRemote: string; 
offer: RTCSessionDescription | RTCSessionDescriptionInit | null | undefined; 
constructor(_idSource: string, idRemote: string, offer: RTCSessionDescription | RTCSessionDescriptionInit | null | undefined); 
} 
class RtcAnswer extends MessageBase { 
idTarget: string; 
answer: RTCSessionDescription; 
constructor(_idSource: string, idTarget: string, answer: RTCSessionDescription); 
} 
class IceCandidate extends MessageBase { 
idTarget: string; 
candidate: RTCIceCandidate; 
constructor(_idSource: string, idTarget: string, candidate: RTCIceCandidate); 
} 
class ToServer extends MessageBase { 
messageData: string; 
originatorUserName: string; 
constructor(_idSource: string, messageData: string, originatorUserName: string); 
} 
class ToClient extends MessageBase { 
messageData: string; 
constructor(messageData: string); 
} 
class PeerToPeer extends MessageBase { 
messageData: string; 
constructor(_idSource: string, messageData: string); 
} 
class ServerHeartbeat extends MessageBase { 
messageData: string; 
constructor(messageData: string); 
} 
class ClientHeartbeat extends MessageBase { 
messageData: string; 
constructor(_idSource: string, messageData: string); 
} 
} 
