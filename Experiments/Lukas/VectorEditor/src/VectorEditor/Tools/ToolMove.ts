namespace Fudge {
  export namespace VectorEditor {
    export class ToolMove extends Tool {
      static iRegister: number = ToolManager.registerTool(ToolMove);
      previousPosition: Vector2;
      
      
      constructor() {
        super("Move");
      }
    }
  }
}