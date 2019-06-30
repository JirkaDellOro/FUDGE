namespace Fudge {
  export namespace SketchTypes {
    /**
     * The basic Sketch Object that all drawable objects are made of.
     */
    export class SketchObject {
      order: number;
      color: string | CanvasGradient | CanvasPattern = "black";
      name: string;
      path2D: Path2D = new Path2D;


      static sort(_a: SketchObject, _b: SketchObject): number{
        return _a.order - _b.order;
      }
    }
  }
}