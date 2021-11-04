namespace ClientTest {
  window.addEventListener("load", start);

  async function start(_event: Event): Promise<void> {
    let client: FudgeClient.FudgeClient = new FudgeClient.FudgeClient();
    console.log(client);
    client.connectToSignalingServer("ws://localhost:8080");
  }
}