namespace FudgeCore {
  /**
   * Representation of a vector2 as polar coordinates 
   * ```plaintext
   *  ↕- angle (Angle to the x-axis)
   *  -→ Magnitude (Distance from the center)  
   * ```
   */
  export class Geo2 implements Recycable {
    public magnitude: number = 0;
    public angle: number = 0;

    constructor(_angle: number = 0, _magnitude: number = 1) {
      this.set(_angle, _magnitude);
    }

    /**
     * Set the properties of this instance at once
     */
    public set(_angle: number = 0, _magnitude: number = 1): void {
      this.magnitude = _magnitude;
      this.angle = _angle;
    }

    public recycle(): void {
      this.set();
    }

    /**
     * Returns a pretty string representation
     */
    public toString(): string {
      return `angle: ${this.angle.toPrecision(5)},  magnitude: ${this.magnitude.toPrecision(5)}`;
    }
  }
}