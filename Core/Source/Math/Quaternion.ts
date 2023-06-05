namespace FudgeCore {
  /**
    * Storing and manipulating rotations in the form of quaternions.
    * Constructed out of the 4 components: (x, y, z, w). Mathematical notation: w + xi + yj + zk.
    * A Quaternion can be described with an axis and angle: (x, y, z) = sin(angle/2)*axis; w = cos(angle/2).
    * roll: x, pitch: y, yaw: z. Note that operations are adapted to work with vectors where y is up and z is forward.
    * @authors Matthias Roming, HFU, 2023
    */
  export class Quaternion extends Mutable implements Serializable, Recycable {
    private data: Float32Array = new Float32Array(4); // The data of the quaternion (x, y, z, w).
    private mutator: Mutator = null; // prepared for optimization, keep mutator to reduce redundant calculation and for comparison. Set to null when data changes!
    #eulerAngles: Vector3 = null; // euler angle representation of this quaternion in degrees.

    public constructor() {
      super();
      this.recycle();
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
      result.setFromEulerAngles(_eulerAngles, _order);
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
      const x = _q.data[0], y = _q.data[1], z = _q.data[2], w = _q.data[3];
      // From: https://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToMatrix/index.htm
      const xx = x * x, xy = x * y, xz = x * z, xw = x * w;
      const yy = y * y, yz = y * z, yw = y * w;
      const zz = z * z, zw = z * w;

      const result: Matrix4x4 = Recycler.get(Matrix4x4);
      result.set([
        1 - 2 * ( yy + zz ), 2 * ( xy - zw ), 2 * ( xz + yw ), 0,
        2 * ( xy + zw ), 1 - 2 * ( xx + zz ), 2 * ( yz - xw ), 0,
        2 * ( xz - yw ), 2 * ( yz + xw ), 1 - 2 * ( xx + yy ), 0,
        0, 0, 0, 1
      ]);
      return result;
    }
    //#endregion

    get x(): number {
      return this.data[0];
    }
    get y(): number {
      return this.data[1];
    }
    get z(): number {
      return this.data[2];
    }
    get w(): number {
      return this.data[3];
    }

    set x(_x: number) {
      this.data[0] = _x;
    }
    set y(_y: number) {
      this.data[1] = _y;
    }
    set z(_z: number) {
      this.data[2] = _z;
    }
    set w(_w: number) {
      this.data[3] = _w;
    }

    /**
     * Calculates and returns the euler-angles in degrees.  
     */
    public getEulerAngles(_order = "ZYX"): Vector3 {
      if (!this.#eulerAngles) {
        const mtx: Matrix4x4 = Quaternion.QUATERNION_TO_MATRIX(this);
        const mtxData = mtx.get();
        const m11 = mtxData[0], m12 = mtxData[1], m13 = mtxData[2];
        const m21 = mtxData[4], m22 = mtxData[5], m23 = mtxData[6];
        const m31 = mtxData[8], m32 = mtxData[9], m33 = mtxData[10];
        this.#eulerAngles = Recycler.get(Vector3);

        switch (_order) {
          case "XYZ":
            this.#eulerAngles.y = Math.asin(Calc.clamp(m13, -1, 1));
            if (Math.abs(m13) < 0.9999999) {
              this.#eulerAngles.x = Math.atan2(-m23, m33);
              this.#eulerAngles.z = Math.atan2(-m12, m11);
            } else {
              this.#eulerAngles.x = Math.atan2(m32, m22);
              this.#eulerAngles.z = 0;
            }
            break;
          case "YXZ":
            this.#eulerAngles.x = Math.asin(-Calc.clamp(m23, -1, 1));
            if (Math.abs(m23) < 0.9999999) {
              this.#eulerAngles.y = Math.atan2(m13, m33);
              this.#eulerAngles.z = Math.atan2(m21, m22);
            } else {
              this.#eulerAngles.y = Math.atan2(-m31, m11);
              this.#eulerAngles.z = 0;
            }
            break;
          case "ZXY":
            this.#eulerAngles.x = Math.asin(Calc.clamp(m32, -1, 1));
            if (Math.abs(m32) < 0.9999999) {
              this.#eulerAngles.y = Math.atan2(-m31, m33);
              this.#eulerAngles.z = Math.atan2(-m12, m22);
            } else {
              this.#eulerAngles.y = 0;
              this.#eulerAngles.z = Math.atan2(m21, m11);
            }
            break;
          case "ZYX":
            this.#eulerAngles.y = Math.asin(-Calc.clamp(m31, -1, 1));
            if (Math.abs(m31) < 0.9999999) {
              this.#eulerAngles.x = Math.atan2(m32, m33);
              this.#eulerAngles.z = Math.atan2(m21, m11);
            } else {
              this.#eulerAngles.x = 0;
              this.#eulerAngles.z = Math.atan2(-m12, m22);
            }
            break;
          case "YZX":
            this.#eulerAngles.z = Math.asin(Calc.clamp(m21, -1, 1));
            if (Math.abs(m21) < 0.9999999) {
              this.#eulerAngles.x = Math.atan2(-m23, m22);
              this.#eulerAngles.y = Math.atan2(-m31, m11);

            } else {
              this.#eulerAngles.x = 0;
              this.#eulerAngles.y = Math.atan2(m13, m33);
            }
            break;
          case "XZY":
            this.#eulerAngles.z = Math.asin(-Calc.clamp(m12, -1, 1));
            if (Math.abs(m12) < 0.9999999) {
              this.#eulerAngles.x = Math.atan2(m32, m22);
              this.#eulerAngles.y = Math.atan2(m13, m11);
            } else {
              this.#eulerAngles.x = Math.atan2(-m23, m33);
              this.#eulerAngles.y = 0;
            }
            break;
          default:
            console.warn("encountered an unknown order: " + _order);
        }
        this.#eulerAngles.scale(Calc.rad2deg);
      }
      return this.#eulerAngles;
    }

    public setFromEulerAngles(_eulerAngles: Vector3, _order: string = "ZYX") {
      const cosX = Math.cos(_eulerAngles.x * Calc.deg2rad / 2);
      const cosY = Math.cos(_eulerAngles.y * Calc.deg2rad / 2);
      const cosZ = Math.cos(_eulerAngles.z * Calc.deg2rad / 2);
      const sinX = Math.sin(_eulerAngles.x * Calc.deg2rad / 2);
      const sinY = Math.sin(_eulerAngles.y * Calc.deg2rad / 2);
      const sinZ = Math.sin(_eulerAngles.z * Calc.deg2rad / 2);

      switch (_order) {
        case "XYZ":
          this.set([
            sinX * cosY * cosZ + cosX * sinY * sinZ,
            cosX * sinY * cosZ -sinX * cosY * sinZ,
            cosX * cosY * sinZ + sinX * sinY * cosZ,
            cosX * cosY * cosZ -sinX * sinY * sinZ
          ]);
          break;
        case "YXZ":
          this.set([
            sinX * cosY * cosZ + cosX * sinY * sinZ,
            cosX * sinY * cosZ -sinX * cosY * sinZ,
            cosX * cosY * sinZ -sinX * sinY * cosZ,
            cosX * cosY * cosZ + sinX * sinY * sinZ
          ]);
          break;
        case "ZXY":
          this.set([
            sinX * cosY * cosZ -cosX * sinY * sinZ,
            cosX * sinY * cosZ + sinX * cosY * sinZ,
            cosX * cosY * sinZ + sinX * sinY * cosZ,
            cosX * cosY * cosZ -sinX * sinY * sinZ
          ]);
          break;
        case "ZYX":
          this.set([
            sinX * cosY * cosZ - cosX * sinY * sinZ,
            cosX * sinY * cosZ + sinX * cosY * sinZ,
            cosX * cosY * sinZ - sinX * sinY * cosZ,
            cosX * cosY * cosZ + sinX * sinY * sinZ
          ]);
          break;
        case "YZX":
          this.set([
            sinX * cosY * cosZ + cosX * sinY * sinZ,
            cosX * sinY * cosZ + sinX * cosY * sinZ,
            cosX * cosY * sinZ -sinX * sinY * cosZ,
            cosX * cosY * cosZ -sinX * sinY * sinZ
          ]);
          break;
        case "XZY":
          this.set([
            sinX * cosY * cosZ -cosX * sinY * sinZ,
            cosX * sinY * cosZ -sinX * cosY * sinZ,
            cosX * cosY * sinZ + sinX * sinY * cosZ,
            cosX * cosY * cosZ + sinX * sinY * sinZ
          ]);
          break;
        default:
          console.warn("encountered an unknown order: " + _order);
      }
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
    conjugate(): void {
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
        -ax * bx - ay * by - az * bz + aw * bw,
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

    protected reduceMutator(_mutator: Mutator): void {/** */}

    private resetCache(): void {
      this.#eulerAngles = null;
      this.mutator = null;
    }
  }
}