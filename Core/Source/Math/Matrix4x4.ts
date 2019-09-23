namespace FudgeCore {

  /**
   * Stores a 4x4 transformation matrix and provides operations for it.
   * ```plaintext
   * [ 0, 1, 2, 3 ] <- row vector x
   * [ 4, 5, 6, 7 ] <- row vector y
   * [ 8, 9,10,11 ] <- row vector z
   * [12,13,14,15 ] <- translation
   *            ^  homogeneous column
   * ```
   * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
   */

  interface VectorRepresentation {
    translation: Vector3;
    rotation: Vector3;
    scaling: Vector3;
  }

  export class Matrix4x4 extends Mutable implements Serializable {
    private data: Float32Array = new Float32Array(16); // The data of the matrix.
    private mutator: Mutator = null; // prepared for optimization, keep mutator to reduce redundant calculation and for comparison. Set to null when data changes!
    private vectors: VectorRepresentation; // vector representation of 

    public constructor() {
      super();
      this.data.set([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);
      this.resetCache();
    }

    public get translation(): Vector3 {
      if (!this.vectors.translation)
        this.vectors.translation = new Vector3(this.data[12], this.data[13], this.data[14]);
      return this.vectors.translation;
    }
    public set translation(_translation: Vector3) {
      this.data.set(_translation.get(), 12);
      // no full cache reset required
      this.vectors.translation = _translation;
      this.mutator = null;
    }

    public get rotation(): Vector3 {
      if (!this.vectors.rotation)
        this.vectors.rotation = this.getEulerAngles();
      return this.vectors.rotation;
    }
    public set rotation(_rotation: Vector3) {
      this.mutate({ "rotation": _rotation });
      this.resetCache();
    }

    public get scaling(): Vector3 {
      if (!this.vectors.scaling)
        this.vectors.scaling = new Vector3(
          Math.hypot(this.data[0], this.data[1], this.data[2]),
          Math.hypot(this.data[4], this.data[5], this.data[6]),
          Math.hypot(this.data[8], this.data[9], this.data[10])
        );
      return this.vectors.scaling;
    }
    public set scaling(_scaling: Vector3) {
      this.mutate({ "scaling": _scaling });
      this.resetCache();
    }

    //#region STATICS
    public static get IDENTITY(): Matrix4x4 {
      // const result: Matrix4x4 = new Matrix4x4();
      const result: Matrix4x4 = Recycler.get(Matrix4x4);
      result.data.set([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);
      return result;
    }

    /**
     * Computes and returns the product of two passed matrices.
     * @param _a The matrix to multiply.
     * @param _b The matrix to multiply by.
     */
    public static MULTIPLICATION(_a: Matrix4x4, _b: Matrix4x4): Matrix4x4 {
      let a: Float32Array = _a.data;
      let b: Float32Array = _b.data;
      // let matrix: Matrix4x4 = new Matrix4x4();
      const matrix: Matrix4x4 = Recycler.get(Matrix4x4);
      let a00: number = a[0 * 4 + 0];
      let a01: number = a[0 * 4 + 1];
      let a02: number = a[0 * 4 + 2];
      let a03: number = a[0 * 4 + 3];
      let a10: number = a[1 * 4 + 0];
      let a11: number = a[1 * 4 + 1];
      let a12: number = a[1 * 4 + 2];
      let a13: number = a[1 * 4 + 3];
      let a20: number = a[2 * 4 + 0];
      let a21: number = a[2 * 4 + 1];
      let a22: number = a[2 * 4 + 2];
      let a23: number = a[2 * 4 + 3];
      let a30: number = a[3 * 4 + 0];
      let a31: number = a[3 * 4 + 1];
      let a32: number = a[3 * 4 + 2];
      let a33: number = a[3 * 4 + 3];
      let b00: number = b[0 * 4 + 0];
      let b01: number = b[0 * 4 + 1];
      let b02: number = b[0 * 4 + 2];
      let b03: number = b[0 * 4 + 3];
      let b10: number = b[1 * 4 + 0];
      let b11: number = b[1 * 4 + 1];
      let b12: number = b[1 * 4 + 2];
      let b13: number = b[1 * 4 + 3];
      let b20: number = b[2 * 4 + 0];
      let b21: number = b[2 * 4 + 1];
      let b22: number = b[2 * 4 + 2];
      let b23: number = b[2 * 4 + 3];
      let b30: number = b[3 * 4 + 0];
      let b31: number = b[3 * 4 + 1];
      let b32: number = b[3 * 4 + 2];
      let b33: number = b[3 * 4 + 3];
      matrix.data.set(
        [
          b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
          b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
          b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
          b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
          b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
          b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
          b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
          b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
          b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
          b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
          b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
          b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
          b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
          b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
          b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
          b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33
        ]);
      return matrix;
    }

    /**
     * Computes and returns the inverse of a passed matrix.
     * @param _matrix The matrix to compute the inverse of.
     */
    public static INVERSION(_matrix: Matrix4x4): Matrix4x4 {
      let m: Float32Array = _matrix.data;
      let m00: number = m[0 * 4 + 0];
      let m01: number = m[0 * 4 + 1];
      let m02: number = m[0 * 4 + 2];
      let m03: number = m[0 * 4 + 3];
      let m10: number = m[1 * 4 + 0];
      let m11: number = m[1 * 4 + 1];
      let m12: number = m[1 * 4 + 2];
      let m13: number = m[1 * 4 + 3];
      let m20: number = m[2 * 4 + 0];
      let m21: number = m[2 * 4 + 1];
      let m22: number = m[2 * 4 + 2];
      let m23: number = m[2 * 4 + 3];
      let m30: number = m[3 * 4 + 0];
      let m31: number = m[3 * 4 + 1];
      let m32: number = m[3 * 4 + 2];
      let m33: number = m[3 * 4 + 3];
      let tmp0: number = m22 * m33;
      let tmp1: number = m32 * m23;
      let tmp2: number = m12 * m33;
      let tmp3: number = m32 * m13;
      let tmp4: number = m12 * m23;
      let tmp5: number = m22 * m13;
      let tmp6: number = m02 * m33;
      let tmp7: number = m32 * m03;
      let tmp8: number = m02 * m23;
      let tmp9: number = m22 * m03;
      let tmp10: number = m02 * m13;
      let tmp11: number = m12 * m03;
      let tmp12: number = m20 * m31;
      let tmp13: number = m30 * m21;
      let tmp14: number = m10 * m31;
      let tmp15: number = m30 * m11;
      let tmp16: number = m10 * m21;
      let tmp17: number = m20 * m11;
      let tmp18: number = m00 * m31;
      let tmp19: number = m30 * m01;
      let tmp20: number = m00 * m21;
      let tmp21: number = m20 * m01;
      let tmp22: number = m00 * m11;
      let tmp23: number = m10 * m01;

      let t0: number = (tmp0 * m11 + tmp3 * m21 + tmp4 * m31) -
        (tmp1 * m11 + tmp2 * m21 + tmp5 * m31);

      let t1: number = (tmp1 * m01 + tmp6 * m21 + tmp9 * m31) -
        (tmp0 * m01 + tmp7 * m21 + tmp8 * m31);
      let t2: number = (tmp2 * m01 + tmp7 * m11 + tmp10 * m31) -
        (tmp3 * m01 + tmp6 * m11 + tmp11 * m31);
      let t3: number = (tmp5 * m01 + tmp8 * m11 + tmp11 * m21) -
        (tmp4 * m01 + tmp9 * m11 + tmp10 * m21);

      let d: number = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

      // let matrix: Matrix4x4 = new Matrix4x4;
      const matrix: Matrix4x4 = Recycler.get(Matrix4x4);
      matrix.data.set([
        d * t0, // [0]
        d * t1, // [1]
        d * t2, // [2]
        d * t3, // [3]
        d * ((tmp1 * m10 + tmp2 * m20 + tmp5 * m30) - (tmp0 * m10 + tmp3 * m20 + tmp4 * m30)),        // [4]
        d * ((tmp0 * m00 + tmp7 * m20 + tmp8 * m30) - (tmp1 * m00 + tmp6 * m20 + tmp9 * m30)),        // [5]
        d * ((tmp3 * m00 + tmp6 * m10 + tmp11 * m30) - (tmp2 * m00 + tmp7 * m10 + tmp10 * m30)),      // [6]
        d * ((tmp4 * m00 + tmp9 * m10 + tmp10 * m20) - (tmp5 * m00 + tmp8 * m10 + tmp11 * m20)),      // [7]
        d * ((tmp12 * m13 + tmp15 * m23 + tmp16 * m33) - (tmp13 * m13 + tmp14 * m23 + tmp17 * m33)),  // [8]
        d * ((tmp13 * m03 + tmp18 * m23 + tmp21 * m33) - (tmp12 * m03 + tmp19 * m23 + tmp20 * m33)),  // [9]
        d * ((tmp14 * m03 + tmp19 * m13 + tmp22 * m33) - (tmp15 * m03 + tmp18 * m13 + tmp23 * m33)),  // [10]
        d * ((tmp17 * m03 + tmp20 * m13 + tmp23 * m23) - (tmp16 * m03 + tmp21 * m13 + tmp22 * m23)),  // [11]
        d * ((tmp14 * m22 + tmp17 * m32 + tmp13 * m12) - (tmp16 * m32 + tmp12 * m12 + tmp15 * m22)),  // [12]
        d * ((tmp20 * m32 + tmp12 * m02 + tmp19 * m22) - (tmp18 * m22 + tmp21 * m32 + tmp13 * m02)),  // [13]
        d * ((tmp18 * m12 + tmp23 * m32 + tmp15 * m02) - (tmp22 * m32 + tmp14 * m02 + tmp19 * m12)),  // [14]
        d * ((tmp22 * m22 + tmp16 * m02 + tmp21 * m12) - (tmp20 * m12 + tmp23 * m22 + tmp17 * m02))  // [15]
      ]);
      return matrix;
    }

    /**
     * Computes and returns a rotationmatrix that aligns a transformations z-axis with the vector between it and its target.
     * @param _transformPosition The x,y and z-coordinates of the object to rotate.
     * @param _targetPosition The position to look at.
     */
    public static LOOK_AT(_transformPosition: Vector3, _targetPosition: Vector3, _up: Vector3 = Vector3.Y()): Matrix4x4 {
      // const matrix: Matrix4x4 = new Matrix4x4;
      const matrix: Matrix4x4 = Recycler.get(Matrix4x4);
      let zAxis: Vector3 = Vector3.DIFFERENCE(_transformPosition, _targetPosition);
      zAxis.normalize();
      let xAxis: Vector3 = Vector3.NORMALIZATION(Vector3.CROSS(_up, zAxis));
      let yAxis: Vector3 = Vector3.NORMALIZATION(Vector3.CROSS(zAxis, xAxis));
      matrix.data.set(
        [
          xAxis.x, xAxis.y, xAxis.z, 0,
          yAxis.x, yAxis.y, yAxis.z, 0,
          zAxis.x, zAxis.y, zAxis.z, 0,
          _transformPosition.x,
          _transformPosition.y,
          _transformPosition.z,
          1
        ]);
      return matrix;
    }

    /**
     * Returns a matrix that translates coordinates along the x-, y- and z-axis according to the given vector.
     * @param _translate 
     */
    public static TRANSLATION(_translate: Vector3): Matrix4x4 {
      // let matrix: Matrix4x4 = new Matrix4x4;
      const matrix: Matrix4x4 = Recycler.get(Matrix4x4);
      matrix.data.set([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        _translate.x, _translate.y, _translate.z, 1
      ]);
      return matrix;
    }

    /**
     * Returns a matrix that rotates coordinates on the x-axis when multiplied by.
     * @param _angleInDegrees The value of the rotation.
     */
    public static ROTATION_X(_angleInDegrees: number): Matrix4x4 {
      // const matrix: Matrix4x4 = new Matrix4x4;
      const matrix: Matrix4x4 = Recycler.get(Matrix4x4);
      let angleInRadians: number = _angleInDegrees * Math.PI / 180;
      let sin: number = Math.sin(angleInRadians);
      let cos: number = Math.cos(angleInRadians);
      matrix.data.set([
        1, 0, 0, 0,
        0, cos, sin, 0,
        0, -sin, cos, 0,
        0, 0, 0, 1
      ]);
      return matrix;
    }

    /**
     * Returns a matrix that rotates coordinates on the y-axis when multiplied by.
     * @param _angleInDegrees The value of the rotation.
     */
    public static ROTATION_Y(_angleInDegrees: number): Matrix4x4 {
      // const matrix: Matrix4x4 = new Matrix4x4;
      let matrix: Matrix4x4 = Recycler.get(Matrix4x4);
      let angleInRadians: number = _angleInDegrees * Math.PI / 180;
      let sin: number = Math.sin(angleInRadians);
      let cos: number = Math.cos(angleInRadians);
      matrix.data.set([
        cos, 0, -sin, 0,
        0, 1, 0, 0,
        sin, 0, cos, 0,
        0, 0, 0, 1
      ]);
      return matrix;
    }

    /**
     * Returns a matrix that rotates coordinates on the z-axis when multiplied by.
     * @param _angleInDegrees The value of the rotation.
     */
    public static ROTATION_Z(_angleInDegrees: number): Matrix4x4 {
      // const matrix: Matrix4x4 = new Matrix4x4;
      const matrix: Matrix4x4 = Recycler.get(Matrix4x4);
      let angleInRadians: number = _angleInDegrees * Math.PI / 180;
      let sin: number = Math.sin(angleInRadians);
      let cos: number = Math.cos(angleInRadians);
      matrix.data.set([
        cos, sin, 0, 0,
        -sin, cos, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);
      return matrix;
    }

    /**
     * Returns a matrix that scales coordinates along the x-, y- and z-axis according to the given vector
     * @param _scalar 
     */
    public static SCALING(_scalar: Vector3): Matrix4x4 {
      // const matrix: Matrix4x4 = new Matrix4x4;
      const matrix: Matrix4x4 = Recycler.get(Matrix4x4);
      matrix.data.set([
        _scalar.x, 0, 0, 0,
        0, _scalar.y, 0, 0,
        0, 0, _scalar.z, 0,
        0, 0, 0, 1
      ]);
      return matrix;
    }
    //#endregion

    //#region PROJECTIONS
    /**
     * Computes and returns a matrix that applies perspective to an object, if its transform is multiplied by it.
     * @param _aspect The aspect ratio between width and height of projectionspace.(Default = canvas.clientWidth / canvas.ClientHeight)
     * @param _fieldOfViewInDegrees The field of view in Degrees. (Default = 45)
     * @param _near The near clipspace border on the z-axis.
     * @param _far The far clipspace border on the z-axis.
     * @param _direction The plane on which the fieldOfView-Angle is given 
     */
    public static PROJECTION_CENTRAL(_aspect: number, _fieldOfViewInDegrees: number, _near: number, _far: number, _direction: FIELD_OF_VIEW): Matrix4x4 {
      let fieldOfViewInRadians: number = _fieldOfViewInDegrees * Math.PI / 180;
      let f: number = Math.tan(0.5 * (Math.PI - fieldOfViewInRadians));
      let rangeInv: number = 1.0 / (_near - _far);
      // const matrix: Matrix4x4 = new Matrix4x4;
      const matrix: Matrix4x4 = Recycler.get(Matrix4x4);
      matrix.data.set([
        f, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (_near + _far) * rangeInv, -1,
        0, 0, _near * _far * rangeInv * 2, 0
      ]);

      if (_direction == FIELD_OF_VIEW.DIAGONAL) {
        _aspect = Math.sqrt(_aspect);
        matrix.data[0] = f / _aspect;
        matrix.data[5] = f * _aspect;
      }
      else if (_direction == FIELD_OF_VIEW.VERTICAL)
        matrix.data[0] = f / _aspect;
      else //FOV_DIRECTION.HORIZONTAL
        matrix.data[5] = f * _aspect;

      return matrix;
    }

    /**
     * Computes and returns a matrix that applies orthographic projection to an object, if its transform is multiplied by it.
     * @param _left The positionvalue of the projectionspace's left border.
     * @param _right The positionvalue of the projectionspace's right border.
     * @param _bottom The positionvalue of the projectionspace's bottom border.
     * @param _top The positionvalue of the projectionspace's top border.
     * @param _near The positionvalue of the projectionspace's near border.
     * @param _far The positionvalue of the projectionspace's far border
     */
    public static PROJECTION_ORTHOGRAPHIC(_left: number, _right: number, _bottom: number, _top: number, _near: number = -400, _far: number = 400): Matrix4x4 {
      // const matrix: Matrix4x4 = new Matrix4x4;
      const matrix: Matrix4x4 = Recycler.get(Matrix4x4);
      matrix.data.set([
        2 / (_right - _left), 0, 0, 0,
        0, 2 / (_top - _bottom), 0, 0,
        0, 0, 2 / (_near - _far), 0,
        (_left + _right) / (_left - _right),
        (_bottom + _top) / (_bottom - _top),
        (_near + _far) / (_near - _far),
        1
      ]);
      return matrix;
    }
    //#endregion

    //#region Rotation
    /**
    * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed x-rotation.
    * @param _matrix The matrix to multiply.
    * @param _angleInDegrees The angle to rotate by.
    */
    public rotateX(_angleInDegrees: number): void {
      const matrix: Matrix4x4 = Matrix4x4.MULTIPLICATION(this, Matrix4x4.ROTATION_X(_angleInDegrees));
      this.set(matrix);
      Recycler.store(matrix);
    }

    /**
     * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed y-rotation.
     * @param _matrix The matrix to multiply.
     * @param _angleInDegrees The angle to rotate by.
     */
    public rotateY(_angleInDegrees: number): void {
      const matrix: Matrix4x4 = Matrix4x4.MULTIPLICATION(this, Matrix4x4.ROTATION_Y(_angleInDegrees));
      this.set(matrix);
      Recycler.store(matrix);
    }

    /**
     * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed z-rotation.
     * @param _matrix The matrix to multiply.
     * @param _angleInDegrees The angle to rotate by.
     */
    public rotateZ(_angleInDegrees: number): void {
      const matrix: Matrix4x4 = Matrix4x4.MULTIPLICATION(this, Matrix4x4.ROTATION_Z(_angleInDegrees));
      this.set(matrix);
      Recycler.store(matrix);
    }

    public lookAt(_target: Vector3, _up: Vector3 = Vector3.Y()): void {
      const matrix: Matrix4x4 = Matrix4x4.LOOK_AT(this.translation, _target); // TODO: Handle rotation around z-axis
      this.set(matrix);
      Recycler.store(matrix);
    }
    //#endregion

    //#region Translation
    public translate(_by: Vector3): void {
      const matrix: Matrix4x4 = Matrix4x4.MULTIPLICATION(this, Matrix4x4.TRANSLATION(_by));
      // TODO: possible optimization, translation may alter mutator instead of deleting it.
      this.set(matrix);
      Recycler.store(matrix);
    }

    /**
     * Translate the transformation along the x-axis.
     * @param _x The value of the translation.
     */
    public translateX(_x: number): void {
      this.data[12] += _x;
      this.mutator = null;
    }
    /**
     * Translate the transformation along the y-axis.
     * @param _y The value of the translation.
     */
    public translateY(_y: number): void {
      this.data[13] += _y;
      this.mutator = null;
    }
    /**
     * Translate the transformation along the z-axis.
     * @param _z The value of the translation.
     */
    public translateZ(_z: number): void {
      this.data[14] += _z;
      this.mutator = null;
    }
    //#endregion

    //#region Scaling
    public scale(_by: Vector3): void {
      const matrix: Matrix4x4 = Matrix4x4.MULTIPLICATION(this, Matrix4x4.SCALING(_by));
      this.set(matrix);
      Recycler.store(matrix);
    }
    public scaleX(_by: number): void {
      this.scale(new Vector3(_by, 1, 1));
    }
    public scaleY(_by: number): void {
      this.scale(new Vector3(1, _by, 1));
    }
    public scaleZ(_by: number): void {
      this.scale(new Vector3(1, 1, _by));
    }
    //#endregion

    //#region Transformation
    public multiply(_matrix: Matrix4x4): void {
      this.set(Matrix4x4.MULTIPLICATION(this, _matrix));
      this.mutator = null;
    }
    //#endregion

    //#region Transfer
    public getEulerAngles(): Vector3 {
      let scaling: Vector3 = this.scaling;

      let s0: number = this.data[0] / scaling.x;
      let s1: number = this.data[1] / scaling.x;
      let s2: number = this.data[2] / scaling.x;
      let s6: number = this.data[6] / scaling.y;
      let s10: number = this.data[10] / scaling.z;

      let sy: number = Math.hypot(s0, s1); // probably 2. param should be this.data[4] / scaling.y

      let singular: boolean = sy < 1e-6; // If

      let x1: number, y1: number, z1: number;
      let x2: number, y2: number, z2: number;

      if (!singular) {
        x1 = Math.atan2(s6, s10);
        y1 = Math.atan2(-s2, sy);
        z1 = Math.atan2(s1, s0);

        x2 = Math.atan2(-s6, -s10);
        y2 = Math.atan2(-s2, -sy);
        z2 = Math.atan2(-s1, -s0);

        if (Math.abs(x2) + Math.abs(y2) + Math.abs(z2) < Math.abs(x1) + Math.abs(y1) + Math.abs(z1)) {
          x1 = x2;
          y1 = y2;
          z1 = z2;
        }
      }
      else {
        x1 = Math.atan2(-this.data[9] / scaling.z, this.data[5] / scaling.y);
        y1 = Math.atan2(-this.data[2] / scaling.x, sy);
        z1 = 0;
      }

      let rotation: Vector3 = new Vector3(x1, y1, z1);
      rotation.scale(180 / Math.PI);

      return rotation;
    }

    public set(_to: Matrix4x4): void {
      // this.data = _to.get();
      this.data.set(_to.data);
      this.resetCache();
    }

    public get(): Float32Array {
      return new Float32Array(this.data);
    }

    public serialize(): Serialization {
      // TODO: save translation, rotation and scale as vectors for readability and manipulation
      let serialization: Serialization = this.getMutator();
      return serialization;
    }
    public deserialize(_serialization: Serialization): Serializable {
      this.mutate(_serialization);
      return this;
    }

    public getMutator(): Mutator {
      if (this.mutator)
        return this.mutator;

      let mutator: Mutator = {
        translation: this.translation.getMutator(),
        rotation: this.rotation.getMutator(),
        scaling: this.scaling.getMutator()
      };

      // cache mutator
      this.mutator = mutator;
      return mutator;
    }

    public mutate(_mutator: Mutator): void {
      let oldTranslation: Vector3 = this.translation;
      let oldRotation: Vector3 = this.rotation;
      let oldScaling: Vector3 = this.scaling;
      let newTranslation: Vector3 = <Vector3>_mutator["translation"];
      let newRotation: Vector3 = <Vector3>_mutator["rotation"];
      let newScaling: Vector3 = <Vector3>_mutator["scaling"];
      let vectors: VectorRepresentation = { translation: null, rotation: null, scaling: null };
      if (newTranslation) {
        vectors.translation = new Vector3(
          newTranslation.x != undefined ? newTranslation.x : oldTranslation.x,
          newTranslation.y != undefined ? newTranslation.y : oldTranslation.y,
          newTranslation.z != undefined ? newTranslation.z : oldTranslation.z
        );
      }
      if (newRotation) {
        vectors.rotation = new Vector3(
          newRotation.x != undefined ? newRotation.x : oldRotation.x,
          newRotation.y != undefined ? newRotation.y : oldRotation.y,
          newRotation.z != undefined ? newRotation.z : oldRotation.z
        );
      }
      if (newScaling) {
        vectors.scaling = new Vector3(
          newScaling.x != undefined ? newScaling.x : oldScaling.x,
          newScaling.y != undefined ? newScaling.y : oldScaling.y,
          newScaling.z != undefined ? newScaling.z : oldScaling.z
        );
      }

      // TODO: possible performance optimization when only one or two components change, then use old matrix instead of IDENTITY and transform by differences/quotients
      let matrix: Matrix4x4 = Matrix4x4.IDENTITY;
      if (vectors.translation)
        matrix.translate(vectors.translation);
      if (vectors.rotation) {
        matrix.rotateZ(vectors.rotation.z);
        matrix.rotateY(vectors.rotation.y);
        matrix.rotateX(vectors.rotation.x);
      }
      if (vectors.scaling)
        matrix.scale(vectors.scaling);
      this.set(matrix);

      this.vectors = vectors;
    }

    public getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes {
      let types: MutatorAttributeTypes = {};
      if (_mutator.translation) types.translation = "Vector3";
      if (_mutator.rotation) types.rotation = "Vector3";
      if (_mutator.scaling) types.scaling = "Vector3";
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
