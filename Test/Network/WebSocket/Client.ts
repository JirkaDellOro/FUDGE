namespace ClientWebSocket {
  //@ts-ignore
  const client = new FudgeNetwork.ClientManagerWebSocketOnly();
  console.log(client);
  client.connectToSignalingServer();
}