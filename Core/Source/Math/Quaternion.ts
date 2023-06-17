namespace FudgeCore {
  /**
    * Storing and manipulating rotations in the form of quaternions.
    * Constructed out of the 4 components: (x, y, z, w). Mathematical notation: w + xi + yj + zk.
    * A Quaternion can be described with an axis and angle: (x, y, z) = sin(angle/2)*axis; w = cos(angle/2).
    * roll: x, pitch: y, yaw: z. Note that operations are adapted to work with vectors where y is up and z is forward.
    * @authors Matthias Roming, HFU, 2023 | Marko Fehrenbach, HFU, 2020 | Jonas Plotzky, HFU, 2023
    */
  export class Quaternion extends Mutable implements Serializable, Recycable {
    private data: Float32Array = new Float32Array(4); // The data of the quaternion (x, y, z, w).
    private mutator: Mutator = null; // prepared for optimization, keep mutator to reduce redundant calculation and for comparison. Set to null when data changes!
    #eulerAngles: Vector3 = null; // euler angle representation of this quaternion in degrees.

    public constructor(_x: number = 0, _y: number = 0, _z: number = 0, _w: number = 1) {
      super();
      this.data.set([_x, _y, _z, _w]);
    }

    //#region STATICS
    /**
     * Retrieve a new identity quaternion
     */
    public static IDENTITY(): Quaternion {
      const result: Quaternion = Recycler.get(Quaternion);
      return result;
    }

    /**
     * Constructs a new quaternion from the euler angles given
     */
    public static FROM_EULER_ANGLES(_eulerAngles: Vector3, _order: string = "ZYX"): Quaternion {
      const result: Quaternion = Recycler.get(Quaternion);
      result.eulerAngles = _eulerAngles;
      return result;
    }

    /**
     * Computes and returns the product of two passed quaternions.
     * @param _mtxLeft The matrix to multiply.
     * @param _mtxRight The matrix to multiply by.
     */
    public static MULTIPLICATION(_qLeft: Quaternion, _qRight: Quaternion): Quaternion {
      const result: Quaternion = _qLeft.clone;
      result.multiply(_qRight);
      return result;
    }

    /**
     * Computes and returns the inverse of a passed quaternion.
     * @param _mtx The quaternion to compute the inverse of.
     */
    public static INVERSION(_q: Quaternion): Quaternion {
      const result: Quaternion = _q.clone;
      result.inverse();
      return result;
    }

    /**
     * Computes and returns the conjugate of a passed quaternion.
     * @param _mtx The quaternion to compute the conjugate of.
     */
    public static CONJUGATION(_q: Quaternion): Quaternion {
      const result: Quaternion = _q.clone;
      result.conjugate();
      return result;
    }

    /**
     * Experimental: Creates and returns a vector through transformation of the given vector by the given quaternion
     */
    public static TRANSFORM_VECTOR(_v: Vector3, _q: Quaternion): Vector3 {
      // changed axis order might not be necessary, needs testing
      const v: Quaternion = Recycler.get(Quaternion);
      v.set([0, _v.z, _v.x, _v.y]);
      v.multiply(_q, true);
      v.multiply(this.CONJUGATION(_q));

      const result: Vector3 = Recycler.get(Vector3);
      result.set(v.data[2], v.data[3], v.data[1]);
      return result;
    }

    /**
     * Experimental: Converts the quaternion to a Matrix4x4
     */
    public static QUATERNION_TO_MATRIX(_q: Quaternion): Matrix4x4 {
      const x: number = _q.data[0], y: number = _q.data[1], z: number = _q.data[2], w: number = _q.data[3];
      // From: https://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToMatrix/index.htm
      const xx: number = x * x, xy: number = x * y, xz: number = x * z, xw: number = x * w;
      const yy: number = y * y, yz: number = y * z, yw: number = y * w;
      const zz: number = z * z, zw: number = z * w;

      const result: Matrix4x4 = Recycler.get(Matrix4x4);
      result.set([
        1 - 2 * (yy + zz), 2 * (xy - zw), 2 * (xz + yw), 0,
        2 * (xy + zw), 1 - 2 * (xx + zz), 2 * (yz - xw), 0,
        2 * (xz - yw), 2 * (yz + xw), 1 - 2 * (xx + yy), 0,
        0, 0, 0, 1
      ]);
      return result;
    }
    //#endregion

    public get x(): number {
      return this.data[0];
    }
    public get y(): number {
      return this.data[1];
    }
    public get z(): number {
      return this.data[2];
    }
    public get w(): number {
      return this.data[3];
    }

    // TODO: reset cache when setting x,y,z,w ?
    public set x(_x: number) {
      this.data[0] = _x;
    }
    public set y(_y: number) {
      this.data[1] = _y;
    }
    public set z(_z: number) {
      this.data[2] = _z;
    }
    public set w(_w: number) {
      this.data[3] = _w;
    }

    /**
     * Return a copy of this
     */
    public get clone(): Quaternion {
      let result: Quaternion = Recycler.get(Quaternion);
      result.set(this);
      return result;
    }

    /**
     * - get: return the euler angle representation of the rotation in degrees.  
     * - set: set the euler angle representation of the rotation in degrees.
     */
    public get eulerAngles(): Vector3 {
      if (!this.#eulerAngles) {
        this.#eulerAngles = Recycler.get(Vector3);

        // roll (x-axis rotation)
        let sinrcosp: number = 2 * (this.w * this.x + this.y * this.z);
        let cosrcosp: number = 1 - 2 * (this.x * this.x + this.y * this.y);
        this.#eulerAngles.x = Math.atan2(sinrcosp, cosrcosp);

        // pitch (y-axis rotation)
        let sinp: number = 2 * (this.w * this.y - this.z * this.x);
        if (Math.abs(sinp) >= 1)
          this.#eulerAngles.y = sinp < 0 ? -Math.abs(Math.PI / 2) : Math.abs(Math.PI / 2); // use 90 degrees if out of range
        else
          this.#eulerAngles.y = Math.asin(sinp);

        // yaw (z-axis rotation)
        let sinycosp: number = 2 * (this.w * this.z + this.x * this.y);
        let cosycosp: number = 1 - 2 * (this.y * this.y + this.z * this.z);
        this.#eulerAngles.z = Math.atan2(sinycosp, cosycosp);

        this.#eulerAngles.scale(Calc.rad2deg);
      }

      return this.#eulerAngles;
    }
    
    public set eulerAngles(_eulerAngles: Vector3) {
      _eulerAngles.scale(Calc.deg2rad);
      const cosX: number = Math.cos(_eulerAngles.x / 2);
      const cosY: number = Math.cos(_eulerAngles.y / 2);
      const cosZ: number = Math.cos(_eulerAngles.z / 2);
      const sinX: number = Math.sin(_eulerAngles.x / 2);
      const sinY: number = Math.sin(_eulerAngles.y / 2);
      const sinZ: number = Math.sin(_eulerAngles.z / 2);

      this.set([
        sinX * cosY * cosZ - cosX * sinY * sinZ,
        cosX * sinY * cosZ + sinX * cosY * sinZ,
        cosX * cosY * sinZ - sinX * sinY * cosZ,
        cosX * cosY * cosZ + sinX * sinY * sinZ
      ]);
    }

    /**
     * Resets the quaternion to the identity-quaternion and clears cache. Used by the recycler to reset.
     */
    public recycle(): void {
      this.data.set([0, 0, 0, 1]);
      this.resetCache();
    }

    /**
     * Resets the quaternion to the identity-quaternion and clears cache.
     */
    public reset(): void {
      this.recycle();
    }

    /**
     * Inverse this quaternion
     */
    public inverse(): void {
      // quaternion is assumed to have unit length
      this.conjugate();
    }

    /**
     * Conjugate this quaternion
     */
    public conjugate(): void {
      this.data[0] *= -1;
      this.data[1] *= -1;
      this.data[2] *= -1;
      this.resetCache();
    }

    /**
     * Multiply this quaternion with the given quaternion
     */
    public multiply(_other: Quaternion, _fromLeft: boolean = false): void {
      const a: Quaternion = _fromLeft ? _other : this;
      const b: Quaternion = _fromLeft ? this : _other;
      // from: http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm
      const ax: number = a.data[0];
      const ay: number = a.data[1];
      const az: number = a.data[2];
      const aw: number = a.data[3];
      const bx: number = b.data[0];
      const by: number = b.data[1];
      const bz: number = b.data[2];
      const bw: number = b.data[3];

      this.set([
        ax * bw + ay * bz - az * by + aw * bx,
        -ax * bz + ay * bw + az * bx + aw * by,
        ax * by - ay * bx + az * bw + aw * bz,
        -ax * bx - ay * by - az * bz + aw * bw
      ]);
    }

    /**
     * Sets the elements of this quaternion to the values of the given quaternion
     */
    public set(_qTo: Quaternion | ArrayLike<number>): void {
      if (_qTo instanceof Quaternion)
        this.data.set(_qTo.data);
      else
        this.data.set(_qTo);
      this.resetCache();
    }

    public toString(): string {
      return `ƒ.Quaternion(x: ${this.data[0]}, y: ${this.data[1]}, z: ${this.data[2]}, w: ${this.data[3]})`;
    }

    /**
     * Return the elements of this quaternion as a Float32Array
     */
    public get(): Float32Array {
      // TODO: optimization, it shouldn"t always return a copy, since this bloats memory
      return new Float32Array(this.data);
    }

    public serialize(): Serialization {
      return this.getMutator();
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.mutate(_serialization);
      return this;
    }

    public getMutator(): Mutator {
      if (!this.mutator)
        this.mutator = {
          x: this.data[0], y: this.data[1], z: this.data[2], w: this.data[3]
        };
      return this.mutator;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      this.data[0] = _mutator.x;
      this.data[1] = _mutator.y;
      this.data[2] = _mutator.z;
      this.data[3] = _mutator.w;
      this.resetCache();
    }

    protected reduceMutator(_mutator: Mutator): void {/** */ }

    private resetCache(): void {
      this.#eulerAngles = null;
      this.mutator = null;
    }
  }
}