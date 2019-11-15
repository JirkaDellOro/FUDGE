namespace Fudge {
  export namespace SketchTypes {
    /**
     * Base class for single points in the Editor.
     * Visually represented by a circle by default.
     * @authors Lukas Scheuerle, HFU, 2019
     */
    export class SketchPoint extends Fudge.Vector2 {
      public selected: boolean;
      public path2D: Path2D;
      
      /**
       * Draws the point on the given context at its position.
       * @param _context The rendering context to draw on
       * @param _selected Whether the point is currently selected. Fills the point if it is.
       */
      draw(_context: CanvasRenderingContext2D): void {
        this.generatePath2D();
        _context.strokeStyle = "black";
        _context.lineWidth = 1;
        _context.fillStyle = "black";
        _context.stroke(this.path2D);
        if (this.selected) _context.fill(this.path2D);
      }

      /**
       * (Re-)Generates the Path2D component of a point.
       * It describes a circle. 
       * @param _radius Sets the radius to use. Defaults to 5.
       */
      generatePath2D(_radius: number = 5): Path2D {
        let path: Path2D = new Path2D();
        path.arc(this.x, this.y, _radius, 0, 2 * Math.PI);
        this.path2D = path;
        return path;
      }

      /**
       * Moves the point by the given value.
       * @param _delta the vector that desribes the difference in position
       */
      move(_delta: Vector2): void {
        this.x += _delta.x;
        this.y += _delta.y;
      }

      /**
       * Moves the point to the given position.
       * @param _newPos the vector that describes the new position the point should be moved to.
       */
      moveTo(_newPos: Vector2): void {
        this.x = _newPos.x;
        this.y = _newPos.y;
      }
    }
  }
}