namespace Fudge {
  export namespace VectorEditor {
    export class UIHandler {
      editor: Editor;
      toolBar: HTMLDivElement;
      subToolBar: HTMLDivElement;
      inspector: HTMLDivElement;
      infoBar: HTMLDivElement;

      constructor(_editor: Editor) {
        this.editor = _editor;
        this.toolBar = <HTMLDivElement>document.getElementById("toolBar");
        this.subToolBar = <HTMLDivElement>document.getElementById("subToolBar");
        this.inspector = <HTMLDivElement>document.getElementById("inspector");
        this.infoBar = <HTMLDivElement>document.getElementById("infoBar");

        this.createUI();
      }

      updateUI(): void {
        this.deselectAll();
        let div: HTMLDivElement = <HTMLDivElement>document.getElementById(this.editor.selectedTool.name);
        div.classList.add("selected");
      }

      createUI(): void {
        this.toolBar.innerHTML = "";
        for (let tool of this.editor.toolManager.tools) {
          let div: HTMLDivElement = document.createElement("div");
          div.classList.add("outline", "tool");
          div.id = tool.name;
          let icon: HTMLImageElement = document.createElement("img");
          icon.src = tool.icon;
          div.appendChild(icon);
          this.toolBar.appendChild(div);
        }
        this.updateUI();
      }

      deselectAll(): void {
        let divs: NodeListOf<HTMLDivElement> = document.querySelectorAll(".selected");
        for (let div of divs) {
          div.classList.remove("selected");
        }
      }

      updateSelectedObjectUI(): void {
        //
      }

      updateSelectedObject(): void {
        //
      }
    }
  }
}