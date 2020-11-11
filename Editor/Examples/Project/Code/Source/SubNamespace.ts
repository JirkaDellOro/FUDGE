namespace Script2 {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script2);

  export class SubScript {
    private static message: string = SubScript.showCompileMessage();

    private static showCompileMessage(): string {
      let message: string = "I've been compiled! But I won't show in the Component...";
      SubScript.message = message;
      console.log(SubScript.message);
      return message;
    }
  }
}