namespace Fudge {
  export namespace VectorEditor {
    export class ToolSelect extends Tool {
      static iRegister: number = ToolManager.registerTool(ToolSelect);

      boxSelect: boolean;
      multiSelectShortcut: Shortcut;
      // move: ToolMove = new ToolMove();
      startPosition: Vector2;
      currenPosition: Vector2;
      
      constructor() {
        super("Select");
        this.icon = "./images/cursor.svg";
      }

    }
  }
}