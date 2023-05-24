namespace FudgeCore {
  /**
   * Stores and manipulates a twodimensional vector comprised of the components x and y
   * ```plaintext
   *            +y
   *             |__ +x
   * ```
   * @authors Lukas Scheuerle, Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class Vector2 extends Mutable implements Recycable {
    private data: Float32Array;

    public constructor(_x: number = 0, _y: number = 0) {
      super();
      this.data = new Float32Array([_x, _y]);
    }

    //#region Static
    /** 
     * A shorthand for writing `new Vector2(0, 0)`.
     * @returns A new vector with the values (0, 0)
     */
    public static ZERO(): Vector2 {
      const vector: Vector2 = Recycler.get(Vector2);
      vector.set(0, 0);
      return vector;
    }

    /** 
     * A shorthand for writing `new Vector2(_scale, _scale)`.
     * @param _scale the scale of the vector. Default: 1
     */
    public static ONE(_scale: number = 1): Vector2 {
      const vector: Vector2 = Recycler.get(Vector2);
      vector.set(_scale, _scale);
      return vector;
    }

    /** 
     * A shorthand for writing `new Vector2(0, y)`.
     * @param _scale The number to write in the y coordinate. Default: 1
     * @returns A new vector with the values (0, _scale)
     */
    public static Y(_scale: number = 1): Vector2 {
      const vector: Vector2 = Recycler.get(Vector2);
      vector.set(0, _scale);
      return vector;
    }

    /** 
     * A shorthand for writing `new Vector2(x, 0)`.
     * @param _scale The number to write in the x coordinate. Default: 1
     * @returns A new vector with the values (_scale, 0)
     */
    public static X(_scale: number = 1): Vector2 {
      const vector: Vector2 = Recycler.get(Vector2);
      vector.set(_scale, 0);
      return vector;
    }

    public static TRANSFORMATION(_vector: Vector2, _mtxTransform: Matrix3x3, _includeTranslation: boolean = true): Vector2 {
      let result: Vector2 = Recycler.get(Vector2);
      let m: Float32Array = _mtxTransform.get();
      let [x, y] = _vector.get();
      result.x = m[0] * x + m[3] * y;
      result.y = m[1] * x + m[4] * y;

      if (_includeTranslation) {
        result.add(_mtxTransform.translation);
      }

      return result;
    }

    /**
     * Normalizes a given vector to the given length without editing the original vector.
     * @param _vector the vector to normalize
     * @param _length the length of the resulting vector. defaults to 1
     * @returns a new vector representing the normalised vector scaled by the given length
     */
    public static NORMALIZATION(_vector: Vector2, _length: number = 1): Vector2 {
      let vector: Vector2 = Vector2.ZERO();
      try {
        let [x, y] = _vector.data;
        let factor: number = _length / Math.hypot(x, y);
        vector.set(_vector.x * factor, _vector.y * factor);
      } catch (_error) {
        Debug.warn(_error);
      }
      return vector;
    }

    /**
     * Returns a new vector representing the given vector scaled by the given scaling factor
     */
    public static SCALE(_vector: Vector2, _scale: number): Vector2 {
      let vector: Vector2 = Recycler.get(Vector2);
      vector.set(_vector.x * _scale, _vector.y * _scale);
      return vector;
    }

    /**
     * Returns the resulting vector attained by addition of all given vectors.
     */
    public static SUM(..._vectors: Vector2[]): Vector2 {
      let result: Vector2 = Recycler.get(Vector2);
      for (let vector of _vectors)
        result.set(result.x + vector.x, result.y + vector.y);
      return result;
    }

    /**
     * Returns the result of the subtraction of two vectors.
     */
    public static DIFFERENCE(_minuend: Vector2, _subtrahend: Vector2): Vector2 {
      let vector: Vector2 = Recycler.get(Vector2);
      vector.set(_minuend.x - _subtrahend.x, _minuend.y - _subtrahend.y);
      return vector;
    }

    /**
     * Computes the dotproduct of 2 vectors.
     */
    public static DOT(_a: Vector2, _b: Vector2): number {
      let scalarProduct: number = _a.x * _b.x + _a.y * _b.y;
      return scalarProduct;
    }

    /**
     * Calculates the cross product of two Vectors. Due to them being only 2 Dimensional, the result is a single number,
     * which implicitly is on the Z axis. It is also the signed magnitude of the result.
     * @param _a Vector to compute the cross product on
     * @param _b Vector to compute the cross product with
     * @returns A number representing result of the cross product.
     */
    public static CROSS(_a: Vector2, _b: Vector2): number {
      let crossProduct: number = _a.x * _b.y - _a.y * _b.x;
      return crossProduct;
    }

    /**
     * Calculates the orthogonal vector to the given vector. Rotates counterclockwise by default.
     * ```plaintext
     * ↑ => ← => ↓ => → => ↑
     * ```
     * @param _vector Vector to get the orthogonal equivalent of
     * @param _clockwise Should the rotation be clockwise instead of the default counterclockwise? default: false
     * @returns A Vector that is orthogonal to and has the same magnitude as the given Vector.  
     */
    public static ORTHOGONAL(_vector: Vector2, _clockwise: boolean = false): Vector2 {
      let result: Vector2 = Recycler.get(Vector2);
      if (_clockwise)
        result.set(_vector.y, -_vector.x);
      else
        result.set(-_vector.y, _vector.x);
      return result;
    }

    /**
     * Creates a cartesian vector from polar coordinates
     */
    public static GEO(_angle: number = 0, _magnitude: number = 1): Vector2 {
      let vector: Vector2 = Recycler.get(Vector2);
      let geo: Geo2 = Recycler.get(Geo2);
      geo.set(_angle, _magnitude);
      vector.geo = geo;
      Recycler.store(geo);
      return vector;
    }
    //#endregion

    //#region Accessors
    get x(): number {
      return this.data[0];
    }
    get y(): number {
      return this.data[1];
    }

    set x(_x: number) {
      this.data[0] = _x;
    }
    set y(_y: number) {
      this.data[1] = _y;
    }

    /**
     * Returns the length of the vector
     */
    get magnitude(): number {
      return Math.hypot(...this.data);
    }

    /**
     * Returns the square of the magnitude of the vector without calculating a square root. Faster for simple proximity evaluation.
     */
    get magnitudeSquared(): number {
      return Vector2.DOT(this, this);
    }

    /**
     * Creates and returns a clone of this
     */
    public get clone(): Vector2 {
      let clone: Vector2 = Recycler.get(Vector2);
      clone.data.set(this.data);
      return clone;
    }

    /**
     * Returns a polar representation of this vector
     */
    public get geo(): Geo2 {
      let geo: Geo2 = Recycler.get(Geo2);
      geo.magnitude = this.magnitude;

      if (geo.magnitude === 0)
        return geo;

      geo.angle = 180 * Math.atan2(this.y / geo.magnitude, this.x / geo.magnitude) / Math.PI;
      return geo;
    }

    /**
     * Adjust the cartesian values of this vector to represent the given as polar coordinates
     */
    public set geo(_geo: Geo2) {
      this.set(_geo.magnitude, 0);
      this.transform(Matrix3x3.ROTATION(_geo.angle));
    }
    //#endregion

    public recycle(): void {
      this.data.set([0, 0]);
    }

    /**
     * Copies the values of the given vector into this
     */
    public copy(_original: Vector2): void {
      this.data.set(_original.data);
    }

    /**
     * Returns true if the coordinates of this and the given vector are to be considered identical within the given tolerance
     * TODO: examine, if tolerance as criterium for the difference is appropriate with very large coordinate values or if _tolerance should be multiplied by coordinate value
     */
    public equals(_compare: Vector2, _tolerance: number = Number.EPSILON): boolean {
      if (Math.abs(this.x - _compare.x) > _tolerance) return false;
      if (Math.abs(this.y - _compare.y) > _tolerance) return false;
      return true;
    }

    /**
     * Adds the given vector to the executing vector, changing the executor.
     * @param _addend The vector to add.
     */
    public add(_addend: Vector2): void {
      this.data.set([_addend.x + this.x, _addend.y + this.y]);
    }

    /**
     * Subtracts the given vector from the executing vector, changing the executor.
     * @param _subtrahend The vector to subtract.
     */
    public subtract(_subtrahend: Vector2): void {
      this.data.set([this.x - _subtrahend.x, this.y - _subtrahend.y]);
    }

    /**
     * Scales the Vector by the given _scalar.
     */
    public scale(_scalar: number): void {
      this.data.set([_scalar * this.x, _scalar * this.y]);
    }

    /**
     * Normalizes this to the given length, 1 by default
     */
    public normalize(_length: number = 1): void {
      this.data = Vector2.NORMALIZATION(this, _length).data;
    }

    /**
     * Defines the components of this vector with the given numbers
     */
    public set(_x: number = 0, _y: number = 0): void {
      this.data[0] = _x;
      this.data[1] = _y;
    }

    /**
     * @returns An array of the data of the vector
     */
    public get(): Float32Array {
      return new Float32Array(this.data);
    }

    public transform(_mtxTransform: Matrix3x3, _includeTranslation: boolean = true): void {
      this.data = Vector2.TRANSFORMATION(this, _mtxTransform, _includeTranslation).data;
    }

    /**
     * For each dimension, moves the component to the minimum of this and the given vector
     */
    public min(_compare: Vector3): void {
      this.x = Math.min(this.x, _compare.x);
      this.y = Math.min(this.y, _compare.y);
    }
    /**
     * For each dimension, moves the component to the maximum of this and the given vector
     */
    public max(_compare: Vector3): void {
      this.x = Math.max(this.x, _compare.x);
      this.y = Math.max(this.y, _compare.y);
    }

    /**
     * Adds a z-component of the given magnitude (default=0) to the vector and returns a new Vector3
     */
    public toVector3(_z: number = 0): Vector3 {
      return new Vector3(this.x, this.y, _z);
    }

    public toString(): string {
      let result: string = `(${this.x.toPrecision(5)}, ${this.y.toPrecision(5)})`;
      return result;
    }
    /**
     * Uses the standard array.map functionality to perform the given function on all components of this vector
     * and return a new vector with the results
     */
    public map(_function: (value: number, index: number, array: Float32Array) => number): Vector2 {
      let copy: Vector2 = Recycler.get(Vector2);
      copy.data = this.data.map(_function);
      return copy;
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = this.getMutator();
      // serialization.toJSON = () => { return `{ "r": ${this.r}, "g": ${this.g}, "b": ${this.b}, "a": ${this.a}}`; };
      serialization.toJSON = () => { return `[${this.x}, ${this.y}]`; };
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Vector2> {
      if (typeof (_serialization) == "string") {
        [this.x, this.y] = JSON.parse(<string><unknown>_serialization);
      }
      else
        this.mutate(_serialization);
      return this;
    }

    public getMutator(): Mutator {
      let mutator: Mutator = {
        x: this.data[0], y: this.data[1]
      };
      return mutator;
    }
    protected reduceMutator(_mutator: Mutator): void {/** */ }
    //#endregion
  }
}