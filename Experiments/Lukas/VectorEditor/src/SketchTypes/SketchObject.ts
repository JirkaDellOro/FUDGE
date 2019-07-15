namespace Fudge {
  export namespace SketchTypes {
    /**
     * The basic Sketch Object that all drawable objects are made of.
     * @authors Lukas Scheuerle, HFU, 2019
     */
    export abstract class SketchObject {
      order: number;
      color: string | CanvasGradient | CanvasPattern = "black";
      name: string;
      path2D: Path2D = new Path2D;
      selected: boolean = false;

      /**
       * Static sorting method intended to be used as a parameter for array.sort(). 
       * @param _a First Sketch Object to sort
       * @param _b Second Sketch Object to sort
       * @returns >0 if a > b, =0 if a=b and <0 if a < b
       */
      static sort(_a: SketchObject, _b: SketchObject): number {
        return _a.order - _b.order;
      }

      /**
       * The basic draw function. Stub because abstract
       * @param _crc The 2d canvas rendering context to draw on
       */
      draw(_crc: CanvasRenderingContext2D): void {
        //;
      }
    }
  }
}