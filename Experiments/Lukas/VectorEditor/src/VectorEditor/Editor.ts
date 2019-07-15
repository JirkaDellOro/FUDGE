namespace Fudge {
  export namespace VectorEditor {
    /**
     * The Editor of the Vector Editor.
     * This is where everything comes together and is administered that is part of the vector editor.
     * @authors Lukas Scheuerle, HFU, 2019
     */
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
        window.addEventListener("wheel", this.scroll);
        document.addEventListener("copy", this.copy);
        document.addEventListener("paste", this.paste);

        this.transformationPoint = new Vector2(this.canvas.width / 2, this.canvas.height / 2);
        this.redrawAll();
      }

      /**
       * Check whether a KEY is in the pressedKeys list.
       * @param _key The key to check whether it has been pressed
       */
      static isKeyPressed(_key: KEY): boolean {
        return Editor.pressedKeys.indexOf(_key) > -1;
      }

      /**
       * Checks whether all Keys in a given Shortcut are pressed.
       * @param _shortcut the shortcut to check if it is currently pressed
       */
      static isShortcutPressed(_shortcut: Shortcut): boolean {
        //TODO
        return false;
      }

      /**
       * Mousedown on canvas eventhandler.
       * sends the event to the selected Tool.
       */
      mousedown = (_event: MouseEvent) => {
        _event.preventDefault();
        if (this.selectedTool) this.selectedTool.mousedown(_event);
        this.redrawAll();
      }

      /**
       * Mouseup on canvas eventhandler.
       * sends the event to the selected Tool.
       */
      mouseup = (_event: MouseEvent) => {
        _event.preventDefault();
        if (this.selectedTool) this.selectedTool.mouseup(_event);
        this.redrawAll();
      }
      
      /**
       * Mousemove on canvas eventhandler.
       * sends the event to the selected Tool.
       */
      mousemove = (_event: MouseEvent) => {
        _event.preventDefault();
        if (this.selectedTool) this.selectedTool.mousemove(_event);
        this.uiHandler.updateMousePosition(this.realPosToCanvasPos(new Vector2(_event.clientX, _event.clientY)));
        if (_event.buttons > 0 || _event.button > 0) this.redrawAll();
      }

      /**
       * Scrolling/Wheel Eventhandler. Zooms in/out by a Multiplier.
       */
      scroll = (_event: MouseWheelEvent) => {
        let scaleMutiplier: number = 0.9;
        let newScale: number = this.scale;
        _event.preventDefault();
        if (_event.deltaY > 0) {
          newScale = this.scale * scaleMutiplier;
        } else if (_event.deltaY < 0) {
          newScale = this.scale / scaleMutiplier;
        }
        this.setScale(newScale, _event);
        this.uiHandler.updateMousePosition(this.realPosToCanvasPos(new Vector2(_event.clientX, _event.clientY)));
      }

      /**
       * Sets the scale of the editor preview to the given amount. Can scale around a mouse position. Limits the scale to be between 0.1 and 10 inclusive
       * @param _scale the new scale to set the scale to.
       * @param _event the mouseevent that caused the rescale. if not null, it will try to scale at the mouse position. defaults to null
       */
      setScale(_scale: number, _event: MouseEvent = null): void {
        let newScale: number = +Math.max(0.1, Math.min(_scale, 10)).toFixed(2);

        if (_event) {
          this.transformationPoint = new Vector2(_event.clientX - (_event.clientX - this.transformationPoint.x) * newScale / this.scale, _event.clientY - (_event.clientY - this.transformationPoint.y) * newScale / this.scale);
        }
        this.scale = newScale;
        this.uiHandler.updateScale(this.scale);
        this.redrawAll();
      }

      /**
       * Handles keypresses and stores them in a list of currently pressed keys for easy access. Also activates tools or shortcuts it knows of.
       */
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

      /**
       * Handles key releases and removes them from the list of currently pressed keys.
       */
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

      /**
       * copys selected paths into the computers clipboard.
       */
      copy = (_e: ClipboardEvent) => {
        //TODO make this only copy selected paths, not everything.
        _e.clipboardData.setData("text/plain", JSON.stringify(this.sketch.objects));
        _e.preventDefault();
      }

      /**
       * pastes whatever is in the users clipboard to the canvas.
       */
      paste = (_event: ClipboardEvent) => {
        //TODO: make this actually work
        let data: string = _event.clipboardData.getData("text/plain");
        //TODO: check whether the copied data is actually a sketch object
        console.log(data);
        this.redrawAll();
      }

      /**
       * Selects a Tool from the Toolmanager based on its name.
       * @param _name name of the tool to select
       */
      selectTool(_name: string): void {
        for (let t of this.toolManager.tools) {
          if (t.name == _name) {
            this.selectedTool = t;
            this.uiHandler.updateUI();
            return;
          }
        }
      }

      /**
       * undoes the last action.
       */
      undo(): void {
        if (this.changeHistoryIndex <= 0) return;
        this.changeHistoryIndex--;
        this.sketch = JSON.parse(this.changeHistory[this.changeHistoryIndex]);
      }

      /**
       * restores the last action that was undone
       */
      redo(): void {
        this.changeHistoryIndex++;
        if (this.changeHistoryIndex >= this.changeHistory.length) this.changeHistoryIndex = this.changeHistory.length - 1;
        this.sketch = JSON.parse(this.changeHistory[this.changeHistoryIndex]);
      }

      /**
       * adds a new turnback point to the change history. removes all undone changes from the history.
       */
      saveToChangeHistory(): void {
        this.changeHistoryIndex++;
        if (this.changeHistoryIndex < this.changeHistory.length) this.changeHistory.splice(this.changeHistoryIndex);
        this.changeHistory.push(JSON.stringify(this.sketch));
      }

      /**
       * Finds the object the mouse is hovering over. Checks points first, then paths.
       * @param _clientPos the position of the client
       * @returns the point the mouse is over or the path the mouse is over, in this order
       */
      getPathOrPointTheMouseIsOver(_clientPos: Vector2): SketchTypes.SketchPath | SketchTypes.SketchPoint {
        let found: SketchTypes.SketchPath | SketchTypes.SketchPoint;
        found = this.getPointAtPositionInGroup(this.selectedPoints, _clientPos);
        if (found) return found;
        for (let path of this.selectedPaths) {
          found = this.getPointAtPositionInGroup(path.vertices, _clientPos);
          if (found) return found;
          if (this.crc.isPointInPath(path.path2D, _clientPos.x, _clientPos.y)) return path;
        }
        for (let path of this.sketch.objects) {
          if (this.crc.isPointInPath(path.path2D, _clientPos.x, _clientPos.y)) return <SketchTypes.SketchPath>path;
        }
        return null;
      }

      /**
       * Checks a given list of points if and which point is under the given position. 
       * @param _points the points to check through
       * @param _clientPos the position to check for
       */
      getPointAtPositionInGroup(_points: SketchTypes.SketchPoint[], _clientPos: Vector2): SketchTypes.SketchPoint {
        for (let point of _points) {
          if (this.crc.isPointInPath(point.path2D, _clientPos.x, _clientPos.y)) return point;
        }
        return null;
      }

      /**
       * Converts the given client position into the canvas position based on scale and transformation of the canvas.
       * @param _clientPos the client position to convert
       */
      realPosToCanvasPos(_clientPos: Vector2): Vector2 {
        return new Vector2(
          (_clientPos.x - this.transformationPoint.x) / this.scale,
          (_clientPos.y - this.transformationPoint.y) / this.scale);
      }

      /**
       * redraws all objects on the canvas, including all sketch objects, the additional displays of the selected tool as well as the transformation point indicating 0 0 on the canvas.
       */
      redrawAll(): void {
        // console.log("redraw");
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
        
        this.selectedTool.additionalDisplay(this.crc);

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

      /**
       * Utility function that deselectes all points and paths.
       * Shortcut for calling both deselectAllPoints() and deselectAllPaths().
       */
      deselectAll(): void {
        this.deselectAllPaths();
        this.deselectAllPoints();
      }
      
      /**
       * Utility function that deselectes all points.
       */
      deselectAllPoints(): void {
        for (let p of this.selectedPoints) {
          p.selected = false;
        }
        
        this.selectedPoints = [];
      }
      
      /**
       * Utility function that deselectes all paths.
       */
      deselectAllPaths(): void {
        for (let p of this.selectedPaths) {
          p.selected = false;
        }
        this.selectedPaths = [];
      }
    }

    // initialising an example vector editor on the given page
    window.addEventListener("DOMContentLoaded", init);
    export let vectorEditor: Editor;
    function init(): void {
      let sketch: SketchTypes.Sketch = createTestSketch();
      vectorEditor = new Editor(sketch);
    }

    //creating a test sketch upon loading until the actual loading of a saved sketch is implemented
    function createTestSketch(): SketchTypes.Sketch {
      let sketch: SketchTypes.Sketch = new SketchTypes.Sketch();
      let amountObjects: number = 3;
      let amountPoints: number = 3;

      for (let i: number = 0; i < amountObjects; i++) {
        let start: SketchTypes.SketchVertex = new SketchTypes.SketchVertex(Utils.RandomRange(-250, 250), Utils.RandomRange(-250, 250));
        let path: SketchTypes.SketchPath = new SketchTypes.SketchPath(Utils.RandomColor(), "black", 1, "path" + i, i, [start]);
        for (let k: number = 0; k < amountPoints - 1; k++) {
          let newPoint: SketchTypes.SketchVertex = new SketchTypes.SketchVertex(Utils.RandomRange(-250, 250), Utils.RandomRange(-250, 250));
          path.addVertexAtPos(newPoint);
        }

        sketch.objects.push(path);
      }

      return sketch;
    }
  }
}