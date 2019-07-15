namespace Fudge {
  export namespace VectorEditor {
    /**
     * Selection Tool. The most important tool to select things. Includes the move tool for convenience.
     * @authors Lukas Scheuerle, HFU, 2019
     */
    export class ToolSelect extends Tool {
      // register tool in the ToolManager
      static iRegister: number = ToolManager.registerTool(ToolSelect);
      
      boxSelect: boolean;
      multiSelectShortcut: Shortcut;
      move: ToolMove = new ToolMove();
      startPosition: Vector2;
      currentPosition: Vector2;
      private moved: boolean;

      constructor() {
        super("Select");
        this.icon = "./images/cursor.svg";
      }

      /**
       * Checks what has been clicked on and selects/deselects accordingly. If nothing is clicked on, prepares the boxselection. 
       * @param _event the mouse event caused by the mousedown eventlistener
       */
      mousedown(_event: MouseEvent): void {
        if (_event.buttons == 0) return;
        this.moved = false;
        let selectedObject: SketchTypes.SketchPoint | SketchTypes.SketchPath = vectorEditor.getPathOrPointTheMouseIsOver(new Vector2(_event.clientX, _event.clientY));
        if (selectedObject) {
          if (Editor.isShortcutPressed(this.multiSelectShortcut)) {
            if (selectedObject instanceof SketchTypes.SketchPath) {
              let i: number = vectorEditor.selectedPaths.indexOf(selectedObject);
              if (i > -1) {
                vectorEditor.selectedPaths.splice(i, 1);
              } else {
                vectorEditor.selectedPaths.push(selectedObject);
              }
            } else {
              let i: number = vectorEditor.selectedPoints.indexOf(selectedObject);
              if (i > -1) {
                vectorEditor.selectedPoints.splice(i, 1);
              } else {
                vectorEditor.selectedPoints.push(selectedObject);
              }
            }
          } else {
            if (selectedObject instanceof SketchTypes.SketchPath) {
              vectorEditor.deselectAll();
              vectorEditor.selectedPaths.push(selectedObject);
            } else {
              vectorEditor.deselectAllPoints();
              vectorEditor.selectedPoints.push(selectedObject);
            }
            selectedObject.selected = true;
          }
        } else {
          this.boxSelect = true;
          this.startPosition = vectorEditor.realPosToCanvasPos(new Vector2(_event.clientX, _event.clientY));
          this.currentPosition = this.startPosition.copy;
        }
        this.move.mousedown(_event);
      }

      /**
       * Saves the position if the user is performing a box selection, otherwise propagates the event to the move tool.
       * @param _event the mouse event caused by the mousemove eventlistener
       */
      mousemove(_event: MouseEvent): void {
        this.moved = true;
        if (this.boxSelect) {
          this.currentPosition = vectorEditor.realPosToCanvasPos(new Vector2(_event.clientX, _event.clientY));
        } else {
          this.move.mousemove(_event);
        }
      }

      /**
       * deslects everything if the player was performing a boxselection without moving, otherwise selects everything inside the box selected.
       * @param _event the mouse event caused by the mouseup eventlistener
       */
      mouseup(_event: MouseEvent): void {
        if (!this.moved && this.boxSelect) {
          vectorEditor.deselectAll();
          this.boxSelect = false;
        }
        if (!this.boxSelect) {
          return;
        }
        //TODO implement box selection

        this.boxSelect = false;
      }

      /**
       * Draws a box on the canvas if the user is performing a boxselection.
       * @param _crc the canvas rendering context on which to draw the additional display things.
       */
      additionalDisplay(_crc: CanvasRenderingContext2D): void {
        if (!this.boxSelect) return;
        let rect: Path2D = new Path2D();
        rect.rect(this.startPosition.x, this.startPosition.y, this.currentPosition.x - this.startPosition.x, this.currentPosition.y - this.startPosition.y);
        _crc.lineWidth = 1 / vectorEditor.scale;
        _crc.strokeStyle = "black";
        _crc.stroke(rect);
      }
    }
  }
}