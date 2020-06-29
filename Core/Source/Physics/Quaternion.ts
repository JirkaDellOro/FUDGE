namespace FudgeCore {
  /**
    * Storing and manipulating rotations in the form of quaternions.
    * Constructed out of the 4 components x,y,z,w. Commonly used to calculate rotations in physics engines.
    * Class mostly used internally to bridge the in FUDGE commonly used angles in degree to OimoPhysics quaternion system.
    * @authors Marko Fehrenbach, HFU, 2020
    */
  export class Quaternion extends Mutable {
    private x: number;
    private y: number;
    private z: number;
    private w: number;

    public constructor(_x: number = 0, _y: number = 0, _z: number = 0, _w: number = 0) {
      super();
      this.x = _x;
      this.y = _y;
      this.z = _z;
      this.w = _w;
    }

    /** Get/Set the X component of the Quaternion. Real Part */
    get X(): number {
      return this.x;
    }
    set X(_x: number) {
      this.x = _x;
    }
    /** Get/Set the Y component of the Quaternion. Real Part */
    get Y(): number {
      return this.y;
    }
    set Y(_y: number) {
      this.y = _y;
    }

    /** Get/Set the Z component of the Quaternion. Real Part */
    get Z(): number {
      return this.z;
    }
    set Z(_z: number) {
      this.z = _z;
    }

    /** Get/Set the Y component of the Quaternion. Imaginary Part */
    get W(): number {
      return this.w;
    }
    set W(_w: number) {
      this.w = _w;
    }

    /**
     * Create quaternion from vector3 angles in degree
     */
    public setFromVector3(rollX: number, pitchY: number, yawZ: number): void {
      let cy: number = Math.cos(yawZ * 0.5);
      let sy: number = Math.sin(yawZ * 0.5);
      let cp: number = Math.cos(pitchY * 0.5);
      let sp: number = Math.sin(pitchY * 0.5);
      let cr: number = Math.cos(rollX * 0.5);
      let sr: number = Math.sin(rollX * 0.5);

      this.w = cr * cp * cy + sr * sp * sy;
      this.x = sr * cp * cy - cr * sp * sy;
      this.y = cr * sp * cy + sr * cp * sy;
      this.z = cr * cp * sy - sr * sp * cy;
    }

    /**
     * Returns the euler angles in radians as Vector3 from this quaternion.
     */
    public toEulerangles(): Vector3 { //Singularities possible
      let angles: Vector3 = new Vector3();

      // roll (x-axis rotation)
      let sinrcosp: number = 2 * (this.w * this.x + this.y * this.z);
      let cosrcosp: number = 1 - 2 * (this.x * this.x + this.y * this.y);
      angles.x = Math.atan2(sinrcosp, cosrcosp);

      // pitch (y-axis rotation)
      let sinp: number = 2 * (this.w * this.y - this.z * this.x);
      if (Math.abs(sinp) >= 1)
        angles.y = this.copysign(Math.PI / 2, sinp); // use 90 degrees if out of range
      else
        angles.y = Math.asin(sinp);

      // yaw (z-axis rotation)
      let sinycosp: number = 2 * (this.w * this.z + this.x * this.y);
      let cosycosp: number = 1 - 2 * (this.y * this.y + this.z * this.z);
      angles.z = Math.atan2(sinycosp, cosycosp);

      return angles;
    }

    /**
     * Return angles in degrees as vector3 from this. quaterion
     */
    public toDegrees(): Vector3 {
      let angles: Vector3 = this.toEulerangles();
      angles.x = angles.x * (180 / Math.PI);
      angles.y = angles.y * (180 / Math.PI);
      angles.z = angles.z * (180 / Math.PI);
      return angles;
    }

    public getMutator(): Mutator {
      let mutator: Mutator = {
        x: this.x, y: this.y, z: this.z, w: this.w
      };
      return mutator;
    }
    protected reduceMutator(_mutator: Mutator): void {/** */ }

    /** Copying the sign of a to b */
    private copysign(a: number, b: number): number {
      return b < 0 ? -Math.abs(a) : Math.abs(a);
    }
  }
}