namespace Fudge {
  export namespace VectorEditor {
    /**
     * Superclass for all Tools. 
     * Not Abstract so it can implement the basic functionality of propagating its events to potential subtools as well as creating some default behaviour for all tools.
     * @authors Lukas Scheuerle, HFU, 2019
     */
    export class Tool {
      static iRegister: number;
      subMenu: FUDGE.UIElement;
      shortcut: Shortcut;
      selectedSubTool: Tool;
      subTools: Tool[];
      name: string;
      icon: string;

      constructor(_name: string) {
        this.name = _name;
      }

      /**
       * Generally called from the Editor, sending down the caught events on the canvas. Propagates the event down to potential subtools. 
       * @param _event the mouseevent that got caught by the mousedown listener
       */
      mousedown(_event: MouseEvent): void {
        if (this.selectedSubTool)
          this.selectedSubTool.mousedown(_event);
      }

      /**
       * Generally called from the Editor, sending down the caught events on the canvas. Propagates the event down to potential subtools. 
       * @param _event the mouseevent that got caught by the mousemove listener
       */
      mousemove(_event: MouseEvent): void {
        if (this.selectedSubTool)
          this.selectedSubTool.mousemove(_event);

      }

      /**
       * Generally called from the Editor, sending down the caught events on the canvas. Propagates the event down to potential subtools. 
       * @param _event the mouseevent that got caught by the mouseup listener
       */
      mouseup(_event: MouseEvent): void {
        if (this.selectedSubTool)
          this.selectedSubTool.mouseup(_event);

      }

      /**
       * Generally called from the Editor, sending down the caught events on the canvas. Propagates the event down to potential subtools. 
       * @param _event the mouseevent that got caught by the wheel listener
       */
      mousescroll(_event: MouseEvent): void {
        if (this.selectedSubTool)
          this.selectedSubTool.mousescroll(_event);

      }

      /**
       * Allows Editor and UIHandler to check if a tool should be usable in the current state.
       * true by default.
       * @returns true if the tool can be selected in the current state, false if it can't.
       */
      prequisitesFulfilled(): boolean {
        return true;
      }

      /**
       * Allows for the tool to draw additional things onto the canvas if needed. By default only porpagates that to the selected subtool.
       * @param _crc The 2d canvas rendering context to draw the additional display on
       */
      additionalDisplay(_crc: CanvasRenderingContext2D): void {
        if (this.selectedSubTool)
          this.selectedSubTool.additionalDisplay(_crc);
      }

      /**
       * Allows for the addition of additional subtool menu options, like dropdowns or number inputs. no submenu by default.
       */
      addAdditonalSubmenuOptions(): void {
        return;
      }

      /**
       * Allows the tool to be stopped at any point to prevent possible execution.
       */
      exit(): void {
        if (this.selectedSubTool)
          this.selectedSubTool.exit();
      }
    }
  }
}