namespace Fudge {
  export namespace VectorEditor {
    export class ToolMove extends Tool {
      // static iRegister: number = ToolManager.registerTool(ToolMove);
      previousPosition: Vector2;


      constructor() {
        super("Move");
        this.icon = "./images/move.svg";
      }

      mousedown(_event: MouseEvent): void {
        this.previousPosition = new Vector2(_event.clientX, _event.clientY);
      }

      mousemove(_event: MouseEvent): void {
        if (_event.buttons == 0) return;
        let delta: Vector2 = new Vector2(
          _event.clientX - this.previousPosition.x,
          _event.clientY - this.previousPosition.y
        );
        delta.scale(1 / vectorEditor.scale);
        if (_event.buttons == 1) {
          if (vectorEditor.selectedPoints.length > 0) {
            for (let p of vectorEditor.selectedPoints) {
              p.move(delta);
            }
          } else if (vectorEditor.selectedPaths.length > 0) {
            for (let p of vectorEditor.selectedPaths) {
              p.move(delta);
            }
          }
        } else {
          vectorEditor.transformationPoint.add(delta);
        }
        this.previousPosition = new Vector2(_event.clientX, _event.clientY);
      }

      prequisitesFulfilled(): boolean {
        return vectorEditor.selectedPaths.length > 0 || vectorEditor.selectedPoints.length > 0;
      }
    }
  }
}