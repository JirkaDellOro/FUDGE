export enum MESSAGE_TYPE {
    UNDEFINED = "undefined",
    ID_ASSIGNED = "id_assigned",
    LOGIN_REQUEST = "login_request",
    LOGIN_RESPONSE = "login_response",
    RTC_OFFER = "offer",
    RTC_ANSWER = "answer",
    ICE_CANDIDATE = "candidate",
    SERVER_ASSIGNMENT_REQUEST = "server_assignment_request",
    CLIENT_TO_SERVER_MESSAGE = "client_to_server_message",
    CLIENT_READY_FOR_MESH_CONNECTION = "client_ready_for_mesh_connection",
    CLIENT_MESH_CONNECTED = "client_mesh_connected",
    SERVER_SEND_MESH_CANDIDATES_TO_CLIENT = "server_send_mesh_candidates_to_client",
    SERVER_TO_CLIENT_MESSAGE = "server_to_client_message",
    PEER_TO_SERVER_COMMAND = "server_command",
    PEER_TEXT_MESSAGE = "peer_text_message",
    SERVER_TO_PEER_MESSAGE = "server_to_peer_message"
}


export enum SERVER_COMMAND_TYPE {
    UNDEFINED = "undefined",
    DISCONNECT_CLIENT = "disconnect_client",
    SPAWN_OBJECT = "spawn_object",
    ASSIGN_OBJECT_TO_CLIENT = "assign_object_to_client",
    DESTROY_OBJECT = "destroy_object",
    KEYS_INPUT = "keys_input",
    MOVEMENT_VALUE = "movement_value"

}


