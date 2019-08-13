var WebEngine;
(function (WebEngine) {
    /**
     * Simple class for 4x4 matrix operations.
     */
    class Mat4 {
        constructor() {
            this.data = new Float32Array([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
        }
        // Get method.######################################################################################
        get Data() {
            return this.data;
        }
        // Transformation methods.######################################################################################
        static identity() {
            return new Mat4;
        }
        // Translation methods.######################################################################################
        /**
         * Returns a matrix that translates coordinates on the x-, y- and z-axis when multiplied by.
         * @param _xTranslation The x-value of the translation.
         * @param _yTranslation The y-value of the translation.
         * @param _zTranslation The z-value of the translation.
         */
        static translation(_xTranslation, _yTranslation, _zTranslation) {
            let matrix = new Mat4;
            matrix.data = new Float32Array([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                _xTranslation, _yTranslation, _zTranslation, 1
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
        static translate(_matrix, _xTranslation, _yTranslation, _zTranslation) {
            return Mat4.multiply(_matrix, this.translation(_xTranslation, _yTranslation, _zTranslation));
        }
        // Rotation methods.######################################################################################
        /**
         * Returns a matrix that rotates coordinates on the x-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        static xRotation(_angleInDegrees) {
            let matrix = new Mat4;
            let angleInRadians = _angleInDegrees * Math.PI / 180;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            matrix.data = new Float32Array([
                1, 0, 0, 0,
                0, cos, sin, 0,
                0, -sin, cos, 0,
                0, 0, 0, 1
            ]);
            return matrix;
        }
        /**
         * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed x-rotation.
         * @param _matrix The matrix to multiply.
         * @param _angleInDegrees The angle to rotate by.
         */
        static rotateX(_matrix, _angleInDegrees) {
            return Mat4.multiply(_matrix, this.xRotation(_angleInDegrees));
        }
        /**
         * Returns a matrix that rotates coordinates on the y-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        static yRotation(_angleInDegrees) {
            let matrix = new Mat4;
            let angleInRadians = _angleInDegrees * Math.PI / 180;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            matrix.data = new Float32Array([
                cos, 0, -sin, 0,
                0, 1, 0, 0,
                sin, 0, cos, 0,
                0, 0, 0, 1
            ]);
            return matrix;
        }
        /**
         * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed y-rotation.
         * @param _matrix The matrix to multiply.
         * @param _angleInDegrees The angle to rotate by.
         */
        static rotateY(_matrix, _angleInDegrees) {
            return Mat4.multiply(_matrix, this.yRotation(_angleInDegrees));
        }
        /**
         * Returns a matrix that rotates coordinates on the z-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        static zRotation(_angleInDegrees) {
            let matrix = new Mat4;
            let angleInRadians = _angleInDegrees * Math.PI / 180;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            matrix.data = new Float32Array([
                cos, sin, 0, 0,
                -sin, cos, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
            return matrix;
        }
        /**
         * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed z-rotation.
         * @param _matrix The matrix to multiply.
         * @param _angleInDegrees The angle to rotate by.
         */
        static rotateZ(_matrix, _angleInDegrees) {
            return Mat4.multiply(_matrix, this.zRotation(_angleInDegrees));
        }
        // Scaling methods.######################################################################################
        /**
         * Returns a matrix that scales coordinates on the x-, y- and z-axis when multiplied by.
         * @param _x The scaling multiplier for the x-axis.
         * @param _y The scaling multiplier for the y-axis.
         * @param _z The scaling multiplier for the z-axis.
         */
        static scaling(_x, _y, _z) {
            let matrix = new Mat4;
            matrix.data = new Float32Array([
                _x, 0, 0, 0,
                0, _y, 0, 0,
                0, 0, _z, 0,
                0, 0, 0, 1
            ]);
            return matrix;
        }
        /**
         * Wrapper function that multiplies a passed matrix by a scalingmatrix with passed x-, y- and z-multipliers.
         * @param _matrix The matrix to multiply.
         * @param _x The scaling multiplier for the x-Axis.
         * @param _y The scaling multiplier for the y-Axis.
         * @param _z The scaling multiplier for the z-Axis.
         */
        static scale(_matrix, _x, _y, _z) {
            return Mat4.multiply(_matrix, this.scaling(_x, _y, _z));
        }
        /**
         * Computes and returns the product of two passed matrices.
         * @param _a The matrix to multiply.
         * @param _b The matrix to multiply by.
         */
        static multiply(_a, _b) {
            let matrix = new Mat4();
            let a00 = _a.Data[0 * 4 + 0];
            let a01 = _a.Data[0 * 4 + 1];
            let a02 = _a.Data[0 * 4 + 2];
            let a03 = _a.Data[0 * 4 + 3];
            let a10 = _a.Data[1 * 4 + 0];
            let a11 = _a.Data[1 * 4 + 1];
            let a12 = _a.Data[1 * 4 + 2];
            let a13 = _a.Data[1 * 4 + 3];
            let a20 = _a.Data[2 * 4 + 0];
            let a21 = _a.Data[2 * 4 + 1];
            let a22 = _a.Data[2 * 4 + 2];
            let a23 = _a.Data[2 * 4 + 3];
            let a30 = _a.Data[3 * 4 + 0];
            let a31 = _a.Data[3 * 4 + 1];
            let a32 = _a.Data[3 * 4 + 2];
            let a33 = _a.Data[3 * 4 + 3];
            let b00 = _b.Data[0 * 4 + 0];
            let b01 = _b.Data[0 * 4 + 1];
            let b02 = _b.Data[0 * 4 + 2];
            let b03 = _b.Data[0 * 4 + 3];
            let b10 = _b.Data[1 * 4 + 0];
            let b11 = _b.Data[1 * 4 + 1];
            let b12 = _b.Data[1 * 4 + 2];
            let b13 = _b.Data[1 * 4 + 3];
            let b20 = _b.Data[2 * 4 + 0];
            let b21 = _b.Data[2 * 4 + 1];
            let b22 = _b.Data[2 * 4 + 2];
            let b23 = _b.Data[2 * 4 + 3];
            let b30 = _b.Data[3 * 4 + 0];
            let b31 = _b.Data[3 * 4 + 1];
            let b32 = _b.Data[3 * 4 + 2];
            let b33 = _b.Data[3 * 4 + 3];
            matrix.data = new Float32Array([
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
                b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
            ]);
            return matrix;
        }
        /**
         * Computes and returns the inverse of a passed matrix.
         * @param _matrix Tha matrix to compute the inverse of.
         */
        static inverse(_matrix) {
            let m00 = _matrix.Data[0 * 4 + 0];
            let m01 = _matrix.Data[0 * 4 + 1];
            let m02 = _matrix.Data[0 * 4 + 2];
            let m03 = _matrix.Data[0 * 4 + 3];
            let m10 = _matrix.Data[1 * 4 + 0];
            let m11 = _matrix.Data[1 * 4 + 1];
            let m12 = _matrix.Data[1 * 4 + 2];
            let m13 = _matrix.Data[1 * 4 + 3];
            let m20 = _matrix.Data[2 * 4 + 0];
            let m21 = _matrix.Data[2 * 4 + 1];
            let m22 = _matrix.Data[2 * 4 + 2];
            let m23 = _matrix.Data[2 * 4 + 3];
            let m30 = _matrix.Data[3 * 4 + 0];
            let m31 = _matrix.Data[3 * 4 + 1];
            let m32 = _matrix.Data[3 * 4 + 2];
            let m33 = _matrix.Data[3 * 4 + 3];
            let tmp_0 = m22 * m33;
            let tmp_1 = m32 * m23;
            let tmp_2 = m12 * m33;
            let tmp_3 = m32 * m13;
            let tmp_4 = m12 * m23;
            let tmp_5 = m22 * m13;
            let tmp_6 = m02 * m33;
            let tmp_7 = m32 * m03;
            let tmp_8 = m02 * m23;
            let tmp_9 = m22 * m03;
            let tmp_10 = m02 * m13;
            let tmp_11 = m12 * m03;
            let tmp_12 = m20 * m31;
            let tmp_13 = m30 * m21;
            let tmp_14 = m10 * m31;
            let tmp_15 = m30 * m11;
            let tmp_16 = m10 * m21;
            let tmp_17 = m20 * m11;
            let tmp_18 = m00 * m31;
            let tmp_19 = m30 * m01;
            let tmp_20 = m00 * m21;
            let tmp_21 = m20 * m01;
            let tmp_22 = m00 * m11;
            let tmp_23 = m10 * m01;
            let t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
                (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
            let t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
                (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
            let t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
                (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
            let t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
                (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);
            let d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
            let matrix = new Mat4;
            matrix.data = new Float32Array([
                d * t0,
                d * t1,
                d * t2,
                d * t3,
                d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) - (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
                d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) - (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
                d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) - (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
                d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) - (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
                d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) - (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
                d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) - (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
                d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) - (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
                d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) - (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
                d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) - (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
                d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) - (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
                d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) - (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
                d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) - (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02)),
            ]);
            return matrix;
        }
        /**
         * Computes and returns a rotationmatrix that aligns a transformations z-axis with the vector between it and its target.
         * @param _transformPosition The x,y and z-coordinates of the object to rotate.
         * @param _targetPosition The position to look at.
         */
        static lookAt(_transformPosition, _targetPosition) {
            let matrix = new Mat4;
            let transformPosition = new WebEngine.Vec3(_transformPosition.X, _transformPosition.Y, _transformPosition.Z);
            let targetPosition = new WebEngine.Vec3(_targetPosition.X, _targetPosition.Y, _targetPosition.Z);
            let zAxis = WebEngine.Vec3.subtract(transformPosition, targetPosition);
            zAxis = WebEngine.Vec3.normalize(zAxis);
            let xAxis;
            let yAxis;
            if (zAxis.Data != WebEngine.Vec3.Up.Data) {
                xAxis = WebEngine.Vec3.normalize(WebEngine.Vec3.cross(WebEngine.Vec3.Up, zAxis));
                yAxis = WebEngine.Vec3.normalize(WebEngine.Vec3.cross(zAxis, xAxis));
            }
            else {
                xAxis = WebEngine.Vec3.normalize(WebEngine.Vec3.subtract(transformPosition, targetPosition));
                yAxis = WebEngine.Vec3.normalize(WebEngine.Vec3.cross(WebEngine.Vec3.Forward, xAxis));
                zAxis = WebEngine.Vec3.normalize(WebEngine.Vec3.cross(xAxis, yAxis));
            }
            matrix.data = new Float32Array([
                xAxis.X, xAxis.Y, xAxis.Z, 0,
                yAxis.X, yAxis.Y, yAxis.Z, 0,
                zAxis.X, zAxis.Y, zAxis.Z, 0,
                transformPosition.X,
                transformPosition.Y,
                transformPosition.Z,
                1,
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
        static perspective(_aspect, _fieldOfViewInDegrees, _near, _far) {
            let fieldOfViewInRadians = _fieldOfViewInDegrees * Math.PI / 180;
            let f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
            let rangeInv = 1.0 / (_near - _far);
            let matrix = new Mat4;
            matrix.data = new Float32Array([
                f / _aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (_near + _far) * rangeInv, -1,
                0, 0, _near * _far * rangeInv * 2, 0,
            ]);
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
        static orthographic(_left, _right, _bottom, _top, _near = -400, _far = 400) {
            let matrix = new Mat4;
            matrix.data = new Float32Array([
                2 / (_right - _left), 0, 0, 0,
                0, 2 / (_top - _bottom), 0, 0,
                0, 0, 2 / (_near - _far), 0,
                (_left + _right) / (_left - _right),
                (_bottom + _top) / (_bottom - _top),
                (_near + _far) / (_near - _far),
                1,
            ]);
            return matrix;
        }
    } // End class.
    WebEngine.Mat4 = Mat4;
})(WebEngine || (WebEngine = {})); // End namespace.
//# sourceMappingURL=Mat4.js.map