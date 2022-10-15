namespace FudgeCore {

  /**
   * Represents the matrix as translation, rotation and scaling {@link Vector2}, being calculated from the matrix
   */
  interface VectorRepresentation {
    translation: Vector2;
    rotation: number;
    scaling: Vector2;
  }

  /**
   * Simple class for 3x3 matrix operations
   * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class Matrix3x3 extends Mutable implements Serializable, Recycable {
    private data: Float32Array = new Float32Array(9); // The data of the matrix.
    private mutator: Mutator = null; // prepared for optimization, keep mutator to reduce redundant calculation and for comparison. Set to null when data changes!
    private vectors: VectorRepresentation; // vector representation of this matrix

    public constructor() {
      super();
      this.recycle();
      this.resetCache();
    }


    //TODO: figure out what this is used for
    public static PROJECTION(_width: number, _height: number): Matrix3x3 {
      let mtxResult: Matrix3x3 = new Matrix3x3;
      mtxResult.data.set([
        2 / _width, 0, 0,
        0, -2 / _height, 0,
        -1, 1, 1
      ]);
      return mtxResult;
    }

    public static IDENTITY(): Matrix3x3 {
      const mtxResult: Matrix3x3 = Recycler.get(Matrix3x3);
      return mtxResult;
    }

    /**
     * Returns a matrix that translates coordinates along the x-, y- and z-axis according to the given {@link Vector2}.
     */
    public static TRANSLATION(_translate: Vector2): Matrix3x3 {
      const mtxResult: Matrix3x3 = Recycler.get(Matrix3x3);
      mtxResult.data.set([
        1, 0, 0,
        0, 1, 0,
        _translate.x, _translate.y, 1
      ]);
      return mtxResult;
    }

    /**
     * Returns a matrix that rotates coordinates on the z-axis when multiplied by.
     * @param _angleInDegrees The value of the rotation.
     */
    public static ROTATION(_angleInDegrees: number): Matrix3x3 {
      const mtxResult: Matrix3x3 = Recycler.get(Matrix3x3);
      let angleInRadians: number = _angleInDegrees * Calc.deg2rad;
      let sin: number = Math.sin(angleInRadians);
      let cos: number = Math.cos(angleInRadians);
      mtxResult.data.set([
        cos, sin, 0,
        -sin, cos, 0,
        0, 0, 1
      ]);
      return mtxResult;
    }

    /**
     * Returns a matrix that scales coordinates along the x-, y- and z-axis according to the given {@link Vector2}
     */
    public static SCALING(_scalar: Vector2): Matrix3x3 {
      const mtxResult: Matrix3x3 = Recycler.get(Matrix3x3);
      mtxResult.data.set([
        _scalar.x, 0, 0,
        0, _scalar.y, 0,
        0, 0, 1
      ]);
      return mtxResult;
    }
    //#endregion


    public static MULTIPLICATION(_mtxLeft: Matrix3x3, _mtxRight: Matrix3x3): Matrix3x3 {
      let a00: number = _mtxLeft.data[0 * 3 + 0];
      let a01: number = _mtxLeft.data[0 * 3 + 1];
      let a02: number = _mtxLeft.data[0 * 3 + 2];
      let a10: number = _mtxLeft.data[1 * 3 + 0];
      let a11: number = _mtxLeft.data[1 * 3 + 1];
      let a12: number = _mtxLeft.data[1 * 3 + 2];
      let a20: number = _mtxLeft.data[2 * 3 + 0];
      let a21: number = _mtxLeft.data[2 * 3 + 1];
      let a22: number = _mtxLeft.data[2 * 3 + 2];
      let b00: number = _mtxRight.data[0 * 3 + 0];
      let b01: number = _mtxRight.data[0 * 3 + 1];
      let b02: number = _mtxRight.data[0 * 3 + 2];
      let b10: number = _mtxRight.data[1 * 3 + 0];
      let b11: number = _mtxRight.data[1 * 3 + 1];
      let b12: number = _mtxRight.data[1 * 3 + 2];
      let b20: number = _mtxRight.data[2 * 3 + 0];
      let b21: number = _mtxRight.data[2 * 3 + 1];
      let b22: number = _mtxRight.data[2 * 3 + 2];
      let mtxResult: Matrix3x3 = new Matrix3x3;
      mtxResult.data.set([
        b00 * a00 + b01 * a10 + b02 * a20,
        b00 * a01 + b01 * a11 + b02 * a21,
        b00 * a02 + b01 * a12 + b02 * a22,
        b10 * a00 + b11 * a10 + b12 * a20,
        b10 * a01 + b11 * a11 + b12 * a21,
        b10 * a02 + b11 * a12 + b12 * a22,
        b20 * a00 + b21 * a10 + b22 * a20,
        b20 * a01 + b21 * a11 + b22 * a21,
        b20 * a02 + b21 * a12 + b22 * a22
      ]);
      return mtxResult;
    }

    /**
     * Computes and returns the inverse of a passed matrix.
     * @param _mtx The matrix to compute the inverse of.
     */
    public static INVERSION(_mtx: Matrix3x3): Matrix3x3 {
      let m: Float32Array = _mtx.data;
      let m00: number = m[0 * 3 + 0];
      let m01: number = m[0 * 3 + 1];
      let m02: number = m[0 * 3 + 2];
      let m10: number = m[1 * 3 + 0];
      let m11: number = m[1 * 3 + 1];
      let m12: number = m[1 * 3 + 2];
      let m20: number = m[2 * 3 + 0];
      let m21: number = m[2 * 3 + 1];
      let m22: number = m[2 * 3 + 2];

      let d: number = 1 /
        (m00 * (m11 * m22 - m21 * m12) -
        m01 * (m10 * m22 - m12 * m20) +
        m02 * (m10 * m21 - m11 * m20));

      const mtxResult: Matrix3x3 = Recycler.get(Matrix3x3);
      mtxResult.data.set([
        d * (m11 * m22 - m21 * m12), // [0]
        d * (m02 * m21 - m01 * m22), // [1]
        d * (m01 * m12 - m02 * m11), // [2]
        d * (m12 * m20 - m10 * m22), // [3]
        d * (m00 * m22 - m02 * m20), // [4]
        d * (m10 * m02 - m00 * m12), // [5]
        d * (m10 * m21 - m20 * m11), // [6]
        d * (m20 * m01 - m00 * m21), // [7]
        d * (m00 * m11 - m10 * m01) // [8]
      ]);
      return mtxResult;
    }

    /** 
     * - get: return a vector representation of the translation {@link Vector2}.  
     * **Caution!** Use immediately, since the vector is going to be reused by Recycler. Create a clone to keep longer and manipulate. 
     * - set: effect the matrix ignoring its rotation and scaling
     */
    public get translation(): Vector2 {
      if (!this.vectors.translation)
        this.vectors.translation = new Vector2(this.data[6], this.data[7]);
      return this.vectors.translation; // .clone;
    }
    public set translation(_translation: Vector2) {
      this.data.set(_translation.get(), 6);
      // no full cache reset required
      this.vectors.translation = _translation;
      this.mutator = null;
    }

    /** 
     * - get: a copy of the calculated rotation {@link Vector2}   
     * - set: effect the matrix
     */
    public get rotation(): number {
      if (!this.vectors.rotation)
        this.vectors.rotation = this.getEulerAngle();
      return this.vectors.rotation;
    }
    public set rotation(_rotation: number) {
      this.mutate({ "rotation": _rotation });
      this.resetCache();
    }

    /** 
     * - get: return a vector representation of the scale {@link Vector3}.  
     * **Caution!** Do not manipulate result, instead create a clone!    
     * - set: effect the matrix
     */
    public get scaling(): Vector2 {
      if (!this.vectors.scaling)
        this.vectors.scaling = new Vector2(
          Math.hypot(this.data[0], this.data[1]) * (this.data[0] < 0 ? -1 : 1),
          Math.hypot(this.data[3], this.data[4]) * (this.data[4] < 0 ? -1 : 1)
        );
      return this.vectors.scaling; // .clone;
    }
    public set scaling(_scaling: Vector2) {
      this.mutate({ "scaling": _scaling });
      this.resetCache();
    }

    /**
     * Return a copy of this
     */
    public get clone(): Matrix3x3 {
      let mtxClone: Matrix3x3 = Recycler.get(Matrix3x3);
      mtxClone.set(this);
      return mtxClone;
    }

    /**
     * Resets the matrix to the identity-matrix and clears cache. Used by the recycler to reset.
     */
    public recycle(): void {
      this.data = new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
      ]);
      this.resetCache(); 
    }
    
    /**
     * Resets the matrix to the identity-matrix and clears cache.
     */
    public reset(): void {
      this.recycle();
    }

    //#region Translation
    /**
     * Add a translation by the given {@link Vector2} to this matrix 
     */
    public translate(_by: Vector2): void {
      const mtxResult: Matrix3x3 = Matrix3x3.MULTIPLICATION(this, Matrix3x3.TRANSLATION(_by));
      // TODO: possible optimization, translation may alter mutator instead of deleting it.
      this.set(mtxResult);
      Recycler.store(mtxResult);
    }

    /**
     * Add a translation along the x-Axis by the given amount to this matrix 
     */
    public translateX(_x: number): void {
      this.data[6] += _x;
      this.mutator = null;
      this.vectors.translation = null;
    }
    /**
     * Add a translation along the y-Axis by the given amount to this matrix 
     */
    public translateY(_y: number): void {
      this.data[7] += _y;
      this.mutator = null;
      this.vectors.translation = null;
    }
    //#endregion

    //#region Scaling
    /**
     * Add a scaling by the given {@link Vector2} to this matrix 
     */
    public scale(_by: Vector2): void {
      const mtxResult: Matrix3x3 = Matrix3x3.MULTIPLICATION(this, Matrix3x3.SCALING(_by));
      this.set(mtxResult);
      Recycler.store(mtxResult);
    }
    /**
     * Add a scaling along the x-Axis by the given amount to this matrix 
     */
    public scaleX(_by: number): void {
      let vector: Vector2 = Recycler.get(Vector2);
      vector.set(_by, 1);
      this.scale(vector);
      Recycler.store(vector);
    }
    /**
     * Add a scaling along the y-Axis by the given amount to this matrix 
     */
    public scaleY(_by: number): void {
      let vector: Vector2 = Recycler.get(Vector2);
      vector.set(1, _by);
      this.scale(vector);
      Recycler.store(vector);
    }
    //#endregion


    //#region Rotation
    /**
     * Adds a rotation around the z-Axis to this matrix
     */
    public rotate(_angleInDegrees: number): void {
      const mtxResult: Matrix3x3 = Matrix3x3.MULTIPLICATION(this, Matrix3x3.ROTATION(_angleInDegrees));
      this.set(mtxResult);
      Recycler.store(mtxResult);
    }
    //#endregion

    //#region Transformation
    /**
     * Multiply this matrix with the given matrix
     */
    public multiply(_mtxRight: Matrix3x3): void {
      let mtxResult: Matrix3x3 = Matrix3x3.MULTIPLICATION(this, _mtxRight);
      this.set(mtxResult);
      Recycler.store(mtxResult);
      this.mutator = null;
    }
    //#endregion


    //#region Transfer
    /**
     * Calculates and returns the euler-angles representing the current rotation of this matrix
     */
    public getEulerAngle(): number {
      let scaling: Vector2 = this.scaling;

      let s0: number = this.data[0] / scaling.x;
      let s1: number = this.data[1] / scaling.x;
      let s3: number = this.data[3] / scaling.y;
      let s4: number = this.data[4] / scaling.y;

      let xSkew: number = Math.atan2(-s3, s4);
      let ySkew: number = Math.atan2(s0, s1);

      let sy: number = Math.hypot(s0, s1); // probably 2. param should be this.data[4] / scaling.y
      let rotation: number;

      if (!(sy > 1e-6))
        rotation = ySkew;
      else
        rotation = xSkew;

      rotation *= Calc.rad2deg;

      return rotation;
    }

    /**
     * Sets the elements of this matrix to the values of the given matrix
     */
    public set(_mtxTo: Matrix3x3): void {
      // this.data = _to.get();
      this.data.set(_mtxTo.data);
      this.resetCache();
    }

    public toString(): string {
      return `ƒ.Matrix3x3(translation: ${this.translation.toString()}, rotation: ${this.rotation.toString()}, scaling: ${this.scaling.toString()}`;
    }



    /**
     * Return the elements of this matrix as a Float32Array
     */
    public get(): Float32Array {
      return new Float32Array(this.data);
    }

    public serialize(): Serialization {
      // this.getMutator();
      let serialization: Serialization = {
        translation: this.translation.serialize(),
        rotation: this.rotation,
        scaling: this.scaling.serialize()
      };
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      let mutator: Mutator = {
        translation: await this.translation.deserialize(_serialization.translation),
        rotation: _serialization.rotation,
        scaling: await this.scaling.deserialize(_serialization.scaling)
      };
      this.mutate(mutator);
      return this;
    }

    public getMutator(): Mutator {
      if (this.mutator)
        return this.mutator;

      let mutator: Mutator = {
        translation: this.translation.getMutator(),
        rotation: this.rotation,
        scaling: this.scaling.getMutator()
      };

      // cache mutator
      this.mutator = mutator;
      return mutator;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      let oldTranslation: Vector2 = this.translation;
      let oldRotation: number = this.rotation;
      let oldScaling: Vector2 = this.scaling;
      let newTranslation: Vector2 = <Vector2>_mutator["translation"];
      let newRotation: number = <number>_mutator["rotation"];
      let newScaling: Vector2 = <Vector2>_mutator["scaling"];
      let vectors: VectorRepresentation = { translation: oldTranslation, rotation: oldRotation, scaling: oldScaling };
      if (newTranslation) {
        vectors.translation = new Vector2(
          newTranslation.x != undefined ? newTranslation.x : oldTranslation.x,
          newTranslation.y != undefined ? newTranslation.y : oldTranslation.y
        );
      }

      vectors.rotation = (newRotation == undefined) ? oldRotation : newRotation;

      if (newScaling) {
        vectors.scaling = new Vector2(
          newScaling.x != undefined ? newScaling.x : oldScaling.x,
          newScaling.y != undefined ? newScaling.y : oldScaling.y
        );
      }

      // TODO: possible performance optimization when only one or two components change, then use old matrix instead of IDENTITY and transform by differences/quotients
      let mtxResult: Matrix3x3 = Matrix3x3.IDENTITY();
      if (vectors.translation)
        mtxResult.translate(vectors.translation);
      if (vectors.rotation) {
        mtxResult.rotate(vectors.rotation);
      }
      if (vectors.scaling)
        mtxResult.scale(vectors.scaling);
      this.set(mtxResult);

      this.vectors = vectors;
    }

    public getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes {
      let types: MutatorAttributeTypes = {};
      if (_mutator.translation) types.translation = "Vector2";
      if (_mutator.rotation != undefined) types.rotation = "number";
      if (_mutator.scaling) types.scaling = "Vector2";
      return types;
    }
    protected reduceMutator(_mutator: Mutator): void {/** */ }

    private resetCache(): void {
      this.vectors = { translation: null, rotation: null, scaling: null };
      this.mutator = null;
    }
  }
  //#endregion

}
