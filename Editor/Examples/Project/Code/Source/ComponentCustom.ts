namespace Script {
  import ƒ = FudgeCore;
  export class ComponentCustom extends ƒ.Component {
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(ComponentCustom);
    private static message: string = ComponentCustom.showCompileMessage();

    constructor(){
      super();
      console.log("I've even been constructed");
    } 

    private static showCompileMessage(): string {
      let message: string = "I've been compiled and should show up in the context menus";
      ComponentCustom.message = message;
      console.log(ComponentCustom.message);
      return message;
    }
  }
}