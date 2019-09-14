namespace Fudge {
  export namespace VectorEditor {
    /**
     * The tool to move selected objects. Not used by itself, only as a subtool.
     * @authors Lukas Scheuerle, HFU, 2019
     */
    export class ToolMove extends Tool {
      // static iRegister: number = ToolManager.registerTool(ToolMove);
      previousPosition: Vector2;


      constructor() {
        super("Move");
        this.icon = "./images/move.svg";
      }

      /**
       * Saves the mouseposition as the new starting position
       * @param _event the mouse event caught by the mousedown listener
       */
      mousedown(_event: MouseEvent): void {
        this.previousPosition = new Vector2(_event.clientX, _event.clientY);
      }

      /**
       * If left mouse button is pressed, moves everything selected by the difference between current mouse position and previous mouse position.
       * @param _event the mouseevent caught by the mousemove listener
       */
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

      /**
       * @returns true if something is selected
       */
      prequisitesFulfilled(): boolean {
        return vectorEditor.selectedPaths.length > 0 || vectorEditor.selectedPoints.length > 0;
      }
    }
  }
}