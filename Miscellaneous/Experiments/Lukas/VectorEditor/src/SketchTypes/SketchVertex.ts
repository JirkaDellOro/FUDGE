namespace Fudge {
  export namespace SketchTypes {
    /**
     * Describes the corners of a SketchPath object.
     * @authors Lukas Scheuerle, HFU, 2019
     */
    export class SketchVertex extends SketchPoint {
      public tangentIn: SketchTangentPoint;
      public tangentOut: SketchTangentPoint;
      // public parent: SketchPath;
      private activated: boolean = false;

      constructor(_x: number, _y: number, _parent: SketchPath = null) {
        super(_x, _y);
        // this.parent = _parent;
        this.tangentIn = new SketchTangentPoint(_x, _y);
        this.tangentOut = new SketchTangentPoint(_x, _y);
      }

      /**
       * Activates the Vertex to add tangent points to allow for line manipulation.
       */
      activate(): void {
        //TODO: create/move the Tangent Points
        this.activated = true;
      }

      /**
       * Deactivates the Vertex and removes the tangent points.
       */
      deactivate(): void {
        //TODO: handle the tangent points
        this.activated = false;
      }

      /**
       * Draws the Vertex.
       * @param _context The context to draw on
       */
      draw(_context: CanvasRenderingContext2D): void {
        super.draw(_context);
        if (this.activated && VectorEditor.vectorEditor.tangentsActive) {
          this.tangentIn.draw(_context);
          this.tangentOut.draw(_context);
        }
      }

      /**
       * Moves the vertex by the given Value
       * @param _delta The change in position
       * @param _withTangent Whether the tangent points should be moved in the same way. Defaults to true.
       */
      move(_delta: Vector2, _withTangent: boolean = true): void {
        super.move(_delta);
        if (_withTangent) {
          this.tangentIn.move(_delta);
          this.tangentOut.move(_delta);
        }
      }
    }
  }
}