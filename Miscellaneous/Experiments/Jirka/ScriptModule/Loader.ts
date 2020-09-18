namespace Loader { 
  console.log("Loader starts");
  start();

  async function start(): Promise<void> {
    try {
      let test0: Test.Test0 = new Test.Test0("Hallo");
      let try0: Try.Try = new Try.Try("Hallo");
    } catch (_error: unknown) {
      console.log(_error);
    }
  }
}