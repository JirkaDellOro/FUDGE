namespace ClientTest {
  window.addEventListener("load", start);

  async function start(_event: Event): Promise<void> {
    let y: FudgeClient.FudgeClient = new FudgeClient.FudgeClient();
    console.log(y);
  }
}