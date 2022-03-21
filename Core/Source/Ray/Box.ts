namespace FudgeCore {
  /**
   * Defines a threedimensional box by two corner-points, one with minimal values and one with maximum values
   */
  export class Box implements Recycable {
    public min: Vector3;
    public max: Vector3;

    constructor(_min: Vector3 = Vector3.ONE(Infinity), _max: Vector3 = Vector3.ONE(-Infinity)) {
      this.set(_min, _max);
    }

    /**
     * Define the corners of this box, standard values are Infinity for min, and -Infinity for max, 
     * creating an impossible inverted box that can not contain any points
     */
    public set(_min: Vector3 = Vector3.ONE(Infinity), _max: Vector3 = Vector3.ONE(-Infinity)): void {
      this.min = _min;
      this.max = _max;
    }

    /**
     * Expand the box if necessary to include the given point
     */
    public expand(_include: Vector3): void {
      this.min.min(_include);
      this.max.max(_include);
    }
    
    public recycle(): void {
      this.min.set(Infinity, Infinity, Infinity);
      this.max.set(-Infinity, -Infinity, -Infinity);
    }
  }
}