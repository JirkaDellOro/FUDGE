namespace FudgeCore {
  /**
   * Stores and manipulates a twodimensional vector comprised of the components x and y
   * ```plaintext
   *            +y
   *             |__ +x
   * ```
   * @authors Lukas Scheuerle, Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class Vector2 extends Mutable {
    private data: Float32Array;

    public constructor(_x: number = 0, _y: number = 0) {
      super();
      this.data = new Float32Array([_x, _y]);
    }

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
     * A shorthand for writing `new Vector2(0, 0)`.
     * @returns A new vector with the values (0, 0)
     */
    public static ZERO(): Vector2 {
      let vector: Vector2 = new Vector2();
      return vector;
    }

    /** 
     * A shorthand for writing `new Vector2(_scale, _scale)`.
     * @param _scale the scale of the vector. Default: 1
     */
    public static ONE(_scale: number = 1): Vector2 {
      let vector: Vector2 = new Vector2(_scale, _scale);
      return vector;
    }

    /** 
     * A shorthand for writing `new Vector2(0, y)`.
     * @param _scale The number to write in the y coordinate. Default: 1
     * @returns A new vector with the values (0, _scale)
     */
    public static Y(_scale: number = 1): Vector2 {
      let vector: Vector2 = new Vector2(0, _scale);
      return vector;
    }

    /** 
     * A shorthand for writing `new Vector2(x, 0)`.
     * @param _scale The number to write in the x coordinate. Default: 1
     * @returns A new vector with the values (_scale, 0)
     */
    public static X(_scale: number = 1): Vector2 {
      let vector: Vector2 = new Vector2(_scale, 0);
      return vector;
    }

    public static TRANSFORMATION(_vector: Vector2, _matrix: Matrix3x3, _includeTranslation: boolean = true): Vector2 {
      let result: Vector2 = new Vector2();
      let m: Float32Array = _matrix.get();
      let [x, y] = _vector.get();
      result.x = m[0] * x + m[3] * y;
      result.y = m[1] * x + m[4] * y;

      if (_includeTranslation) {
        result.add(_matrix.translation);
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
        vector.data = new Float32Array([_vector.x * factor, _vector.y * factor]);
      } catch (_error) {
        console.warn(_error);
      }
      return vector;
    }

    /**
     * Scales a given vector by a given scale without changing the original vector
     * @param _vector The vector to scale.
     * @param _scale The scale to scale with.
     * @returns A new vector representing the scaled version of the given vector
     */
    public static SCALE(_vector: Vector2, _scale: number): Vector2 {
      let vector: Vector2 = new Vector2();
      return vector;
    }

    /**
     * Sums up multiple vectors.
     * @param _vectors A series of vectors to sum up
     * @returns A new vector representing the sum of the given vectors
     */
    public static SUM(..._vectors: Vector2[]): Vector2 {
      let result: Vector2 = new Vector2();
      for (let vector of _vectors)
        result.data = new Float32Array([result.x + vector.x, result.y + vector.y]);
      return result;
    }

    /**
     * Subtracts two vectors.
     * @param _a The vector to subtract from.
     * @param _b The vector to subtract.
     * @returns A new vector representing the difference of the given vectors
     */
    public static DIFFERENCE(_a: Vector2, _b: Vector2): Vector2 {
      let vector: Vector2 = new Vector2;
      vector.data = new Float32Array([_a.x - _b.x, _a.y - _b.y]);
      return vector;
    }

    /**
     * Computes the dotproduct of 2 vectors.
     * @param _a The vector to multiply.
     * @param _b The vector to multiply by.
     * @returns A new vector representing the dotproduct of the given vectors
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
    public static CROSSPRODUCT(_a: Vector2, _b: Vector2): number {
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
      if (_clockwise) return new Vector2(_vector.y, -_vector.x);
      else return new Vector2(-_vector.y, _vector.x);
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
      this.data = new Vector2(_addend.x + this.x, _addend.y + this.y).data;
    }

    /**
     * Subtracts the given vector from the executing vector, changing the executor.
     * @param _subtrahend The vector to subtract.
     */
    public subtract(_subtrahend: Vector2): void {
      this.data = new Vector2(this.x - _subtrahend.x, this.y - _subtrahend.y).data;
    }

    /**
     * Scales the Vector by the _scale.
     * @param _scale The scale to multiply the vector with.
     */
    public scale(_scale: number): void {
      this.data = new Vector2(_scale * this.x, _scale * this.y).data;
    }

    /**
     * Normalizes the vector.
     * @param _length A modificator to get a different length of normalized vector.
     */
    public normalize(_length: number = 1): void {
      this.data = Vector2.NORMALIZATION(this, _length).data;
    }

    /**
     * Sets the Vector to the given parameters. Ommitted parameters default to 0.
     * @param _x new x to set
     * @param _y new y to set
     */
    public set(_x: number = 0, _y: number = 0): void {
      this.data = new Float32Array([_x, _y]);
    }

    /**
     * @returns An array of the data of the vector
     */
    public get(): Float32Array {
      return new Float32Array(this.data);
    }

    /**
     * @returns A deep copy of the vector.
     */
    public get copy(): Vector2 {
      return new Vector2(this.x, this.y);
    }

    public transform(_matrix: Matrix3x3, _includeTranslation: boolean = true): void {
      this.data = Vector2.TRANSFORMATION(this, _matrix, _includeTranslation).data;
    }

    /**
     * Adds a z-component to the vector and returns a new Vector3
     */
    public toVector3(): Vector3 {
      return new Vector3(this.x, this.y, 0);
    }

    public toString(): string {
      let result: string = `(${this.x.toPrecision(5)}, ${this.y.toPrecision(5)})`;
      return result;
    }

    public getMutator(): Mutator {
      let mutator: Mutator = {
        x: this.data[0], y: this.data[1]
      };
      return mutator;
    }
    protected reduceMutator(_mutator: Mutator): void {/** */ }
  }
}