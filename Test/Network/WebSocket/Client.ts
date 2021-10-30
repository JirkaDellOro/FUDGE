namespace ClientWebSocket {
  //@ts-ignore
  const client = new FudgeNetwork.ClientManagerWebSocketOnly();
  console.log("Create Client", client);
  client.connectToSignalingServer();
}