namespace FudgeCore {
  /**
   * Representation of a vector3 as geographic coordinates as seen on a globe
   * ```plaintext
   * ←|→ Longitude (Angle to the z-axis) 
   *  ↕- Latitude (Angle to the equator)
   *  -→ Magnitude (Distance from the center)  
   * ```
   */
  export class Geo3 implements Recycable {
    public magnitude: number = 0;
    public latitude: number = 0;
    public longitude: number = 0;

    constructor(_longitude: number = 0, _latitude: number = 0, _magnitude: number = 1) {
      this.set(_longitude, _latitude, _magnitude);
    }

    /**
     * Set the properties of this instance at once
     */
    public set(_longitude: number = 0, _latitude: number = 0, _magnitude: number = 1): void {
      this.magnitude = _magnitude;
      this.latitude = _latitude;
      this.longitude = _longitude;
    }

    public recycle(): void {
      this.set();
    }

    /**
     * Returns a pretty string representation
     */
    public toString(): string {
      return `longitude: ${this.longitude.toPrecision(5)}, latitude: ${this.latitude.toPrecision(5)}, magnitude: ${this.magnitude.toPrecision(5)}`;
    }
  }
}