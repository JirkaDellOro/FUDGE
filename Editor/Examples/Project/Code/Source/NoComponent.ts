namespace Script {
  export class NoComponentScript {
    private static message: string = NoComponentScript.showCompileMessage();

    private static showCompileMessage(): string {
      let message: string = "I've been compiled! But I won't show in the Component...";
      NoComponentScript.message = message;
      console.log(NoComponentScript.message);
      return message;
    }
  }
}