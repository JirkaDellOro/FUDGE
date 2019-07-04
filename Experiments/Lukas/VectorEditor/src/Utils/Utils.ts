namespace Fudge {
  export namespace Utils {
    export function RandomRange(_min: number, _max: number): number {
      return Math.floor((Math.random() * (_max - _min)) + _min);
    }

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