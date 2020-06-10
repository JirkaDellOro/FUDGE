namespace FudgeCore {
  /**
    * Storing and manipulating rotations in the form of quaternions.
    * Constructed out of the 4 components x,y,z,w.
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

    get X(): number {
      return this.x;
    }
    get Y(): number {
      return this.y;
    }
    get Z(): number {
      return this.z;
    }

    get W(): number {
      return this.w;
    }

    set X(_x: number) {
      this.x = _x;
    }
    set Y(_y: number) {
      this.y = _y;
    }
    set Z(_z: number) {
      this.z = _z;
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
     * Return euler angles in vector3 from quaterion
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
     * Return angles in degrees as vector3 from quaterion
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

    private copysign(a: number, b: number): number {
      return b < 0 ? -Math.abs(a) : Math.abs(a);
    }

  }
}