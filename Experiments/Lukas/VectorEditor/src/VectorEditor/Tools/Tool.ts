namespace Fudge {
  export namespace VectorEditor {
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

      mousedown(_event: MouseEvent): void {
        if (this.selectedSubTool)
          this.selectedSubTool.mousedown(_event);
      }

      mousemove(_event: MouseEvent): void {
        if (this.selectedSubTool)
          this.selectedSubTool.mousemove(_event);

      }

      mouseup(_event: MouseEvent): void {
        if (this.selectedSubTool)
          this.selectedSubTool.mouseup(_event);

      }

      mousescroll(_event: MouseEvent): void {
        if (this.selectedSubTool)
          this.selectedSubTool.mousescroll(_event);

      }

      prequisitesFulfilled(): boolean {
        return true;
      }

      additionalDisplay(_crc: CanvasRenderingContext2D): void {
        if (this.selectedSubTool)
          this.selectedSubTool.additionalDisplay(_crc);
      }

      addAdditonalSubmenuOptions(): void {
        return;
      }

      exit(): void {
        if (this.selectedSubTool)
          this.selectedSubTool.exit();
      }
    }
  }
}