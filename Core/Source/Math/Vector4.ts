namespace FudgeCore {
  /**
   * Stores and manipulates a fourdimensional vector comprised of the components x, y, z and w.
   * @authors Jonas Plotzky, HFU, 2023
   */
  export class Vector4 extends Mutable implements Serializable, Recycable {
    public x: number;
    public y: number;
    public z: number;
    public w: number;

    public constructor(_x: number = 0, _y: number = 0, _z: number = 0, _w: number = 0) {
      super();
      this.set(_x, _y, _z, _w);
    }

    /**
     * The magnitude (length) of the vector.
     */
    public get magnitude(): number {
      return Math.hypot(this.x, this.y, this.z, this.w);
    }

    /**
     * The squared magnitude (length) of the vector. Faster for simple proximity evaluation.
     */
    public get magnitudeSquared(): number {
      return this.dot(this);
    }

    /**
     * Creates and returns a clone of this vector
     */
    public get clone(): Vector4 {
      let clone: Vector4 = Recycler.get(Vector4);
      clone.set(this.x, this.y, this.z, this.w);
      return clone;
    }

    /**
     * Sets the components of this vector.
     */
    public set(_x: number, _y: number, _z: number, _w: number): void {
      this.x = _x; this.y = _y; this.z = _z; this.w = _w;
    }

    /**
     * Returns an array with the components of this vector.
     */
    public get(): [number, number, number, number] {
      return [this.x, this.y, this.z, this.w];
    }

    /**
     * Copies the values of the given vector into this vector.
     */
    public copy(_original: Vector4): void {
      this.set(_original.x, _original.y, _original.z, _original.w);
    }

    /**
     * Adds the given vector to this vector.
     */
    public add(_addend: Vector4): Vector4 {
      this.x += _addend.x; this.y += _addend.y; this.z += _addend.z; this.w += _addend.w;
      return this;
    }

    /**
     * Subtracts the given vector from this vector.
     */
    public subtract(_subtrahend: Vector4): Vector4 {
      this.x -= _subtrahend.x; this.y -= _subtrahend.y; this.z -= _subtrahend.z; this.w -= _subtrahend.w;
      return this;
    }

    /**
     * Scales this vector by the given scalar.
     */
    public scale(_scalar: number): Vector4 {
      this.x *= _scalar; this.y *= _scalar; this.z *= _scalar; this.w *= _scalar;
      return this;
    }

    /**
     * Normalizes this vector to the given length, 1 by default.
     */
    public normalize(_length: number = 1): Vector4 {
      let magnitudeSquared: number = this.magnitudeSquared;
      if (magnitudeSquared == 0)
        throw (new RangeError("Impossible normalization"));
      this.scale(_length / Math.sqrt(magnitudeSquared));
      return this;
    }

    /**
     * Calculates the dot product of this instance and another vector.
     */
    public dot(_other: Vector4): number {
      return this.x * _other.x + this.y * _other.y + this.z * _other.z + this.w * _other.w;
    }

    public recycle(): void {
      this.set(0, 0, 0, 0);
    }

    public serialize(): Serialization {
      return { toJSON: () => `[${this.x}, ${this.y}, ${this.z}, ${this.w}]` };
    }

    public async deserialize(_serialization: Serialization): Promise<Vector4> {
      [this.x, this.y, this.z, this.w] = JSON.parse(<string><unknown>_serialization);
      return this;
    }

    protected reduceMutator(_mutator: Mutator): void { /** */ };
  }
}