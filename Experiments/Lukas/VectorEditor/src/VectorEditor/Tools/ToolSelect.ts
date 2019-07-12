namespace Fudge {
  export namespace VectorEditor {
    export class ToolSelect extends Tool {
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

      mousemove(_event: MouseEvent): void {
        this.moved = true;
        if (this.boxSelect) {
          this.currentPosition = vectorEditor.realPosToCanvasPos(new Vector2(_event.clientX, _event.clientY));
          vectorEditor.redrawAll();
        } else {
          this.move.mousemove(_event);
        }
      }

      mouseup(_event: MouseEvent): void {
        if (!this.moved && this.boxSelect) {
          vectorEditor.deselectAll();
          this.boxSelect = false;
        }
        if (!this.boxSelect) {
          return;
        }


        this.boxSelect = false;
      }

      additionalDisplay(_crc: CanvasRenderingContext2D): void {
        if (!this.boxSelect) return;
        let rect: Path2D = new Path2D();
        rect.rect(this.startPosition.x, this.startPosition.y, this.currentPosition.x - this.startPosition.x, this.currentPosition.y - this.startPosition.y);
        _crc.lineWidth = 1 / vectorEditor.scale;
        _crc.stroke(rect);
      }
    }
  }
}