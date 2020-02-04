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
  export class Vector3 extends Mutable {
    private data: Float32Array; // TODO: check why this shouldn't be x,y,z as numbers...

    public constructor(_x: number = 0, _y: number = 0, _z: number = 0) {
      super();
      this.data = new Float32Array([_x, _y, _z]);
    }

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
     * Creates and returns a vector with the given length pointing in x-direction
     */
    public static X(_scale: number = 1): Vector3 {
      const vector: Vector3 = new Vector3(_scale, 0, 0);
      return vector;
    }

    /**
     * Creates and returns a vector with the given length pointing in y-direction
     */
    public static Y(_scale: number = 1): Vector3 {
      const vector: Vector3 = new Vector3(0, _scale, 0);
      return vector;
    }

    /**
     * Creates and returns a vector with the given length pointing in z-direction
     */
    public static Z(_scale: number = 1): Vector3 {
      const vector: Vector3 = new Vector3(0, 0, _scale);
      return vector;
    }

    /**
     * Creates and returns a vector with the value 0 on each axis
     */
    public static ZERO(): Vector3 {
      const vector: Vector3 = new Vector3(0, 0, 0);
      return vector;
    }

    /**
     * Creates and returns a vector of the given size on each of the three axis
     */
    public static ONE(_scale: number = 1): Vector3 {
      const vector: Vector3 = new Vector3(_scale, _scale, _scale);
      return vector;
    }

    /**
     * Creates and returns a vector through transformation of the given vector by the given matrix
     */
    public static TRANSFORMATION(_vector: Vector3, _matrix: Matrix4x4, _includeTranslation: boolean = true): Vector3 {
      let result: Vector3 = new Vector3();
      let m: Float32Array = _matrix.get();
      let [x, y, z] = _vector.get();
      result.x = m[0] * x + m[4] * y + m[8] * z;
      result.y = m[1] * x + m[5] * y + m[9] * z;
      result.z = m[2] * x + m[6] * y + m[10] * z;

      if (_includeTranslation) {
        result.add(_matrix.translation);
      }

      return result;
    }

    /**
     * Creates and returns a vector which is a copy of the given vector scaled to the given length
     */
    public static NORMALIZATION(_vector: Vector3, _length: number = 1): Vector3 {
      let vector: Vector3 = Vector3.ZERO();
      try {
        let factor: number = _length / _vector.magnitude;
        vector.data = new Float32Array([_vector.x * factor, _vector.y * factor, _vector.z * factor]);
      } catch (_error) {
        Debug.warn(_error);
      }
      return vector;
    }

    /**
     * Sums up multiple vectors.
     * @param _vectors A series of vectors to sum up
     * @returns A new vector representing the sum of the given vectors
     */
    public static SUM(..._vectors: Vector3[]): Vector3 {
      let result: Vector3 = new Vector3();
      for (let vector of _vectors)
        result.data = new Float32Array([result.x + vector.x, result.y + vector.y, result.z + vector.z]);
      return result;
    }
    /**
     * Subtracts two vectors.
     * @param _a The vector to subtract from.
     * @param _b The vector to subtract.
     * @returns A new vector representing the difference of the given vectors
     */
    public static DIFFERENCE(_a: Vector3, _b: Vector3): Vector3 {
      let vector: Vector3 = new Vector3;
      vector.data = new Float32Array([_a.x - _b.x, _a.y - _b.y, _a.z - _b.z]);
      return vector;
    }
    /**
     * Returns a new vector representing the given vector scaled by the given scaling factor
     */
    public static SCALE(_vector: Vector3, _scaling: number): Vector3 {
      let scaled: Vector3 = new Vector3();
      scaled.data = new Float32Array([_vector.x * _scaling, _vector.y * _scaling, _vector.z * _scaling]);
      return scaled;
    }
    /**
     * Computes the crossproduct of 2 vectors.
     * @param _a The vector to multiply.
     * @param _b The vector to multiply by.
     * @returns A new vector representing the crossproduct of the given vectors
     */
    public static CROSS(_a: Vector3, _b: Vector3): Vector3 {
      let vector: Vector3 = new Vector3;
      vector.data = new Float32Array([
        _a.y * _b.z - _a.z * _b.y,
        _a.z * _b.x - _a.x * _b.z,
        _a.x * _b.y - _a.y * _b.x]);
      return vector;
    }
    /**
     * Computes the dotproduct of 2 vectors.
     * @param _a The vector to multiply.
     * @param _b The vector to multiply by.
     * @returns A new vector representing the dotproduct of the given vectors
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
     * Returns true if the coordinates of this and the given vector are to be considered identical within the given tolerance
     * TODO: examine, if tolerance as criterium for the difference is appropriate with very large coordinate values or if _tolerance should be multiplied by coordinate value
     */
    public equals(_compare: Vector3, _tolerance: number = Number.EPSILON): boolean {
      if (Math.abs(this.x - _compare.x) > _tolerance) return false;
      if (Math.abs(this.y - _compare.y) > _tolerance) return false;
      if (Math.abs(this.z - _compare.z) > _tolerance) return false;
      return true;
    }

    public add(_addend: Vector3): void {
      this.data = new Vector3(_addend.x + this.x, _addend.y + this.y, _addend.z + this.z).data;
    }
    public subtract(_subtrahend: Vector3): void {
      this.data = new Vector3(this.x - _subtrahend.x, this.y - _subtrahend.y, this.z - _subtrahend.z).data;
    }
    public scale(_scale: number): void {
      this.data = new Vector3(_scale * this.x, _scale * this.y, _scale * this.z).data;
    }

    public normalize(_length: number = 1): void {
      this.data = Vector3.NORMALIZATION(this, _length).data;
    }

    public set(_x: number = 0, _y: number = 0, _z: number = 0): void {
      this.data = new Float32Array([_x, _y, _z]);
    }

    public get(): Float32Array {
      return new Float32Array(this.data);
    }

    public get copy(): Vector3 {
      return new Vector3(this.x, this.y, this.z);
    }

    public transform(_matrix: Matrix4x4, _includeTranslation: boolean = true): void {
      this.data = Vector3.TRANSFORMATION(this, _matrix, _includeTranslation).data;
    }

    /**
     * Drops the z-component and returns a Vector2 consisting of the x- and y-components
     */
    public toVector2(): Vector2 {
      return new Vector2(this.x, this.y);
    }

    public reflect(_normal: Vector3): void {
      const reflected: Vector3 = Vector3.REFLECTION(this, _normal);
      this.set(reflected.x, reflected.y, reflected.z);
      Recycler.store(reflected);
    }

    public toString(): string {
      let result: string = `(${this.x.toPrecision(5)}, ${this.y.toPrecision(5)}, ${this.z.toPrecision(5)})`;
      return result;
    }

    public map(_function: (value: number, index: number, array: Float32Array) => number): Vector3 {
      let copy: Vector3 = Recycler.get(Vector3);
      copy.data = this.data.map(_function);
      return copy;
    }

    public getMutator(): Mutator {
      let mutator: Mutator = {
        x: this.data[0], y: this.data[1], z: this.data[2]
      };
      return mutator;
    }
    protected reduceMutator(_mutator: Mutator): void {/** */ }
  }
}