namespace Fudge {
  export namespace SketchTypes {
    /**
     * Describes the Tangent Point used to draw the Bezier Curve between two SketchVertices.
     * @authors Lukas Scheuerle, HFU, 2019
     */
    export class SketchTangentPoint extends SketchPoint {
      public parent: SketchVertex;

      /**
       * (Re-)Generates the Path2D component of a point.
       * It describes a square. 
       * @param _sideLength Sets the side length to use. Defaults to 10.
       */
      generatePath2D(_sideLength: number = 10): Path2D {
        let path: Path2D = new Path2D();
        path.rect(this.x - _sideLength / 2, this.y - _sideLength / 2, _sideLength, _sideLength);
        return path;
      }
    }
  }
}