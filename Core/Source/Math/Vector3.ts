namespace FudgeCore {
  /**
   * Stores and manipulates a threedimensional vector comprised of the components x, y and z
   * ```plaintext
   *            +y
   *             |__ +x
   *            /
   *          +z   
   * ```
   * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class Vector3 extends Mutable implements Recycable {
    private data: Float32Array; // TODO: check why this shouldn't be x,y,z as numbers...

    public constructor(_x: number = 0, _y: number = 0, _z: number = 0) {
      super();
      this.data = new Float32Array([_x, _y, _z]);
    }

    //#region Static
    /**
     * Creates and returns a vector with the given length pointing in x-direction
     */
    public static X(_scale: number = 1): Vector3 {
      const vector: Vector3 = Recycler.get(Vector3);
      vector.set(_scale, 0, 0);
      return vector;
    }

    /**
     * Creates and returns a vector with the given length pointing in y-direction
     */
    public static Y(_scale: number = 1): Vector3 {
      const vector: Vector3 = Recycler.get(Vector3);
      vector.set(0, _scale, 0);
      return vector;
    }

    /**
     * Creates and returns a vector with the given length pointing in z-direction
     */
    public static Z(_scale: number = 1): Vector3 {
      const vector: Vector3 = Recycler.get(Vector3);
      vector.data.set([0, 0, _scale]);
      return vector;
    }

    /**
     * Creates and returns a vector with the value 0 on each axis
     */
    public static ZERO(): Vector3 {
      const vector: Vector3 = Recycler.get(Vector3);
      vector.set(0, 0, 0);
      return vector;
    }

    /**
     * Creates and returns a vector of the given size on each of the three axis
     */
    public static ONE(_scale: number = 1): Vector3 {
      const vector: Vector3 = Recycler.get(Vector3);
      vector.set(_scale, _scale, _scale);
      return vector;
    }

    /**
     * Creates and returns a vector through transformation of the given vector by the given matrix
     */
    public static TRANSFORMATION(_vector: Vector3, _mtxTransform: Matrix4x4, _includeTranslation: boolean = true): Vector3 {
      let result: Vector3 = Recycler.get(Vector3);
      let m: Float32Array = _mtxTransform.get();
      let [x, y, z] = _vector.get();

      result.x = m[0] * x + m[4] * y + m[8] * z;
      result.y = m[1] * x + m[5] * y + m[9] * z;
      result.z = m[2] * x + m[6] * y + m[10] * z;

      if (_includeTranslation) {
        result.add(_mtxTransform.translation);
      }

      return result;
    }

    /**
     * Creates and returns a vector which is a copy of the given vector scaled to the given length
     */
    public static NORMALIZATION(_vector: Vector3, _length: number = 1): Vector3 {
      let magnitude: number = _vector.magnitude;
      let vector: Vector3;
      try {
        if (magnitude == 0)
          throw (new RangeError("Impossible normalization"));
        vector = Vector3.ZERO();
        let factor: number = _length / _vector.magnitude;
        vector.set(_vector.x * factor, _vector.y * factor, _vector.z * factor);
      } catch (_error) {
        Debug.warn(_error);
      }
      return vector;
    }

    /**
     * Returns the resulting vector attained by addition of all given vectors.
     */
    public static SUM(..._vectors: Vector3[]): Vector3 {
      let result: Vector3 = Recycler.get(Vector3);
      for (let vector of _vectors)
        result.set(result.x + vector.x, result.y + vector.y, result.z + vector.z);
      return result;
    }

    /**
     * Returns the result of the subtraction of two vectors.
     */
    public static DIFFERENCE(_minuend: Vector3, _subtrahend: Vector3): Vector3 {
      let vector: Vector3 = Recycler.get(Vector3);
      vector.set(_minuend.x - _subtrahend.x, _minuend.y - _subtrahend.y, _minuend.z - _subtrahend.z);
      return vector;
    }

    /**
     * Returns a new vector representing the given vector scaled by the given scaling factor
     */
    public static SCALE(_vector: Vector3, _scaling: number): Vector3 {
      let scaled: Vector3 = Recycler.get(Vector3);
      scaled.set(_vector.x * _scaling, _vector.y * _scaling, _vector.z * _scaling);
      return scaled;
    }

    /**
     * Computes the crossproduct of 2 vectors.
     */
    public static CROSS(_a: Vector3, _b: Vector3): Vector3 {
      let vector: Vector3 = Recycler.get(Vector3);
      vector.set(
        _a.y * _b.z - _a.z * _b.y,
        _a.z * _b.x - _a.x * _b.z,
        _a.x * _b.y - _a.y * _b.x
      );
      return vector;
    }
    /**
     * Computes the dotproduct of 2 vectors.
     */
    public static DOT(_a: Vector3, _b: Vector3): number {
      let scalarProduct: number = _a.x * _b.x + _a.y * _b.y + _a.z * _b.z;
      return scalarProduct;
    }

    /**
     * Calculates and returns the reflection of the incoming vector at the given normal vector. The length of normal should be 1.
     *     __________________
     *           /|\
     * incoming / | \ reflection
     *         /  |  \   
     *          normal
     * 
     */
    public static REFLECTION(_incoming: Vector3, _normal: Vector3): Vector3 {
      let dot: number = -Vector3.DOT(_incoming, _normal);
      let reflection: Vector3 = Vector3.SUM(_incoming, Vector3.SCALE(_normal, 2 * dot));
      return reflection;
    }

    /**
     * Divides the dividend by the divisor component by component and returns the result
     */
    public static RATIO(_dividend: Vector3, _divisor: Vector3): Vector3 {
      let vector: Vector3 = Recycler.get(Vector3);
      vector.set(_dividend.x / _divisor.x, _dividend.y / _divisor.y, _dividend.z / _divisor.z);
      return vector;
    }

    /**
     * Creates a cartesian vector from geographic coordinates
     */
    public static GEO(_longitude: number = 0, _latitude: number = 0, _magnitude: number = 1): Vector3 {
      let vector: Vector3 = Recycler.get(Vector3);
      let geo: Geo3 = Recycler.get(Geo3);
      geo.set(_longitude, _latitude, _magnitude);
      vector.geo = geo;
      Recycler.store(geo);
      return vector;
    }
    //#endregion

    //#region Accessors
    // TODO: implement equals-functions
    get x(): number {
      return this.data[0];
    }
    get y(): number {
      return this.data[1];
    }
    get z(): number {
      return this.data[2];
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
      return Vector3.DOT(this, this);
    }

    /**
     * Returns a copy of this vector
     * TODO: rename this clone and create a new method copy, which copies the values from a vector given 
     */
    public get clone(): Vector3 {
      let clone: Vector3 = Recycler.get(Vector3);
      clone.data.set(this.data);
      return clone;
    }

    /**
     * - get: returns a geographic representation of this vector  
     * - set: adjust the cartesian values of this vector to represent the given as geographic coordinates
     */
    public set geo(_geo: Geo3) {
      this.set(0, 0, _geo.magnitude);
      this.transform(Matrix4x4.ROTATION_X(-_geo.latitude));
      this.transform(Matrix4x4.ROTATION_Y(_geo.longitude));
    }
    public get geo(): Geo3 {
      let geo: Geo3 = Recycler.get(Geo3);
      geo.magnitude = this.magnitude;

      if (geo.magnitude === 0)
        return geo;

      geo.longitude = 180 * Math.atan2(this.x / geo.magnitude, this.z / geo.magnitude) / Math.PI;
      geo.latitude = 180 * Math.asin(this.y / geo.magnitude) / Math.PI;
      return geo;
    }
    //#endregion

    public recycle(): void {
      this.data.set([0, 0, 0]);
    }

    /**
     * Returns true if the coordinates of this and the given vector are to be considered identical within the given tolerance
     * TODO: examine, if tolerance as criterium for the difference is appropriate with very large coordinate values or if _tolerance should be multiplied by coordinate value
     */
    public equals(_compare: Vector3, _tolerance: number = Number.EPSILON): boolean {
      if (Math.abs(this.x - _compare.x) > _tolerance) return false;
      if (Math.abs(this.y - _compare.y) > _tolerance) return false;
      if (Math.abs(this.z - _compare.z) > _tolerance) return false;
      return true;
    }

    /**
     * Returns true if the position described by this is within a cube with the opposite corners 1 and 2
     */
    public isInsideCube(_corner1: Vector3, _corner2: Vector3): boolean {
      let diagonal: Vector3 = Vector3.DIFFERENCE(_corner2, _corner1);
      let relative: Vector3 = Vector3.DIFFERENCE(this, _corner1);
      let ratio: Vector3 = Vector3.RATIO(relative, diagonal);
      if (ratio.x > 1 || ratio.x < 0)
        return false;
      if (ratio.y > 1 || ratio.y < 0)
        return false;
      if (ratio.z > 1 || ratio.z < 0)
        return false;
      return true;
    }

    /**
     * Returns true if the position described by this is within a sphere with the given center and radius
     */
    public isInsideSphere(_center: Vector3, _radius: number): boolean {
      let difference: Vector3 = Vector3.DIFFERENCE(this, _center);
      return difference.magnitudeSquared < (_radius * _radius);
    }

    /**
     * Adds the given vector to this
     */
    public add(_addend: Vector3): void {
      this.data.set([_addend.x + this.x, _addend.y + this.y, _addend.z + this.z]);
    }

    /**
     * Subtracts the given vector from this
     */
    public subtract(_subtrahend: Vector3): void {
      this.data.set([this.x - _subtrahend.x, this.y - _subtrahend.y, this.z - _subtrahend.z]);
    }

    /**
     * Scales this vector by the given scalar
     */
    public scale(_scalar: number): void {
      this.data.set([_scalar * this.x, _scalar * this.y, _scalar * this.z]);
    }

    /**
     * Normalizes this to the given length, 1 by default
     */
    public normalize(_length: number = 1): void {
      this.data = Vector3.NORMALIZATION(this, _length).data;
    }

    /**
     * Defines the components of this vector with the given numbers
     */
    public set(_x: number = 0, _y: number = 0, _z: number = 0): void {
      this.data[0] = _x;
      this.data[1] = _y;
      this.data[2] = _z;
    }

    /**
     * Returns this vector as a new Float32Array (copy)
     */
    public get(): Float32Array {
      return new Float32Array(this.data);
    }

    /**
     * Transforms this vector by the given matrix, including or exluding the translation.
     * Including is the default, excluding will only rotate and scale this vector.
     */
    public transform(_mtxTransform: Matrix4x4, _includeTranslation: boolean = true): void {
      let transformed: Vector3 = Vector3.TRANSFORMATION(this, _mtxTransform, _includeTranslation);
      this.data.set(transformed.data);
      Recycler.store(transformed);
    }

    /**
     * Drops the z-component and returns a Vector2 consisting of the x- and y-components
     */
    public toVector2(): Vector2 {
      return new Vector2(this.x, this.y);
    }

    /**
     * Reflects this vector at a given normal. See {@link Vector3.REFLECTION}
     */
    public reflect(_normal: Vector3): void {
      const reflected: Vector3 = Vector3.REFLECTION(this, _normal);
      this.set(reflected.x, reflected.y, reflected.z);
      Recycler.store(reflected);
    }

    /**
     * Shuffles the components of this vector
     */
    shuffle(): void {
      let a: number[] = Array.from(this.data);
      this.set(Random.default.splice(a), Random.default.splice(a), a[0]);
    }

    public getDistance(_to: Vector3): number {
      let difference: Vector3 = Vector3.DIFFERENCE(this, _to);
      Recycler.store(difference);
      return difference.magnitude;
    }
    /**
     * For each dimension, moves the component to the minimum of this and the given vector
     */
    public min(_compare: Vector3): void {
      this.x = Math.min(this.x, _compare.x);
      this.y = Math.min(this.y, _compare.y);
      this.z = Math.min(this.z, _compare.z);
    }
    /**
     * For each dimension, moves the component to the maximum of this and the given vector
     */
    public max(_compare: Vector3): void {
      this.x = Math.max(this.x, _compare.x);
      this.y = Math.max(this.y, _compare.y);
      this.z = Math.max(this.z, _compare.z);
    }

    /**
     * Returns a formatted string representation of this vector
     */
    public toString(): string {
      let result: string = `(${this.x.toPrecision(5)}, ${this.y.toPrecision(5)}, ${this.z.toPrecision(5)})`;
      return result;
    }

    /**
     * Uses the standard array.map functionality to perform the given function on all components of this vector
     */
    public map(_function: (value: number, index: number, array: Float32Array) => number): Vector3 {
      let copy: Vector3 = Recycler.get(Vector3);
      copy.data = this.data.map(_function);
      return copy;
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = this.getMutator();
      // serialization.toJSON = () => { return `{ "r": ${this.r}, "g": ${this.g}, "b": ${this.b}, "a": ${this.a}}`; };
      serialization.toJSON = () => { return `[${this.x}, ${this.y}, ${this.z}]`; };
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Vector3> {
      if (typeof (_serialization) == "string") {
        [this.x, this.y, this.z] = JSON.parse(<string><unknown>_serialization);
      }
      else
        this.mutate(_serialization);
      return this;
    }

    public getMutator(): Mutator {
      let mutator: Mutator = {
        x: this.data[0], y: this.data[1], z: this.data[2]
      };
      return mutator;
    }
    protected reduceMutator(_mutator: Mutator): void {/** */ }
    //#endregion Transfer
  }
}