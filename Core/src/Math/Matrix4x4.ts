namespace Fudge {

    /**
     * Simple class for 4x4 transformation matrix operations.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class Matrix4x4 extends Mutable implements Serializable {  // TODO: examine if it could/should be an extension of Float32Array
        public data: Float32Array; // The data of the matrix.

        public constructor() {
            super();
            this.data = new Float32Array([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
        }

        // Transformation methods.######################################################################################
        public static get identity(): Matrix4x4 {
            return new Matrix4x4;
        }
        /**
         * Wrapper function that multiplies a passed matrix by a scalingmatrix with passed x-, y- and z-multipliers.
         * @param _matrix The matrix to multiply.
         * @param _x The scaling multiplier for the x-Axis.
         * @param _y The scaling multiplier for the y-Axis.
         * @param _z The scaling multiplier for the z-Axis.
         */

        public static scale(_matrix: Matrix4x4, _x: number, _y: number, _z: number): Matrix4x4 {
            return Matrix4x4.multiply(_matrix, this.scaling(_x, _y, _z));
        }
        /**
         * Computes and returns the product of two passed matrices.
         * @param _a The matrix to multiply.
         * @param _b The matrix to multiply by.
         */
        public static multiply(_a: Matrix4x4, _b: Matrix4x4): Matrix4x4 {
            let matrix: Matrix4x4 = new Matrix4x4();
            let a00: number = _a.data[0 * 4 + 0];
            let a01: number = _a.data[0 * 4 + 1];
            let a02: number = _a.data[0 * 4 + 2];
            let a03: number = _a.data[0 * 4 + 3];
            let a10: number = _a.data[1 * 4 + 0];
            let a11: number = _a.data[1 * 4 + 1];
            let a12: number = _a.data[1 * 4 + 2];
            let a13: number = _a.data[1 * 4 + 3];
            let a20: number = _a.data[2 * 4 + 0];
            let a21: number = _a.data[2 * 4 + 1];
            let a22: number = _a.data[2 * 4 + 2];
            let a23: number = _a.data[2 * 4 + 3];
            let a30: number = _a.data[3 * 4 + 0];
            let a31: number = _a.data[3 * 4 + 1];
            let a32: number = _a.data[3 * 4 + 2];
            let a33: number = _a.data[3 * 4 + 3];
            let b00: number = _b.data[0 * 4 + 0];
            let b01: number = _b.data[0 * 4 + 1];
            let b02: number = _b.data[0 * 4 + 2];
            let b03: number = _b.data[0 * 4 + 3];
            let b10: number = _b.data[1 * 4 + 0];
            let b11: number = _b.data[1 * 4 + 1];
            let b12: number = _b.data[1 * 4 + 2];
            let b13: number = _b.data[1 * 4 + 3];
            let b20: number = _b.data[2 * 4 + 0];
            let b21: number = _b.data[2 * 4 + 1];
            let b22: number = _b.data[2 * 4 + 2];
            let b23: number = _b.data[2 * 4 + 3];
            let b30: number = _b.data[3 * 4 + 0];
            let b31: number = _b.data[3 * 4 + 1];
            let b32: number = _b.data[3 * 4 + 2];
            let b33: number = _b.data[3 * 4 + 3];
            matrix.data = new Float32Array(
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
         * @param _matrix Tha matrix to compute the inverse of.
         */
        public static inverse(_matrix: Matrix4x4): Matrix4x4 {

            let m00: number = _matrix.data[0 * 4 + 0];
            let m01: number = _matrix.data[0 * 4 + 1];
            let m02: number = _matrix.data[0 * 4 + 2];
            let m03: number = _matrix.data[0 * 4 + 3];
            let m10: number = _matrix.data[1 * 4 + 0];
            let m11: number = _matrix.data[1 * 4 + 1];
            let m12: number = _matrix.data[1 * 4 + 2];
            let m13: number = _matrix.data[1 * 4 + 3];
            let m20: number = _matrix.data[2 * 4 + 0];
            let m21: number = _matrix.data[2 * 4 + 1];
            let m22: number = _matrix.data[2 * 4 + 2];
            let m23: number = _matrix.data[2 * 4 + 3];
            let m30: number = _matrix.data[3 * 4 + 0];
            let m31: number = _matrix.data[3 * 4 + 1];
            let m32: number = _matrix.data[3 * 4 + 2];
            let m33: number = _matrix.data[3 * 4 + 3];
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

            let matrix: Matrix4x4 = new Matrix4x4;
            matrix.data = new Float32Array([
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
        public static lookAt(_transformPosition: Vector3, _targetPosition: Vector3): Matrix4x4 {
            let matrix: Matrix4x4 = new Matrix4x4;
            let transformPosition: Vector3 = new Vector3(_transformPosition.x, _transformPosition.y, _transformPosition.z);
            let targetPosition: Vector3 = new Vector3(_targetPosition.x, _targetPosition.y, _targetPosition.z);
            let zAxis: Vector3 = Vector3.subtract(transformPosition, targetPosition);
            zAxis = Vector3.normalize(zAxis);
            let xAxis: Vector3;
            let yAxis: Vector3;
            if (zAxis.Data != Vector3.up.Data) { // TODO: verify intention - this is the comparison of references...
                xAxis = Vector3.normalize(Vector3.cross(Vector3.up, zAxis));
                yAxis = Vector3.normalize(Vector3.cross(zAxis, xAxis));
            }
            else {
                xAxis = Vector3.normalize(Vector3.subtract(transformPosition, targetPosition));
                yAxis = Vector3.normalize(Vector3.cross(Vector3.forward, xAxis));
                zAxis = Vector3.normalize(Vector3.cross(xAxis, yAxis));
            }
            matrix.data = new Float32Array(
                [
                    xAxis.x, xAxis.y, xAxis.z, 0,
                    yAxis.x, yAxis.y, yAxis.z, 0,
                    zAxis.x, zAxis.y, zAxis.z, 0,
                    transformPosition.x,
                    transformPosition.y,
                    transformPosition.z,
                    1
                ]);
            return matrix;
        }

        // Projection methods.######################################################################################
        /**
         * Computes and returns a matrix that applies perspective to an object, if its transform is multiplied by it.
         * @param _aspect The aspect ratio between width and height of projectionspace.(Default = canvas.clientWidth / canvas.ClientHeight)
         * @param _fieldOfViewInDegrees The field of view in Degrees. (Default = 45)
         * @param _near The near clipspace border on the z-axis.
         * @param _far The far clipspace borer on the z-axis.
         */
        public static centralProjection(_aspect: number, _fieldOfViewInDegrees: number, _near: number, _far: number, _direction: FIELD_OF_VIEW): Matrix4x4 {
            let fieldOfViewInRadians: number = _fieldOfViewInDegrees * Math.PI / 180;
            let f: number = Math.tan(0.5 * (Math.PI - fieldOfViewInRadians));
            let rangeInv: number = 1.0 / (_near - _far);
            let matrix: Matrix4x4 = new Matrix4x4;
            matrix.data = new Float32Array([
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
        public static orthographicProjection(_left: number, _right: number, _bottom: number, _top: number, _near: number = -400, _far: number = 400): Matrix4x4 {
            let matrix: Matrix4x4 = new Matrix4x4;
            matrix.data = new Float32Array([
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
        /**
        * Wrapper function that multiplies a passed matrix by a translationmatrix with passed x-, y- and z-values.
        * @param _matrix The matrix to multiply.
        * @param _xTranslation The x-value of the translation.
        * @param _yTranslation The y-value of the translation.
        * @param _zTranslation The z-value of the translation.
        */
        public static translate(_matrix: Matrix4x4, _xTranslation: number, _yTranslation: number, _zTranslation: number): Matrix4x4 {
            return Matrix4x4.multiply(_matrix, this.translation(_xTranslation, _yTranslation, _zTranslation));
        }
        /**
        * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed x-rotation.
        * @param _matrix The matrix to multiply.
        * @param _angleInDegrees The angle to rotate by.
        */
        public static rotateX(_matrix: Matrix4x4, _angleInDegrees: number): Matrix4x4 {
            return Matrix4x4.multiply(_matrix, this.xRotation(_angleInDegrees));
        }
        /**
         * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed y-rotation.
         * @param _matrix The matrix to multiply.
         * @param _angleInDegrees The angle to rotate by.
         */
        public static rotateY(_matrix: Matrix4x4, _angleInDegrees: number): Matrix4x4 {
            return Matrix4x4.multiply(_matrix, this.yRotation(_angleInDegrees));
        }
        /**
         * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed z-rotation.
         * @param _matrix The matrix to multiply.
         * @param _angleInDegrees The angle to rotate by.
         */
        public static rotateZ(_matrix: Matrix4x4, _angleInDegrees: number): Matrix4x4 {
            return Matrix4x4.multiply(_matrix, this.zRotation(_angleInDegrees));
        }
        // Translation methods.######################################################################################
        /**
         * Returns a matrix that translates coordinates on the x-, y- and z-axis when multiplied by.
         * @param _xTranslation The x-value of the translation.
         * @param _yTranslation The y-value of the translation.
         * @param _zTranslation The z-value of the translation.
         */
        private static translation(_xTranslation: number, _yTranslation: number, _zTranslation: number): Matrix4x4 {
            let matrix: Matrix4x4 = new Matrix4x4;
            matrix.data = new Float32Array([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                _xTranslation, _yTranslation, _zTranslation, 1
            ]);
            return matrix;
        }

        // Rotation methods.######################################################################################
        /**
         * Returns a matrix that rotates coordinates on the x-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        private static xRotation(_angleInDegrees: number): Matrix4x4 {
            let matrix: Matrix4x4 = new Matrix4x4;
            let angleInRadians: number = _angleInDegrees * Math.PI / 180;
            let sin: number = Math.sin(angleInRadians);
            let cos: number = Math.cos(angleInRadians);
            matrix.data = new Float32Array([
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
        private static yRotation(_angleInDegrees: number): Matrix4x4 {
            let matrix: Matrix4x4 = new Matrix4x4;
            let angleInRadians: number = _angleInDegrees * Math.PI / 180;
            let sin: number = Math.sin(angleInRadians);
            let cos: number = Math.cos(angleInRadians);
            matrix.data = new Float32Array([
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
        private static zRotation(_angleInDegrees: number): Matrix4x4 {
            let matrix: Matrix4x4 = new Matrix4x4;
            let angleInRadians: number = _angleInDegrees * Math.PI / 180;
            let sin: number = Math.sin(angleInRadians);
            let cos: number = Math.cos(angleInRadians);
            matrix.data = new Float32Array([
                cos, sin, 0, 0,
                -sin, cos, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
            return matrix;
        }

        // Scaling methods.######################################################################################
        /**
         * Returns a matrix that scales coordinates on the x-, y- and z-axis when multiplied by.
         * @param _x The scaling multiplier for the x-axis.
         * @param _y The scaling multiplier for the y-axis.
         * @param _z The scaling multiplier for the z-axis.
         */
        private static scaling(_x: number, _y: number, _z: number): Matrix4x4 {
            let matrix: Matrix4x4 = new Matrix4x4;
            matrix.data = new Float32Array([
                _x, 0, 0, 0,
                0, _y, 0, 0,
                0, 0, _z, 0,
                0, 0, 0, 1
            ]);
            return matrix;
        }

        public serialize(): Serialization {
            // TODO: save translation, rotation and scale as vectors for readability and manipulation
            let serialization: Serialization = {
                data: Array.from(this.data)
            };
            return serialization;
        }
        public deserialize(_serialization: Serialization): Serializable {
            this.data = new Float32Array(_serialization.data);
            return this;
        }

        public getMutator(): Mutator {
            let mutator: Mutator = {
                data: Object.assign({}, this.data)
            };
            return mutator;
        }
        protected reduceMutator(_mutator: Mutator): void {/** */ }
    }
}
