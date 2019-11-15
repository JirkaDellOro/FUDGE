namespace Fudge {
  /**
   * A namespace to put general utility functions.
   * @authors Lukas Scheuerle, HFU, 20191
   */
  export namespace Utils {
    /**
     * Generates a random number between min and max.
     * @param _min the minimum the random number needs to be bigger than (including).
     * @param _max the maximum the random number can't exceed (excluding).
     */
    export function RandomRange(_min: number, _max: number): number {
      return Math.floor((Math.random() * (_max - _min)) + _min);
    }

    /**
     * Returns a new rgba color in string format.
     * @param _includeAlpha whether the color should have a random alpha value as well. if false, it will have an alpha value of 1. defaults to false
     */
    export function RandomColor(_includeAlpha: boolean = false): string {
      let c: string = "rgba(";
      c += RandomRange(0, 255) + ",";
      c += RandomRange(0, 255) + ",";
      c += RandomRange(0, 255) + ",";
      c += _includeAlpha ? RandomRange(0, 255) + ")" : "1)";

      return c;
    }

    // export function getCircularReplacer(): any {
    //   const seen: WeakSet<any> = new WeakSet();
    //   return (key: any, value: any) => {
    //     if (typeof value === "object" && value !== null) {
    //       if (seen.has(value)) {
    //         return;
    //       }
    //       seen.add(value);
    //     }
    //     return value;
    //   };
    // }
  }
}