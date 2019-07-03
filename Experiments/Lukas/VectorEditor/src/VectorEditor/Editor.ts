namespace Fudge {
  export namespace VectorEditor {

    export class Editor {
      static pressedKeys: string[] = [];

      sketch: SketchTypes.Sketch;
      selectedTool: Tool;
      canvas: HTMLCanvasElement;
      crc: CanvasRenderingContext2D;
      uiHandler: UIHandler;
      toolManager: ToolManager;
      transformationPoint: Vector2;

      selectedPaths: SketchTypes.SketchPath[] = [];
      selectedPoints: SketchTypes.SketchPoint[] = [];
      scale: number = 1;
      showTangentsShortcut: Shortcut = { keys: [KEY.ALT_LEFT] };
      quadraticShapesShortcut: Shortcut = { keys: [KEY.SHIFT_LEFT] };
      tangentsActive: boolean = false;
      changeHistory: string[] = [];
      changeHistoryIndex: number = 0;

      constructor(_sketch: SketchTypes.Sketch = null) {
        if (_sketch) this.sketch = _sketch;
        else this.sketch = new SketchTypes.Sketch();
        this.changeHistory.push(JSON.stringify(this.sketch));
        this.toolManager = new ToolManager();
        this.selectedTool = this.toolManager.tools[0];
        this.uiHandler = new UIHandler(this);

        this.canvas = document.getElementsByTagName("canvas")[0];
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.crc = this.canvas.getContext("2d");

        this.canvas.addEventListener("mousedown", this.mousedown);
        this.canvas.addEventListener("mouseup", this.mouseup);
        this.canvas.addEventListener("mousemove", this.mousemove);
        window.addEventListener("keydown", this.keydown);
        window.addEventListener("keyup", this.keyup);

        this.transformationPoint = new Vector2(this.canvas.width / 2, this.canvas.height / 2);
        this.redrawAll();
      }

      static isKeyPressed(_key: KEY): boolean {
        return Editor.pressedKeys.indexOf(_key) > -1;
      }

      static isShortcutPressed(_shortcut: Shortcut): boolean {
        return false;
      }

      mousedown = (_event: MouseEvent) => {
        _event.preventDefault();
        if (this.selectedTool) this.selectedTool.mousedown(_event);
        this.redrawAll();
      }
      mouseup = (_event: MouseEvent) => {
        _event.preventDefault();
        if (this.selectedTool) this.selectedTool.mousedown(_event);
        this.redrawAll();
      }
      mousemove = (_event: MouseEvent) => {
        _event.preventDefault();
        if (this.selectedTool) this.selectedTool.mousedown(_event);
        if (_event.buttons > 0 || _event.button > 0) this.redrawAll();
      }

      keydown = (_event: KeyboardEvent) => {
        // _event.preventDefault();
        let key: KEY = stringToKey(_event.code);
        if (!Editor.isKeyPressed(key)) {
          Editor.pressedKeys.push(key);
        }
        if (!this.tangentsActive && Editor.isShortcutPressed(this.showTangentsShortcut)) {
          this.tangentsActive = true;
          this.redrawAll();
        }

        for (let t of this.toolManager.tools) {
          if (Editor.isShortcutPressed(t.shortcut)) {
            this.selectedTool = t;
            this.uiHandler.updateUI();
          }
        }
      }

      keyup = (_event: KeyboardEvent) => {
        // _event.preventDefault();
        let key: KEY = stringToKey(_event.code);
        if (Editor.isKeyPressed(key)) {
          Editor.pressedKeys.splice(Editor.pressedKeys.indexOf(key), 1);
        }
        if (this.tangentsActive && !Editor.isShortcutPressed(this.showTangentsShortcut)) {
          this.tangentsActive = false;
          //TODO: remove tangets from selected points
          this.redrawAll();
        }
      }

      selectTool(): void {
        //
      }

      undo(): void {
        if (this.changeHistoryIndex <= 0) return;
        this.changeHistoryIndex--;
        this.sketch = JSON.parse(this.changeHistory[this.changeHistoryIndex]);
      }

      redo(): void {
        this.changeHistoryIndex++;
        if (this.changeHistoryIndex >= this.changeHistory.length) this.changeHistoryIndex = this.changeHistory.length - 1;
        this.sketch = JSON.parse(this.changeHistory[this.changeHistoryIndex]);
      }

      saveToChangeHistory(): void {
        this.changeHistoryIndex++;
        if (this.changeHistoryIndex < this.changeHistory.length) this.changeHistory.splice(this.changeHistoryIndex);
        this.changeHistory.push(JSON.stringify(this.sketch));
      }


      private redrawAll(): void {
        console.log("redraw");
        this.crc.resetTransform();
        this.crc.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.crc.translate(this.transformationPoint.x, this.transformationPoint.y);
        this.crc.scale(this.scale, this.scale);

        this.sketch.objects.sort(SketchTypes.SketchObject.sort);

        for (let obj of this.sketch.objects) {
          this.crc.globalAlpha = 1;
          if (this.selectedPaths.length > 0 && !obj.selected) {
            this.crc.globalAlpha = 0.5;
          }
          obj.draw(this.crc);
        }

        let transformationPointPath: Path2D = new Path2D();
        let lineLength: number = 10;
        transformationPointPath.moveTo(-lineLength / this.scale, 0);
        transformationPointPath.lineTo(lineLength / this.scale, 0);
        transformationPointPath.moveTo(0, -lineLength / this.scale);
        transformationPointPath.lineTo(0, lineLength / this.scale);
        this.crc.strokeStyle = "black";
        this.crc.lineWidth = 2 / this.scale;
        this.crc.stroke(transformationPointPath);
      }
    }

    window.addEventListener("DOMContentLoaded", init);
    export let vectorEditor: Editor;
    function init(): void {
      let sketch: SketchTypes.Sketch = new SketchTypes.Sketch();

      sketch.objects.push();
      vectorEditor = new Editor(sketch);
    }
  }
}