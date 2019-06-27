namespace Fudge {
  /**
   * Stores and manipulates a twodimensional vector comprised of the components x and y
   * ```plaintext
   *            +y
   *             |__ +x
   * ```
   * @authors Lukas Scheuerle, HFU, 2019
   */
  export class Vector2 {
    private data: Float32Array;

    public constructor(_x: number = 0, _y: number = 0) {
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
     * @returns A new vector with the values (0, 0)
     */
    public static get ZERO(): Vector2 {
      let vector: Vector2 = new Vector2();
      return vector;
    }

    /** 
     * A shorthand for writing Vector2(0, 1).
     * @returns A new vector with the values (0, 1)
     */
    public static get UP(): Vector2 {
      let vector: Vector2 = new Vector2(0, 1);
      return vector;
    }

    /** 
     * A shorthand for writing Vector2(0, -1).
     * @returns A new vector with the values (0, -1)
     */
    public static get DOWN(): Vector2 {
      let vector: Vector2 = new Vector2(0, -1);
      return vector;
    }

    /** 
     * A shorthand for writing Vector2(1, 0).
     * @returns A new vector with the values (1, 0)
     */
    public static get RIGHT(): Vector2 {
      let vector: Vector2 = new Vector2(1, 0);
      return vector;
    }

    /** 
     * A shorthand for writing Vector2(-1, 0).
     * @returns A new vector with the values (-1, 0)
     */
    public static get LEFT(): Vector2 {
      let vector: Vector2 = new Vector2(-1, 0);
      return vector;
    }

    /**
     * Scales a given vector by a given scale
     * @param _vector The vector to scale.
     * @param _scale The scale to scale with.
     * @returns A new vector representing the scaled version of the given vector
     */
    public static NORMALIZATION(_vector: Vector2, _length: number = 1): Vector2 {
      let vector: Vector2 = Vector2.ZERO;
      try {
        let [x, y] = _vector.data;
        let factor: number = _length / Math.hypot(x, y);
        vector.data = new Float32Array([_vector.x * factor, _vector.y * factor]);
      } catch (_e) {
        console.warn(_e);
      }
      return vector;
    }

    /**
     * Scales a given vector by a given scale
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
     * @returns The Array of the data of the vector
     */
    public get(): Float32Array {
      return new Float32Array(this.data);
    }

    /**
     * @returns An independent copy of the vector.
     */
    public get copy(): Vector2 {
      return new Vector2(this.x, this.y);
    }
  }
}