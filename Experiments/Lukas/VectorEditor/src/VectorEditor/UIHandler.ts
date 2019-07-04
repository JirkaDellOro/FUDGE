namespace Fudge {
  export namespace VectorEditor {
    export class UIHandler {
      editor: Editor;
      toolBar: HTMLDivElement;
      subToolBar: HTMLDivElement;
      inspector: HTMLDivElement;
      infoBar: HTMLDivElement;
      mousePositionSpan: HTMLSpanElement;
      scaleInput: HTMLInputElement;

      constructor(_editor: Editor) {
        this.editor = _editor;
        this.toolBar = <HTMLDivElement>document.getElementById("toolBar");
        this.subToolBar = <HTMLDivElement>document.getElementById("subToolBar");
        this.inspector = <HTMLDivElement>document.getElementById("inspector");
        this.infoBar = <HTMLDivElement>document.getElementById("infoBar");

        this.createUI();
      }

      updateUI(): void {
        //selection
        this.deselectAll();
        let div: HTMLDivElement = <HTMLDivElement>document.getElementById(this.editor.selectedTool.name);
        div.classList.add("selected");
      }

      createUI(): void {

        //toolbar
        this.toolBar.innerHTML = "";
        for (let tool of this.editor.toolManager.tools) {
          let div: HTMLDivElement = document.createElement("div");
          div.classList.add("outline", "tool");
          div.id = tool.name;
          let icon: HTMLImageElement = document.createElement("img");
          icon.src = tool.icon;
          div.appendChild(icon);
          div.addEventListener("click", this.handleClickOnTool);
          this.toolBar.appendChild(div);
        } 

        //infobar
        this.infoBar.innerHTML = "";
        let s: HTMLSpanElement = document.createElement("span");
        s.innerText = "Mouseposition: ";
        this.mousePositionSpan = document.createElement("span");
        this.mousePositionSpan.id = "mousePositionSpan";
        this.mousePositionSpan.innerText = "0 | 0";
        this.infoBar.appendChild(s);
        this.infoBar.appendChild(this.mousePositionSpan);

        s = document.createElement("span");
        s.innerText = ", Scale: ";
        this.scaleInput = document.createElement("input");
        this.scaleInput.id = "scaleInput";
        this.scaleInput.value = this.editor.scale.toString();
        this.infoBar.appendChild(s);
        this.infoBar.appendChild(this.scaleInput);

        this.scaleInput.addEventListener("change", this.setScale);

        this.updateUI();
      }

      deselectAll(): void {
        let divs: NodeListOf<HTMLDivElement> = document.querySelectorAll(".selected");
        for (let div of divs) {
          div.classList.remove("selected");
        }
      }

      updateMousePosition(_x: number = 0, _y: number = 0): void {
        this.mousePositionSpan.innerText = `${_x.toFixed(0)} | ${_y.toFixed(0)}`;
      }
      updateScale(_scale: number = 1): void {
        this.scaleInput.value = `${_scale}`;
      }
      setScale = () => {
        let scale: number = Number(this.scaleInput.value);
        this.editor.setScale(scale);
      }

      updateSelectedObjectUI(): void {
        //
      }

      updateSelectedObject(): void {
        //
      }

      handleClickOnTool = (_event: MouseEvent) => {
        if (_event.target == this.toolBar) return;
        if ((<HTMLElement>_event.target).classList.contains("selected")) return;
        console.log(_event.currentTarget);
        this.editor.selectTool((<HTMLElement>_event.currentTarget).id);
      }
    }
  }
}