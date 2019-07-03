namespace Fudge {
  export namespace VectorEditor {
    export class ToolManager {
      static toolTypes: typeof Tool[] = [];
      tools: Tool[] = [];

      constructor() {
        for (let t of ToolManager.toolTypes) {
          this.tools.push(new t(""));
        }
      }

      static registerTool(_tool: typeof Tool): number {
        return ToolManager.toolTypes.push(_tool);
      }
    }
  }
}