namespace Fudge {
  export namespace VectorEditor {
    /**
     * manages all Tools. Has a static register for tools types to register in as well as a list of tools as an attribute. 
     * @authors Lukas Scheuerle, HFU, 2019
     */
    export class ToolManager {
      static toolTypes: typeof Tool[] = [];
      tools: Tool[] = [];

      constructor() {
        for (let t of ToolManager.toolTypes) {
          this.tools.push(new t(""));
        }
      }

      /**
       * Allows a tool to register itself in the ToolManager to be added automatically to the Editors top level Tool list.
       * @param _tool the type of the tool to register in the tooltypes List
       */
      static registerTool(_tool: typeof Tool): number {
        return ToolManager.toolTypes.push(_tool);
      }
    }
  }
}