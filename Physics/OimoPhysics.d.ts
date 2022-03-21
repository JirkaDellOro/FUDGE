//Edited for common javascript instead of modules Author: Marko Fehrenbach, HFU 2020

declare namespace OIMO {
    export class Quat {/**
		* Creates a new quaternion. The quaternion is identity by default.
		*/
        constructor(x?: number, y?: number, z?: number, w?: number);
        /**
         * The x-value of the imaginary part of the quaternion.
         */
        x: number;
        /**
         * The y-value of the imaginary part of the quaternion.
         */
        y: number;
        /**
         * The z-value of the imaginary part of the quaternion.
         */
        z: number;
        /**
         * The real part of the quaternion.
         */
        w: number;
        /**
         * Sets the quaternion to identity quaternion and returns `this`.
         */
        identity(): Quat;
        /**
         * Sets all values at once and returns `this`.
         */
        init(x: number, y: number, z: number, w: number): Quat;
        /**
         * Returns `this` + `v`.
         */
        add(q: Quat): Quat;
        /**
         * Returns `this` - `v`.
         */
        sub(q: Quat): Quat;
        /**
         * Returns `this` * `s`.
         */
        scale(s: number): Quat;
        /**
         * Sets this quaternion to `this` + `v` and returns `this`.
         */
        addEq(q: Quat): Quat;
        /**
         * Sets this quaternion to `this` - `v` and returns `this`.
         */
        subEq(q: Quat): Quat;
        /**
         * Sets this quaternion to `this` * `s` and returns `this`.
         */
        scaleEq(s: number): Quat;
        /**
         * Returns the length of the quaternion.
         */
        length(): number;
        /**
         * Returns the squared length of the quaternion.
         */
        lengthSq(): number;
        /**
         * Returns the dot product of `this` and `q`.
         */
        dot(q: Quat): number;
        /**
         * Returns the normalized quaternion.
         *
         * If the length is zero, zero quaterinon is returned.
         */
        normalized(): Quat;
        /**
         * Sets this quaternion to the normalized quaternion and returns `this`.
         *
         * If the length is zero, this quaternion is set to zero quaternion.
         */
        normalize(): Quat;
        /**
         * Sets this quaternion to the quaternion representing the shortest arc
         * rotation from `v1` to `v2`, and return `this`.
         */
        setArc(v1: Vec3, v2: Vec3): Quat;
        /**
         * Returns the spherical linear interpolation between two quaternions `this` and `q` with interpolation paraeter `t`.
         * Both quaternions `this` and `q` must be normalized.
         */
        slerp(q: Quat, t: number): Quat;
        /**
         * Copies values from `q` and returns `this`.
         */
        copyFrom(q: Quat): Quat;
        /**
         * Returns a clone of the quaternion.
         */
        clone(): Quat;
        /**
         * Sets this quaternion to the representation of the matrix `m`, and returns `this`.
         *
         * The matrix `m` must be a rotation matrix, that is, must be orthogonalized and have determinant 1.
         */
        fromMat3(m: Mat3): Quat;
        /**
         * Returns a rotation matrix which represents this quaternion.
         */
        toMat3(): Mat3;
        /**
         * Returns the string representation of the quaternion.
         */
        toString(): string;
        /**
         * The number of instance creation.
         */
        static numCreations: number;
    }

    /**
 * 3x3 Matrix class.
 *
 * Note that columns and rows are 0-indexed.
 */
    export class Mat3 {
        /**
         * Creates a new matrix. The matrix is identity by default.
         */
        constructor(e00?: number, e01?: number, e02?: number, e10?: number, e11?: number, e12?: number, e20?: number, e21?: number, e22?: number);
        /**
         * The element at row 0 column 0.
         */
        e00: number;
        /**
         * The element at row 0 column 1.
         */
        e01: number;
        /**
         * The element at row 0 column 2.
         */
        e02: number;
        /**
         * The element at row 1 column 0.
         */
        e10: number;
        /**
         * The element at row 1 column 1.
         */
        e11: number;
        /**
         * The element at row 1 column 2.
         */
        e12: number;
        /**
         * The element at row 2 column 0.
         */
        e20: number;
        /**
         * The element at row 2 column 1.
         */
        e21: number;
        /**
         * The element at row 2 column 2.
         */
        e22: number;
        /**
         * Sets all elements at once and returns `this`.
         */
        init(e00: number, e01: number, e02: number, e10: number, e11: number, e12: number, e20: number, e21: number, e22: number): Mat3;
        /**
         * Sets this matrix to identity matrix and returns `this`.
         */
        identity(): Mat3;
        /**
         * Returns `this` + `m`
         */
        add(m: Mat3): Mat3;
        /**
         * Returns `this` - `m`
         */
        sub(m: Mat3): Mat3;
        /**
         * Returns `this` * `s`
         */
        scale(s: number): Mat3;
        /**
         * Returns `this` * `m`
         */
        mul(m: Mat3): Mat3;
        /**
         * Sets this matrix to `this` + `m` and returns `this`.
         */
        addEq(m: Mat3): Mat3;
        /**
         * Sets this matrix to `this` - `m` and returns `this`.
         */
        subEq(m: Mat3): Mat3;
        /**
         * Sets this matrix to `this` * `s` and returns `this`.
         */
        scaleEq(s: number): Mat3;
        /**
         * Sets this matrix to `this` * `m` and returns `this`.
         */
        mulEq(m: Mat3): Mat3;
        /**
         * Returns *scaling matrix* * `this`.
         *
         * Where *scaling matrix* is a matrix which scales `sx` times, `sy` times and
         * `sz` times along the x-axis, y-axis and z-axis respectively.
         */
        prependScale(sx: number, sy: number, sz: number): Mat3;
        /**
         * Returns `this` * *scaling matrix*.
         *
         * Where *scaling matrix* is a matrix which scales `sx` times, `sy` times and
         * `sz` times along the x-axis, y-axis and z-axis respectively.
         */
        appendScale(sx: number, sy: number, sz: number): Mat3;
        /**
         * Returns *rotation matrix* * `this`.
         *
         * Where *rotation matrix* is a matrix which rotates `rad` in radians around the **normalized**
         * vector (`axisX`, `axisY`, `axisZ`).
         */
        prependRotation(rad: number, axisX: number, axisY: number, axisZ: number): Mat3;
        /**
         * Returns `this` * *rotation matrix*.
         *
         * Where *rotation matrix* is a matrix which rotates `rad` in radians around the **normalized**
         * vector (`axisX`, `axisY`, `axisZ`).
         */
        appendRotation(rad: number, axisX: number, axisY: number, axisZ: number): Mat3;
        /**
         * Sets this matrix to *scaling matrix* * `this`, and returns `this`.
         *
         * Where *scaling matrix* is a matrix which scales `sx` times, `sy` times and
         * `sz` times along the x-axis, y-axis and z-axis respectively.
         */
        prependScaleEq(sx: number, sy: number, sz: number): Mat3;
        /**
         * Sets this matrix to `this` * *scaling matrix*, and returns `this`.
         *
         * Where *scaling matrix* is a matrix which scales `sx` times, `sy` times and
         * `sz` times along the x-axis, y-axis and z-axis respectively.
         */
        appendScaleEq(sx: number, sy: number, sz: number): Mat3;
        /**
         * Sets this matrix to *rotation matrix* * `this`, and returns `this`.
         *
         * Where *rotation matrix* is a matrix which rotates `rad` in radians around the **normalized**
         * vector (`axisX`, `axisY`, `axisZ`).
         */
        prependRotationEq(rad: number, axisX: number, axisY: number, axisZ: number): Mat3;
        /**
         * Sets this matrix to `this` * *rotation matrix*, and returns `this`.
         *
         * Where *rotation matrix* is a matrix which rotates `rad` in radians around the **normalized**
         * vector (`axisX`, `axisY`, `axisZ`).
         */
        appendRotationEq(rad: number, axisX: number, axisY: number, axisZ: number): Mat3;
        /**
         * Returns the transposed matrix.
         */
        transpose(): Mat3;
        /**
         * Sets this matrix to the transposed matrix and returns `this`.
         */
        transposeEq(): Mat3;
        /**
         * Returns the determinant.
         */
        determinant(): number;
        /**
         * Returns the trace.
         */
        trace(): number;
        /**
         * Returns the inverse matrix.
         *
         * If the determinant is zero, zero matrix is returned.
         */
        inverse(): Mat3;
        /**
         * Sets this matrix to the inverse matrix and returns `this`.
         *
         * If the determinant is zero, this matrix is set to zero matrix.
         */
        inverseEq(): Mat3;
        /**
         * Returns an array of the elements of this matrix.
         *
         * If `columnMajor` is true, the array is arranged in column-major order.
         * Otherwise, the array is arranged in row-major order.
         */
        toArray(columnMajor?: boolean): number[];
        /**
         * Copies values from `m` and returns `this`.
         */
        copyFrom(m: Mat3): Mat3;
        /**
         * Returns a clone of the matrix.
         */
        clone(): Mat3;
        /**
         * Sets this matrix to the representation of the quaternion `q`, and returns `this`.
         */
        fromQuat(q: Quat): Mat3;
        /**
         * Returns a quaternion which represents this matrix.
         *
         * This matrix must be a rotation matrix, that is, must be orthogonalized and have determinant 1.
         */
        toQuat(): Quat;
        /**
         * Sets this matrix to the rotation matrix represented by Euler angles `eulerAngles`, and returns `this`.
         * Rotation order is first X-axis, then rotated Y-axis, finally rotated Z-axis.
         */
        fromEulerXyz(eulerAngles: Vec3): Mat3;
        /**
         * Returns a vector `(angleX, angleY, angleZ)` represents the Euler angles of this matrix.
         * Rotation order is first X-axis, then rotated Y-axis, finally rotated Z-axis.
         * Note that `angleX`, `angleY`, and `angleZ` are in range of -PI to PI, -PI/2 to PI/2, and -PI to PI respectively.
         */
        toEulerXyz(): Vec3;
        /**
         * Returns the `index`th row vector of the matrix.
         *
         * If `index` is less than `0` or greater than `2`, `null` will be returned.
         */
        getRow(index: number): Vec3;
        /**
         * Returns the `index`th column vector of the matrix.
         *
         * If `index` is less than `0` or greater than `2`, `null` will be returned.
         */
        getCol(index: number): Vec3;
        /**
         * Sets `dst` to the `index`th row vector of the matrix.
         *
         * If `index` is less than `0` or greater than `2`, `dst` will be set to the zero vector.
         */
        getRowTo(index: number, dst: Vec3): void;
        /**
         * Sets `dst` to the `index`th column vector of the matrix.
         *
         * If `index` is less than `0` or greater than `2`, `dst` will be set to the zero vector.
         */
        getColTo(index: number, dst: Vec3): void;
        /**
         * Sets this matrix by row vectors and returns `this`.
         */
        fromRows(row0: Vec3, row1: Vec3, row2: Vec3): Mat3;
        /**
         * Sets this matrix by column vectors and returns `this`.
         */
        fromCols(col0: Vec3, col1: Vec3, col2: Vec3): Mat3;
        /**
         * Returns the string representation of the matrix.
         */
        toString(): string;
        /**
         * The number of instance creation.
         */
        static numCreations: number;
    }

    /**
 * Transform class provides a set of translation and rotation.
 */
    export class Transform {
        /**
         * Creates a new identical transform.
         */
        constructor();
        _positionX: number;
        _positionY: number;
        _positionZ: number;
        _rotation00: number;
        _rotation01: number;
        _rotation02: number;
        _rotation10: number;
        _rotation11: number;
        _rotation12: number;
        _rotation20: number;
        _rotation21: number;
        _rotation22: number;
        /**
         * Sets the transformation to identity and returns `this`.
         */
        identity(): Transform;
        /**
         * Returns the position of the transformation.
         */
        getPosition(): Vec3;
        /**
         * Sets `position` to the position of the transformation.
         *
         * This does not create a new instance of `Vec3`.
         */
        getPositionTo(position: Vec3): void;
        /**
         * Sets the position of the transformation to `position` and returns `this`.
         */
        setPosition(position: Vec3): Transform;
        /**
         * Translates the position by `translation`.
         */
        translate(translation: Vec3): void;
        /**
         * Returns the rotation matrix.
         */
        getRotation(): Mat3;
        /**
         * Sets `out` to the rotation matrix.
         *
         * This does not create a new instance of `Mat3`.
         */
        getRotationTo(out: Mat3): void;
        /**
         * Sets the rotation matrix to `rotation` and returns `this`.
         */
        setRotation(rotation: Mat3): Transform;
        /**
         * Sets the rotation by Euler angles `eulerAngles` in radians.
         */
        setRotationXyz(eulerAngles: Vec3): void;
        /**
         * Applies rotation by the rotation matrix `rotation`.
         */
        rotate(rotation: Mat3): void;
        /**
         * Applies the rotation by Euler angles `eulerAngles` in radians.
         */
        rotateXyz(eulerAngles: Vec3): void;
        /**
         * Returns the rotation as a quaternion.
         */
        getOrientation(): Quat;
        /**
         * Sets `orientation` to the quaternion representing the rotation.
         *
         * This does not create a new instance of `Quat`.
         */
        getOrientationTo(orientation: Quat): void;
        /**
         * Sets the rotation from a quaternion `quaternion` and returns `this`.
         */
        setOrientation(quaternion: Quat): Transform;
        /**
         * Returns a clone of the transformation.
         */
        clone(): Transform;
        /**
         * Sets the transformation to `transform` and returns `this`.
         */
        copyFrom(transform: Transform): Transform;
    }

    /**
     * 4x4 Matrix class.
     *
     * Note that columns and rows are 0-indexed.
     */
    export class Mat4 {
        /**
         * Creates a new matrix. The matrix is identity by default.
         */
        constructor(e00?: number, e01?: number, e02?: number, e03?: number, e10?: number, e11?: number, e12?: number, e13?: number, e20?: number, e21?: number, e22?: number, e23?: number, e30?: number, e31?: number, e32?: number, e33?: number);
        /**
         * The element at row 0 column 0.
         */
        e00: number;
        /**
         * The element at row 0 column 1.
         */
        e01: number;
        /**
         * The element at row 0 column 2.
         */
        e02: number;
        /**
         * The element at row 0 column 3.
         */
        e03: number;
        /**
         * The element at row 1 column 0.
         */
        e10: number;
        /**
         * The element at row 1 column 1.
         */
        e11: number;
        /**
         * The element at row 1 column 2.
         */
        e12: number;
        /**
         * The element at row 1 column 3.
         */
        e13: number;
        /**
         * The element at row 2 column 0.
         */
        e20: number;
        /**
         * The element at row 2 column 1.
         */
        e21: number;
        /**
         * The element at row 2 column 2.
         */
        e22: number;
        /**
         * The element at row 2 column 3.
         */
        e23: number;
        /**
         * The element at row 3 column 0.
         */
        e30: number;
        /**
         * The element at row 3 column 1.
         */
        e31: number;
        /**
         * The element at row 3 column 2.
         */
        e32: number;
        /**
         * The element at row 3 column 3.
         */
        e33: number;
        /**
         * Sets all elements at once and returns `this`.
         */
        init(e00: number, e01: number, e02: number, e03: number, e10: number, e11: number, e12: number, e13: number, e20: number, e21: number, e22: number, e23: number, e30: number, e31: number, e32: number, e33: number): Mat4;
        /**
         * Sets this matrix to identity matrix and returns `this`.
         */
        identity(): Mat4;
        /**
         * Returns `this` + `m`
         */
        add(m: Mat4): Mat4;
        /**
         * Returns `this` - `m`
         */
        sub(m: Mat4): Mat4;
        /**
         * Returns `this` * `s`
         */
        scale(s: number): Mat4;
        /**
         * Returns `this` * `m`
         */
        mul(m: Mat4): Mat4;
        /**
         * Sets this matrix to `this` + `m` and returns `this`.
         */
        addEq(m: Mat4): Mat4;
        /**
         * Sets this matrix to `this` - `m` and returns `this`.
         */
        subEq(m: Mat4): Mat4;
        /**
         * Sets this matrix to `this` * `s` and returns `this`.
         */
        scaleEq(s: number): Mat4;
        /**
         * Sets this matrix to `this` * `m` and returns `this`.
         */
        mulEq(m: Mat4): Mat4;
        /**
         * Returns *scaling matrix* * `this`.
         *
         * Where *scaling matrix* is a matrix which scales `sx` times, `sy` times and
         * `sz` times along the x-axis, y-axis and z-axis respectively.
         */
        prependScale(sx: number, sy: number, sz: number): Mat4;
        /**
         * Returns `this` * *scaling matrix*.
         *
         * Where *scaling matrix* is a matrix which scales `sx` times, `sy` times and
         * `sz` times along the x-axis, y-axis and z-axis respectively.
         */
        appendScale(sx: number, sy: number, sz: number): Mat4;
        /**
         * Returns *rotation matrix* * `this`.
         *
         * Where *rotation matrix* is a matrix which rotates `rad` in radians around the **normalized**
         * vector (`axisX`, `axisY`, `axisZ`).
         */
        prependRotation(rad: number, axisX: number, axisY: number, axisZ: number): Mat4;
        /**
         * Returns `this` * *rotation matrix*.
         *
         * Where *rotation matrix* is a matrix which rotates `rad` in radians around the **normalized**
         * vector (`axisX`, `axisY`, `axisZ`).
         */
        appendRotation(rad: number, axisX: number, axisY: number, axisZ: number): Mat4;
        /**
         * Returns *translation matrix* * `this`.
         *
         * Where *translation matrix* is a matrix which translates `sx`, `sy` and `sz` along
         * the x-axis, y-axis and z-axis respectively.
         */
        prependTranslation(tx: number, ty: number, tz: number): Mat4;
        /**
         * Returns `this` * *translation matrix*.
         *
         * Where *translation matrix* is a matrix which translates `sx`, `sy` and `sz` along
         * the x-axis, y-axis and z-axis respectively.
         */
        appendTranslation(tx: number, ty: number, tz: number): Mat4;
        /**
         * Sets this matrix to *scaling matrix* * `this`, and returns `this`.
         *
         * Where *scaling matrix* is a matrix which scales `sx` times, `sy` times and
         * `sz` times along the x-axis, y-axis and z-axis respectively.
         */
        prependScaleEq(sx: number, sy: number, sz: number): Mat4;
        /**
         * Sets this matrix to `this` * *scaling matrix*, and returns `this`.
         *
         * Where *scaling matrix* is a matrix which scales `sx` times, `sy` times and
         * `sz` times along the x-axis, y-axis and z-axis respectively.
         */
        appendScaleEq(sx: number, sy: number, sz: number): Mat4;
        /**
         * Sets this matrix to *rotation matrix* * `this`, and returns `this`.
         *
         * Where *rotation matrix* is a matrix which rotates `rad` in radians around the **normalized**
         * vector (`axisX`, `axisY`, `axisZ`).
         */
        prependRotationEq(rad: number, axisX: number, axisY: number, axisZ: number): Mat4;
        /**
         * Sets this matrix to `this` * *rotation matrix*, and returns `this`.
         *
         * Where *rotation matrix* is a matrix which rotates `rad` in radians around the **normalized**
         * vector (`axisX`, `axisY`, `axisZ`).
         */
        appendRotationEq(rad: number, axisX: number, axisY: number, axisZ: number): Mat4;
        /**
         * Sets this matrix to *translation matrix* * `this`, and returns `this`.
         *
         * Where *translation matrix* is a matrix which translates `sx`, `sy` and `sz` along
         * the x-axis, y-axis and z-axis respectively.
         */
        prependTranslationEq(tx: number, ty: number, tz: number): Mat4;
        /**
         * Sets this matrix to `this` * *translation matrix*, and returns `this`.
         *
         * Where *translation matrix* is a matrix which translates `sx`, `sy` and `sz` along
         * the x-axis, y-axis and z-axis respectively.
         */
        appendTranslationEq(tx: number, ty: number, tz: number): Mat4;
        /**
         * Returns the transposed matrix.
         */
        transpose(): Mat4;
        /**
         * Sets this matrix to the transposed matrix and returns `this`.
         */
        transposeEq(): Mat4;
        /**
         * Returns the determinant.
         */
        determinant(): number;
        /**
         * Returns the trace.
         */
        trace(): number;
        /**
         * Returns the inverse matrix.
         *
         * If the determinant is zero, zero matrix is returned.
         */
        inverse(): Mat4;
        /**
         * Sets this matrix to the inverse matrix and returns `this`.
         *
         * If the determinant is zero, this matrix is set to zero matrix.
         */
        inverseEq(): Mat4;
        /**
         * Sets this matrix to *view matrix* and returns `this`.
         *
         * Where *view matrix* is a matrix which represents the viewing transformation with
         * eyes at (`eyeX`, `eyeY`, `eyeZ`), fixation point at (`atX`, `atY`, `atZ`), and
         * up vector (`upX`, `upY`, `upZ`).
         */
        lookAt(eyeX: number, eyeY: number, eyeZ: number, atX: number, atY: number, atZ: number, upX: number, upY: number, upZ: number): Mat4;
        /**
         * Sets this matrix to *perspecive projection matrix* and returns `this`.
         *
         * Where *perspecive projection matrix* is a matrix which represents the perspective
         * projection transformation with field of view in the y direction `fovY` in radians,
         * aspect ratio `aspect`, and z-value of near and far clipping plane `near`, `far`.
         */
        perspective(fovY: number, aspect: number, near: number, far: number): Mat4;
        /**
         * Sets this matrix to *orthogonal projection matrix* and returns `this`.
         *
         * Where *orthogonal projection matrix* is a matrix which represents the orthogonal
         * projection transformation with screen width and height `width`, `height`, and
         * z-value of near and far clipping plane `near`, `far`.
         */
        ortho(width: number, height: number, near: number, far: number): Mat4;
        /**
         * Returns an array of the elements of this matrix.
         *
         * If `columnMajor` is true, the array is arranged in column-major order.
         * Otherwise, the array is arranged in row-major order.
         */
        toArray(columnMajor?: boolean): number[];
        /**
         * Copies values from `m` and returns `this`.
         */
        copyFrom(m: Mat4): Mat4;
        /**
         * Sets this matrix to the extension of `m` and returns `this`.
         *
         * `this.e33` is set to `1` and other components don't exist in `m` are set to `0`.
         */
        fromMat3(m: Mat3): Mat4;
        /**
         * Sets this matrix to the representation of `transform` and returns `this`.
         */
        fromTransform(transform: Transform): Mat4;
        /**
         * Returns a clone of the matrix.
         */
        clone(): Mat4;
        /**
         * Returns the string representation of the matrix.
         */
        toString(): string;
        /**
         * The number of instance creation.
         */
        static numCreations: number;
    }

    /**
     * 3D vector class.
     */
    export class Vec3 {
        /**
         * Creates a new vector. The vector is zero vector by default.
         */
        constructor(x?: number, y?: number, z?: number);
        /**
         * The x-value of the vector.
         */
        x: number;
        /**
         * The y-value of the vector.
         */
        y: number;
        /**
         * The z-value of the vector.
         */
        z: number;
        /**
         * Sets all values at once and returns `this`.
         */
        init(x: number, y: number, z: number): Vec3;
        /**
         * Sets this vector to zero vector and returns `this`.
         */
        zero(): Vec3;
        /**
         * Returns `this` + `v`.
         */
        add(v: Vec3): Vec3;
        /**
         * Returns (`this.x` + `vx`, `this.y` + `vy`, `this.z` + `vz`).
         */
        add3(vx: number, vy: number, vz: number): Vec3;
        /**
         * Returns `this` + `v` * `s`.
         */
        addScaled(v: Vec3, s: number): Vec3;
        /**
         * Returns `this` - `v`.
         */
        sub(v: Vec3): Vec3;
        /**
         * Returns (`this.x` - `vx`, `this.y` - `vy`, `this.z` - `vz`).
         */
        sub3(vx: number, vy: number, vz: number): Vec3;
        /**
         * Returns `this` * `s`.
         */
        scale(s: number): Vec3;
        /**
         * Returns (`this.x` * `sx`, `this.y` * `sy`, `this.z` * `sz`).
         */
        scale3(sx: number, sy: number, sz: number): Vec3;
        /**
         * Returns the dot product of `this` and `v`.
         */
        dot(v: Vec3): number;
        /**
         * Returns the cross product of `this` and `v`.
         */
        cross(v: Vec3): Vec3;
        /**
         * Sets this vector to `this` + `v` and returns `this`.
         */
        addEq(v: Vec3): Vec3;
        /**
         * Sets this vector to (`this.x` + `vx`, `this.y` + `vy`, `this.z` + `vz`) and returns `this`.
         */
        add3Eq(vx: number, vy: number, vz: number): Vec3;
        /**
         * Sets this vector to `this` + `v` * `s` and returns `this`.
         */
        addScaledEq(v: Vec3, s: number): Vec3;
        /**
         * Sets this vector to `this` - `v` and returns `this`.
         */
        subEq(v: Vec3): Vec3;
        /**
         * Sets this vector to (`this.x` - `vx`, `this.y` - `vy`, `this.z` - `vz`) and returns `this`.
         */
        sub3Eq(vx: number, vy: number, vz: number): Vec3;
        /**
         * Sets this vector to `this` * `s` and returns `this`.
         */
        scaleEq(s: number): Vec3;
        /**
         * Sets this vector to (`this.x` * `sx`, `this.y` * `sy`, `this.z` * `sz`) and returns `this`.
         */
        scale3Eq(sx: number, sy: number, sz: number): Vec3;
        /**
         * Sets this vector to the cross product of `this` and `s`, and returns `this`.
         */
        crossEq(v: Vec3): Vec3;
        /**
         * Returns the transformed vector by `m`.
         */
        mulMat3(m: Mat3): Vec3;
        /**
         * Returns the transformed vector by `m`.
         */
        mulMat4(m: Mat4): Vec3;
        /**
         * Returns the transformed vector by `tf`.
         */
        mulTransform(tf: Transform): Vec3;
        /**
         * Sets this vector to the transformed vector by `m` and returns `this`.
         */
        mulMat3Eq(m: Mat3): Vec3;
        /**
         * Sets this vector to the transformed vector by `m` and returns `this`.
         */
        mulMat4Eq(m: Mat4): Vec3;
        /**
         * Sets this vector to the transformed vector by `tf` and returns `this`.
         */
        mulTransformEq(tf: Transform): Vec3;
        /**
         * Returns the length of the vector.
         */
        length(): number;
        /**
         * Returns the squared length of the vector.
         */
        lengthSq(): number;
        /**
         * Returns the normalized vector.
         *
         * If the length is zero, zero vector is returned.
         */
        normalized(): Vec3;
        /**
         * Normalize this vector and returns `this`.
         *
         * If the length is zero, this vector is set to zero vector.
         */
        normalize(): Vec3;
        /**
         * Returns the nagated vector.
         */
        negate(): Vec3;
        /**
         * Negate the vector and returns `this`.
         */
        negateEq(): Vec3;
        /**
         * Copies values from `v` and returns `this`.
         */
        copyFrom(v: Vec3): Vec3;
        /**
         * Returns a clone of the vector.
         */
        clone(): Vec3;
        /**
         * Returns the string representation of the vector.
         */
        toString(): string;
        /**
         * The number of instance creation.
         */
        static numCreations: number;
    }

    /**
     * Style settings of the debug draw.
     */
    export class DebugDrawStyle {
        /**
         * Default constructor.
         */
        constructor();
        shapeColor1: Vec3;
        shapeColor2: Vec3;
        sleepyShapeColor1: Vec3;
        sleepyShapeColor2: Vec3;
        sleepingShapeColor1: Vec3;
        sleepingShapeColor2: Vec3;
        staticShapeColor: Vec3;
        kinematicShapeColor: Vec3;
        aabbColor: Vec3;
        bvhNodeColor: Vec3;
        pairColor: Vec3;
        contactColor: Vec3;
        contactColor2: Vec3;
        contactColor3: Vec3;
        contactColor4: Vec3;
        newContactColor: Vec3;
        disabledContactColor: Vec3;
        contactNormalColor: Vec3;
        contactTangentColor: Vec3;
        contactBinormalColor: Vec3;
        contactNormalLength: number;
        contactTangentLength: number;
        contactBinormalLength: number;
        jointLineColor: Vec3;
        jointErrorColor: Vec3;
        jointRotationalConstraintRadius: number;
        basisLength: number;
        basisColorX: Vec3;
        basisColorY: Vec3;
        basisColorZ: Vec3;
    }

    /**
 * The interface of debug drawer. This provides graphical information of a physics world
 * for debugging softwares. Users should override at least three methods `DebugDraw.point`,
 * `DebugDraw.triangle`, `DebugDraw.line`.
 */
    export class DebugDraw {
        /**
         * Default constructor.
         */
        constructor();
        /**
         * Whether the shapes are drawn in wireframe mode.
         */
        wireframe: boolean;
        /**
         * Whether to draw the shapes.
         */
        drawShapes: boolean;
        /**
         * Whether to draw the bounding volume hierarchy of the broad-phase collision
         * detection. If `BvhBroadPhase` is not used, nothing will be drawn regardless
         * of the value of this parameter.
         */
        drawBvh: boolean;
        /**
         * The minimum depth of the BVH to be drawn. If `DebugDrawer.drawBvh` is set to
         * `false`, the entire BVH will not be drawn.
         */
        drawBvhMinLevel: number;
        /**
         * The maximum depth of the BVH to be drawn. If `DebugDrawer.drawBvh` is set to
         * `false`, the entire BVH will not be drawn.
         */
        drawBvhMaxLevel: number;
        /**
         * Whether to draw the AABBs.
         */
        drawAabbs: boolean;
        /**
         * Whether to draw the bases of the rigid bodies.
         */
        drawBases: boolean;
        /**
         * Whether to draw the overlapping pairs of the AABBs.
         */
        drawPairs: boolean;
        /**
         * Whether to draw the contacts.
         */
        drawContacts: boolean;
        /**
         * Whether to draw the bases (normals, tangents, and binormals) of the contacts.
         */
        drawContactBases: boolean;
        /**
         * Whether to draw the joints.
         */
        drawJoints: boolean;
        /**
         * Whether to draw the limits of the joints.
         */
        drawJointLimits: boolean;
        /**
         * The rendering style of the debug draw.
         */
        style: DebugDrawStyle;
        /**
         * Draws an axis-aligned bounding box.
         *
         * `min` is the minimum point of the AABB.
         *
         * `max` is the maximum point of the AABB.
         *
         * `color` is the color of the AABB.
         */
        aabb(min: Vec3, max: Vec3, color: Vec3): void;
        /**
         * Draws the basis of a transform `transform`.
         *
         * `length` is the length of the lines to be drawn.
         *
         * `colorX` is the color of the x-axis of the basis.
         *
         * `colorY` is the color of the y-axis of the basis.
         *
         * `colorZ` is the color of the z-axis of the basis.
         */
        basis(transform: Transform, length: number, colorX: Vec3, colorY: Vec3, colorZ: Vec3): void;
        /**
         * Draws an ellipse.
         *
         * `center` is the center of the ellipse.
         *
         * `ex` is the normalized x-axis vector of the ellipse.
         *
         * `ey` is the normalized y-axis vector of the ellipse.
         *
         * `radiusX` is the radius along the x-axis of the ellipse.
         *
         * `radiusY` is the radius along the y-axis of the ellipse.
         *
         * `color` is the color of the ellipse.
         */
        ellipse(center: Vec3, ex: Vec3, ey: Vec3, radiusX: number, radiusY: number, color: Vec3): void;
        /**
         * Draws an arc.
         *
         * `center` is the center of the arc.
         *
         * `ex` is the normalized x-axis vector of the arc.
         *
         * `ey` is the normalized y-axis vector of the arc.
         *
         * `radiusX` is the radius along the x-axis of the arc.
         *
         * `radiusY` is the radius along the y-axis of the arc.
         *
         * `startAngle` is the start angle of the arc in radians.
         *
         * `endAngle` is the end angle of the arc in radians.
         *
         * `drawSector` is whether to draw line segments between start/end point and center point.
         *
         * `color` is the color of the arc.
         */
        arc(center: Vec3, ex: Vec3, ey: Vec3, radiusX: number, radiusY: number, startAngle: number, endAngle: number, drawSector: boolean, color: Vec3): void;
        /**
         * Draws a cone locally along to the y-axis. The center of the cone is in the middle of
         * the vertex and the center of the base circle.
         *
         * `tf` is the transformation of the cone.
         *
         * `radius` is the radius of the base circle of the cone.
         *
         * `halfHeight` is the half-height of the cone. The local position of the vertex of
         * the cone is `(0, halfHeight, 0)`.
         *
         * `color` is the color of the cone.
         */
        cone(tf: Transform, radius: number, halfHeight: number, color: Vec3): void;
        /**
         * Draws a cylinder locally along to the y-axis.
         *
         * `tf` is the transformation of the cylinder.
         *
         * `radius` is the radius of the cylinder.
         *
         * `halfHeight` is the half-height of the cylinder.
         *
         * `color` is the color of the cylinder.
         */
        cylinder(tf: Transform, radius: number, halfHeight: number, color: Vec3): void;
        /**
         * Draws a capsule locally along to the y-axis.
         *
         * `tf` is the transformation of the capsule.
         *
         * `radius` is the radius of the capsule.
         *
         * `halfHeight` is the half-height of the capsule.
         *
         * `color` is the color of the capsule.
         */
        capsule(tf: Transform, radius: number, halfHeight: number, color: Vec3): void;
        /**
         * Draws a sphere.
         *
         * `tf` is the transformation of the sphere.
         *
         * `radius` is the radius of the sphere.
         *
         * `color` is the color of the sphere.
         */
        sphere(tf: Transform, radius: number, color: Vec3): void;
        /**
         * Draws a box.
         *
         * `tf` is the transformation of the box.
         *
         * `halfExtents` is the half-extents of the box.
         *
         * `color` is the color of the box.
         */
        box(tf: Transform, halfExtents: Vec3, color: Vec3): void;
        /**
         * Draws a rectangle.
         *
         * `v1`, `v2`, `v3`, `v4` are the rectangle's vertices in CCW order.
         *
         * `n1`, `n2`, `n3`, `n4` are the normals of the rectangle's vertices in CCW order.
         *
         * `color` is the color of the rectangle.
         */
        rect(v1: Vec3, v2: Vec3, v3: Vec3, v4: Vec3, n1: Vec3, n2: Vec3, n3: Vec3, n4: Vec3, color: Vec3): void;
        /**
         * Draws a point at `v`.
         *
         * `color` is the color of the point.
         */
        point(v: Vec3, color: Vec3): void;
        /**
         * Draws a triangle.
         *
         * `v1`, `v2`, `v3` are the triangle's vertices in CCW order.
         *
         * `n1`, `n2`, `n3` are the normals of the triangle's vertices in CCW order.
         *
         * `color` is the color of the triangle.
         */
        triangle(v1: Vec3, v2: Vec3, v3: Vec3, n1: Vec3, n2: Vec3, n3: Vec3, color: Vec3): void;
        /**
         * Draws a line segment between `v1` and `v2`.
         *
         * `color` is the color of the line segment.
         */
        line(v1: Vec3, v2: Vec3, color: Vec3): void;
    }

    /**
 * The axis-aligned bounding box.
 */
    export class Aabb {
        /**
         * Creates an empty AABB. Minimum and maximum points are set to zero.
         */
        constructor();
        _minX: number;
        _minY: number;
        _minZ: number;
        _maxX: number;
        _maxY: number;
        _maxZ: number;
        /**
         * Sets the minimum and maximum point and returns `this`.
         *
         * Equivallent to `setMin(min).setMax(max)`.
         */
        init(min: Vec3, max: Vec3): Aabb;
        /**
         * Returns the minimum point of the axis-aligned bounding box.
         */
        getMin(): Vec3;
        /**
         * Sets the minimum point of the axis-aligned bounding box to `min`.
         *
         * This does not create a new instance of `Vec3`.
         */
        getMinTo(min: Vec3): void;
        /**
         * Sets the minimum point of the axis-aligned bounding box to `min` and returns `this`.
         */
        setMin(min: Vec3): Aabb;
        /**
         * Returns the maximum point of the axis-aligned bounding box.
         */
        getMax(): Vec3;
        /**
         * Sets the maximum point of the axis-aligned bounding box to `max`.
         *
         * This does not create a new instance of `Vec3`.
         */
        getMaxTo(max: Vec3): void;
        /**
         * Sets the maximum point of the axis-aligned bounding box to `max` and returns `this`.
         */
        setMax(max: Vec3): Aabb;
        /**
         * Returns the center of the AABB.
         */
        getCenter(): Vec3;
        /**
         * Sets `center` to the center of the AABB.
         *
         * This does not create a new instance of `Vec3`.
         */
        getCenterTo(center: Vec3): void;
        /**
         * Returns the half extents of the AABB.
         */
        getExtents(): Vec3;
        /**
         * Sets `halfExtents` to the half extents of the AABB.
         *
         * This does not create a new instance of `Vec3`.
         */
        getExtentsTo(halfExtents: Vec3): void;
        /**
         * Combines `other` into this AABB and returns `this`.
         */
        combine(other: Aabb): Aabb;
        /**
         * Returns the combined aabb of `this` and `other`.
         */
        combined(other: Aabb): Aabb;
        /**
         * Returns whether `this` and `other` intersect.
         */
        overlap(other: Aabb): boolean;
        /**
         * Returns the intersection of `this` and `other`.
         */
        getIntersection(other: Aabb): Aabb;
        /**
         * Sets `intersection` to the intersection of `this` and `other`.
         *
         * This does not create a new instance of `Aabb`.
         */
        getIntersectionTo(other: Aabb, intersection: Aabb): void;
        /**
         * Copies AABB from `aabb` to and returns `this`.
         */
        copyFrom(aabb: Aabb): Aabb;
        /**
         * Returns a clone of the AABB.
         */
        clone(): Aabb;
    }

    /**
     * A proxy is an object that can be added to a broad-phase collision detection algorithm.
     * Users of the collision part of the library can move an axis-aligned bounding box of
     * a proxy through `BroadPhase` class.
     */
    export class Proxy {
        constructor(userData: any, id: number);
        _prev: Proxy;
        _next: Proxy;
        _aabbMinX: number;
        _aabbMinY: number;
        _aabbMinZ: number;
        _aabbMaxX: number;
        _aabbMaxY: number;
        _aabbMaxZ: number;
        _id: number;
        /**
         * Extra field that users can use for their own purposes. **Do not modify this property if
         * you use the physics part of the library**, as the physics part of the library uses this property
         * for connecting proxies and shapes of rigid bodies.
         */
        userData: any;
        /**
         * Returns the unique id of the proxy.
         */
        getId(): number;
        /**
         * Returns the fat AABB of the proxy.
         */
        getFatAabb(): Aabb;
        /**
         * Sets `aabb` to the fat AABB of the proxy.
         *
         * This does not create a new instance of `Aabb`.
         */
        getFatAabbTo(aabb: Aabb): void;
    }

    /**
     * A pair between two proxies. Broad-phase collision algorithms collect pairs of proxies
     * as linked list of ProxyPair.
     */
    export class ProxyPair {
        constructor();
        _next: ProxyPair;
        _p1: Proxy;
        _p2: Proxy;
        /**
         * Returns the first proxy of the pair.
         */
        getProxy1(): Proxy;
        /**
         * Returns the second proxy of the pair.
         */
        getProxy2(): Proxy;
        /**
         * Returns the next pair.
         */
        getNext(): ProxyPair;
    }

    /**
 * A callback class for queries in a broad phase.
 */
    export class BroadPhaseProxyCallback {
        /**
         * Default constructor.
         */
        constructor();
        /**
         * This is called every time a broad phase algorithm reports a proxy `proxy`.
         */
        process(proxy: Proxy): void;
    }

    /**
 * A single ray cast hit data.
 */
    export class RayCastHit {
        /**
         * Default constructor.
         */
        constructor();
        /**
         * The position the ray hit at.
         */
        position: Vec3;
        /**
         * The normal vector of the surface the ray hit.
         */
        normal: Vec3;
        /**
         * The ratio of the position the ray hit from the start point to the end point.
         */
        fraction: number;
    }

    /**
     * Abstract class of the convex collision geometries supported by GJK/EPA collision detection.
     */
    export class ConvexGeometry extends Geometry {
        constructor(type: number);
        _gjkMargin: number;
        _useGjkRayCast: boolean;
        /**
         * Returns the GJK mergin around the "core" of the convex geometry.
         */
        getGjkMergin(): number;
        /**
         * Sets the GJK mergin around the "core" to `gjkMergin`.
         */
        setGjkMergin(gjkMergin: number): void;
        /**
         * Computes supporting vertex of the "core" of the geometry in local coordinates.
         * Note that the direction vector `dir` might not be normalized. `out` is set to
         * the computed supporting vertex.
         */
        computeLocalSupportingVertex(dir: Vec3, out: Vec3): void;
        rayCast(begin: Vec3, end: Vec3, transform: Transform, hit: RayCastHit): boolean;
    }

    /**
 * The abstract class of a broad-phase collision detection algorithm.
 */
    export class BroadPhase {
        constructor(type: number);
        _type: number;
        _numProxies: number;
        _proxyList: Proxy;
        _proxyListLast: Proxy;
        _proxyPairList: ProxyPair;
        _incremental: boolean;
        _testCount: number;
        /**
         * Returns a new proxy connected with the user data `userData` containing the axis-aligned
         * bounding box `aabb`, and adds the proxy into the collision space.
         */
        createProxy(userData: any, aabb: Aabb): Proxy;
        /**
         * Removes the proxy `proxy` from the collision space.
         */
        destroyProxy(proxy: Proxy): void;
        /**
         * Moves the proxy `proxy` to the axis-aligned bounding box `aabb`. `displacement` is the
         * difference between current and previous center of the AABB. This is used for predicting
         * movement of the proxy.
         */
        moveProxy(proxy: Proxy, aabb: Aabb, displacement: Vec3): void;
        /**
         * Returns whether the pair of `proxy1` and `proxy2` is overlapping. As proxies can be larger
         * than the containing AABBs, two proxies may overlap even though their inner AABBs are separate.
         */
        isOverlapping(proxy1: Proxy, proxy2: Proxy): boolean;
        /**
         * Collects overlapping pairs of the proxies and put them into a linked list. The linked list
         * can be get through `BroadPhase.getProxyPairList` method.
         *
         * Note that in order to collect pairs, the broad-phase algorithm requires to be informed of
         * movements of proxies through `BroadPhase.moveProxy` method.
         */
        collectPairs(): void;
        /**
         * Returns the linked list of collected pairs of proxies.
         */
        getProxyPairList(): ProxyPair;
        /**
         * Returns whether to collect only pairs created in the last step. If this returns
         * true, the pairs that are not collected might still be overlapping. Otherwise, such
         * pairs are guaranteed to be separated.
         */
        isIncremental(): boolean;
        /**
         * Returns the number of broad-phase AABB tests.
         */
        getTestCount(): number;
        /**
         * Performs a ray casting. `process` is called for all proxies the line segment
         * from `begin` to `end` intersects.
         */
        rayCast(begin: Vec3, end: Vec3, callback: BroadPhaseProxyCallback): void;
        /**
         * Performs a convex casting. `process` is called for all shapes the convex geometry
         * `convex` hits. The convex geometry translates by `translation` starting from the beginning
         * transform `begin`.
         */
        convexCast(convex: ConvexGeometry, begin: Transform, translation: Vec3, callback: BroadPhaseProxyCallback): void;
        /**
         * Performs an AABB query. `process` is called for all proxies that their AABB
         * and `aabb` intersect.
         */
        aabbTest(aabb: Aabb, callback: BroadPhaseProxyCallback): void;
    }

    /**
         * Abstract collision geometry.
         */
    export class Geometry {
        protected constructor(type: number);
        _type: number;
        _volume: number;
        _inertiaCoeff00: number;
        _inertiaCoeff01: number;
        _inertiaCoeff02: number;
        _inertiaCoeff10: number;
        _inertiaCoeff11: number;
        _inertiaCoeff12: number;
        _inertiaCoeff20: number;
        _inertiaCoeff21: number;
        _inertiaCoeff22: number;
        _updateMass(): void;
        _computeAabb(aabb: Aabb, tf: Transform): void;
        _rayCastLocal(beginX: number, beginY: number, beginZ: number, endX: number, endY: number, endZ: number, hit: RayCastHit): boolean;
        /**
         * Returns the type of the collision geometry.
         *
         * See `GeometryType` for details.
         */
        getType(): number;
        /**
         * Returns the volume of the collision geometry.
         */
        getVolume(): number;
        /**
         * Performs ray casting. Returns `true` and sets the result information to `hit` if
         * the line segment from `begin` to `end` and the geometry transformed by `transform`
         * intersect. Returns `false` if the line segment and the geometry do not intersect.
         */
        rayCast(begin: Vec3, end: Vec3, transform: Transform, hit: RayCastHit): boolean;
    }

    /**
         * Types of broad-phase algorithms.
         */
    export class BroadPhaseType {
        protected constructor();
        static readonly _BRUTE_FORCE: number;
        static readonly _BVH: number;
        /**
         * The brute force algorithm searches all the possible pairs of the proxies every time.
         * This is **very slow** and so users should not choose this algorithm without exceptional reasons.
         */
        static readonly BRUTE_FORCE: number;
        /**
         * The BVH algorithm uses bounding volume hierarchy for detecting overlapping pairs of proxies efficiently.
         */
        static readonly BVH: number;
    }

    /**
     * Brute force implementation of broad-phase collision detection. Time complexity is O(n^2).
     */
    export class BruteForceBroadPhase extends BroadPhase {
        constructor();
        createProxy(userData: any, aabb: Aabb): Proxy;
        destroyProxy(proxy: Proxy): void;
        moveProxy(proxy: Proxy, aabb: Aabb, dislacement: Vec3): void;
        collectPairs(): void;
        rayCast(begin: Vec3, end: Vec3, callback: BroadPhaseProxyCallback): void;
        convexCast(convex: ConvexGeometry, begin: Transform, translation: Vec3, callback: BroadPhaseProxyCallback): void;
        aabbTest(aabb: Aabb, callback: BroadPhaseProxyCallback): void;
    }

    /**
     * Internal class.
     *
     * BVH Proxy
     */
    export class BvhProxy extends Proxy {
        constructor(userData: any, id: number);
        _leaf: BvhNode;
        _moved: boolean;
    }

    /**
    * Internal class.
    *
    * BVH Node
    */
    export class BvhNode {
        constructor();
        _next: BvhNode;
        _prevLeaf: BvhNode;
        _nextLeaf: BvhNode;
        _children: BvhNode[];
        _childIndex: number;
        _parent: BvhNode;
        _height: number;
        _proxy: BvhProxy;
        _aabbMinX: number;
        _aabbMinY: number;
        _aabbMinZ: number;
        _aabbMaxX: number;
        _aabbMaxY: number;
        _aabbMaxZ: number;
        _tmpX: number;
        _tmpY: number;
        _tmpZ: number;
    }

    /**
    * Internal class.
    *
    * BVH strategy for BVH tree
    */
    export class BvhStrategy {
        constructor();
        _insertionStrategy: number;
        _balancingEnabled: boolean;
        /**
         * Returns the next step of leaf insertion.
         * `0` or `1` to descend to corresponding child of current node.
         * `-1` to stop descending and make common parent with current node.
         */
        _decideInsertion(currentNode: BvhNode, leaf: BvhNode): number;
        /**
         * Sorts `leaves` and returns the split index `k` of the half-open interval [`from`, `until`).
         * Leaves are separated into [`from`, `k`) and [`k`, `until`).
         */
        _splitLeaves(leaves: BvhNode[], from: number, until: number): number;
    }

    /**
     * Internal class.
     *
     * BVH Tree
     */
    export class BvhTree {
        constructor();
        _root: BvhNode;
        _numLeaves: number;
        _strategy: BvhStrategy;
        _print(root: BvhNode, indent?: string): void;
        _getBalance(): number;
    }

    /**
    * The broad-phase collision detection algorithm based on bounding volume hierarchy (BVH).
    * Average time complexity is O(NlogN) or lower.
    */
    export class BvhBroadPhase extends BroadPhase {
        constructor();
        _tree: BvhTree;
        createProxy(userData: any, aabb: Aabb): Proxy;
        destroyProxy(proxy: Proxy): void;
        moveProxy(proxy: Proxy, aabb: Aabb, displacement: Vec3): void;
        collectPairs(): void;
        rayCast(begin: Vec3, end: Vec3, callback: BroadPhaseProxyCallback): void;
        convexCast(convex: ConvexGeometry, begin: Transform, translation: Vec3, callback: BroadPhaseProxyCallback): void;
        aabbTest(aabb: Aabb, callback: BroadPhaseProxyCallback): void;
        /**
         * Returns the balance of the bounding volume tree.
         */
        getTreeBalance(): number;
    }

    /**
    * Internal class.
    *
    * Strategies of leaf insertion.
    */
    export class BvhInsertionStrategy {
        protected constructor();
        static readonly SIMPLE: number;
        static readonly MINIMIZE_SURFACE_AREA: number;
    }

    /**
     * A box collision geometry.
     */
    export class BoxGeometry extends ConvexGeometry {
        /**
         * Creates a box collision geometry of half-extents `halfExtents`.
         */
        constructor(halfExtents: Vec3);
        _halfExtentsX: number;
        _halfExtentsY: number;
        _halfExtentsZ: number;
        _halfAxisXX: number;
        _halfAxisXY: number;
        _halfAxisXZ: number;
        _halfAxisYX: number;
        _halfAxisYY: number;
        _halfAxisYZ: number;
        _halfAxisZX: number;
        _halfAxisZY: number;
        _halfAxisZZ: number;
        /**
         * Returns the half-extents of the box.
         */
        getHalfExtents(): Vec3;
        /**
         * Sets `halfExtents` to the half-extents of the box.
         */
        getHalfExtentsTo(halfExtents: Vec3): void;
        _updateMass(): void;
        _computeAabb(aabb: Aabb, tf: Transform): void;
        computeLocalSupportingVertex(dir: Vec3, out: Vec3): void;
        _rayCastLocal(beginX: number, beginY: number, beginZ: number, endX: number, endY: number, endZ: number, hit: RayCastHit): boolean;
    }

    /**
     * A capsule collision geometry aligned with the y-axis.
     */
    export class CapsuleGeometry extends ConvexGeometry {
        /**
         * Creates a capsule collision geometry of radius `radius` and half-height `halfHeight`.
         */
        constructor(radius: number, halfHeight: number);
        _radius: number;
        _halfHeight: number;
        /**
         * Returns the radius of the capsule.
         */
        getRadius(): number;
        /**
         * Returns the half-height of the capsule.
         */
        getHalfHeight(): number;
        _updateMass(): void;
        _computeAabb(aabb: Aabb, tf: Transform): void;
        computeLocalSupportingVertex(dir: Vec3, out: Vec3): void;
        _rayCastLocal(beginX: number, beginY: number, beginZ: number, endX: number, endY: number, endZ: number, hit: RayCastHit): boolean;
    }

    /**
     * A cone collision geometry aligned with the y-axis.
     */
    export class ConeGeometry extends ConvexGeometry {
        /**
         * Creates a cone collision geometry of radius `radius` and half-height `halfHeight`.
         */
        constructor(radius: number, halfHeight: number);
        _radius: number;
        _halfHeight: number;
        /**
         * Returns the radius of the cone.
         */
        getRadius(): number;
        /**
         * Returns the half-height of the cone.
         */
        getHalfHeight(): number;
        _updateMass(): void;
        _computeAabb(aabb: Aabb, tf: Transform): void;
        computeLocalSupportingVertex(dir: Vec3, out: Vec3): void;
        _rayCastLocal(beginX: number, beginY: number, beginZ: number, endX: number, endY: number, endZ: number, hit: RayCastHit): boolean;
    }

    /**
     * A convex hull collision geometry. A convex hull of the vertices is the smallest convex
     * polyhedron which contains all vertices.
     */
    export class ConvexHullGeometry extends ConvexGeometry {
        /**
         * Creates a convex hull collision geometry of the vertices `vertices`.
         */
        constructor(vertices: Vec3[]);
        _vertices: Vec3[];
        _tmpVertices: Vec3[];
        _numVertices: number;
        /**
         * Returns the vertices of the convex hull.
         */
        getVertices(): Vec3[];
        _updateMass(): void;
        _computeAabb(aabb: Aabb, tf: Transform): void;
        computeLocalSupportingVertex(dir: Vec3, out: Vec3): void;
    }

    /**
 * A cylinder collision geometry aligned with the y-axis.
 */
    export class CylinderGeometry extends ConvexGeometry {
        /**
         * Creates a cylinder collision geometry of radius `radius` and half-height `halfHeight`.
         */
        constructor(radius: number, halfHeight: number);
        _radius: number;
        _halfHeight: number;
        /**
         * Returns the radius of the cylinder.
         */
        getRadius(): number;
        /**
         * Returns the half-height of the cylinder.
         */
        getHalfHeight(): number;
        _updateMass(): void;
        _computeAabb(aabb: Aabb, tf: Transform): void;
        computeLocalSupportingVertex(dir: Vec3, out: Vec3): void;
        _rayCastLocal(beginX: number, beginY: number, beginZ: number, endX: number, endY: number, endZ: number, hit: RayCastHit): boolean;
    }

    /**
     * A sphere collision geometry.
     */
    export class SphereGeometry extends ConvexGeometry {
        /**
         * Creates a sphere collision geometry of radius `radius`.
         */
        constructor(radius: number);
        _radius: number;
        /**
         * Returns the radius of the sphere.
         */
        getRadius(): number;
        _updateMass(): void;
        _computeAabb(aabb: Aabb, tf: Transform): void;
        computeLocalSupportingVertex(dir: Vec3, out: Vec3): void;
        _rayCastLocal(beginX: number, beginY: number, beginZ: number, endX: number, endY: number, endZ: number, hit: RayCastHit): boolean;
    }

    /**
     * The list of collision geometry types.
     */
    export class GeometryType {
        protected constructor();
        static readonly _SPHERE: number;
        static readonly _BOX: number;
        static readonly _CYLINDER: number;
        static readonly _CONE: number;
        static readonly _CAPSULE: number;
        static readonly _CONVEX_HULL: number;
        static readonly _CONVEX_MIN: number;
        static readonly _CONVEX_MAX: number;
        /**
         * Represents a sphere collision geometry.
         *
         * See `SphereGeometry`.
         */
        static readonly SPHERE: number;
        /**
         * Represents a box collision geometry.
         *
         * See `BoxGeometry`.
         */
        static readonly BOX: number;
        /**
         * Represents a cylinder collision geometry.
         *
         * See `CylinderGeometry`.
         */
        static readonly CYLINDER: number;
        /**
         * Represents a cone collision geometry.
         *
         * See `ConeGeometry`.
         */
        static readonly CONE: number;
        /**
         * Represents a capsule collision geometry.
         *
         * See `CapsuleGeometry`.
         */
        static readonly CAPSULE: number;
        /**
         * Represents a convex hull collision geometry.
         *
         * See `ConvexHullGeometry`.
         */
        static readonly CONVEX_HULL: number;
    }

    /**
         * The result point is a pair of the closest points of collision geometries
         * detected by a collision  This holds relative closest points for
         * each collision geometry and the amount of the overlap.
         */
    export class DetectorResultPoint {
        constructor();
        /**
         * The first collision geometry's closest point.
         */
        position1: Vec3;
        /**
         * The second collision geometry's closest point.
         */
        position2: Vec3;
        /**
         * The amount of the overlap. This becomes negative if two geometries are
         * separate.
         */
        depth: number;
        /**
         * The identification of the result point.
         */
        id: number;
    }

    /**
 * The result of narrow-phase collision detection. This is used for generating contact
 * points of a contact constraint at once or incrementally.
 */
    export class DetectorResult {
        /**
         * Default constructor.
         */
        constructor();
        /**
         * The number of the result points.
         */
        numPoints: number;
        /**
         * The result points. Note that **only the first `DetectorResult.numPoints` points are
         * computed by the collision detector**.
         */
        points: DetectorResultPoint[];
        /**
         * The normal vector of the contact plane.
         */
        normal: Vec3;
        /**
         * Whether the result points are to be used for incremental menifold update.
         */
        incremental: boolean;
        /**
         * Returns the maximum depth of the result points. Returns `0.0` if no result
         * points are available.
         */
        getMaxDepth(): number;
        /**
         * Cleans up the result data.
         */
        clear(): void;
    }

    /**
     * Internal class.
     */
    export class GjkCache {
        constructor();
        prevClosestDir: Vec3;
        clear(): void;
    }

    /**
     * This is used for caching narrow-phase data of a pair of collision geometries.
     */
    export class CachedDetectorData {
        constructor();
        _gjkCache: GjkCache;
        _clear(): void;
    }

    /**
         * Interface of a collision detector for narrow-phase collision detection.
         */
    export class Detector {
        constructor(swapped: boolean);
        /**
         * Computes the contact manifold of two collision geometries `geom1` and `geom2` with the transforms
         * `transform1` and `transform2`, and stores it to `result`. `cachedData` is used to improve performance
         * of collision detection in some detectors.
         */
        detect(result: DetectorResult, geom1: Geometry, geom2: Geometry, transform1: Transform, transform2: Transform, cachedData: CachedDetectorData): void;
    }

    /**
         * CollisionMatrix provides corresponding collision detector for a pair of
         * two geometries of given types.
         */
    export class CollisionMatrix {
        constructor();
        /**
         * Returns an appropriate collision detector of two geometries of types `geomType1` and `geomType2`.
         *
         * This method is **not symmetric**, so `getDetector(a, b)` may not be equal to `getDetector(b, a)`.
         */
        getDetector(geomType1: number, geomType2: number): Detector;
    }

    /**
     * Box vs Box 
     */
    export class BoxBoxDetector extends Detector {
        /**
         * Default constructor.
         */
        constructor();
    }

    export class BoxBoxDetectorMacro {
        protected constructor();
    }

    /**
 * Capsule vs Capsule 
 */
    export class CapsuleCapsuleDetector extends Detector {
        /**
         * Default constructor.
         */
        constructor();
    }

    /**
 * General convex collision detector using GJK/EPA
 */
    export class GjkEpaDetector extends Detector {
        /**
         * Default constructor.
         */
        constructor();
    }

    /**
 * Sphere vs Box collision 
 */
    export class SphereBoxDetector extends Detector {
        /**
         * If `swapped` is `true`, the collision detector expects `BoxGeometry` and `SphereGeometry` for the
         * first and second argument of `SphereBoxdetect`. If `swapped` is `false`, the collision detector expects
         * `SphereGeometry` and `BoxGeometry` instead.
         */
        constructor(swapped: boolean);
    }

    /**
 * Sphere vs Capsule 
 */
    export class SphereCapsuleDetector extends Detector {
        /**
         * If `swapped` is `true`, the collision detector expects `CapsuleGeometry` and `SphereGeometry` for the
         * first and second argument of `SphereCapsuledetect`. If `swapped` is `false`, the collision detector expects
         * `SphereGeometry` and `CapsuleGeometry` instead.
         */
        constructor(swapped: boolean);
    }

    /**
 * Sphere vs Sphere 
 */
    export class SphereSphereDetector extends Detector {
        /**
         * Default constructor.
         */
        constructor();
    }

    /**
 * Internal class.
 */
    export class EpaTriangle {
        constructor();
        _next: EpaTriangle;
        _prev: EpaTriangle;
        _vertices: EpaVertex[];
        _adjacentTriangles: EpaTriangle[];
        _adjacentPairIndex: number[];
        _normal: Vec3;
        _distanceSq: number;
        _nextIndex: number[];
        _tmpDfsId: number;
        _tmpDfsVisible: boolean;
        id: number;
        init(vertex1: EpaVertex, vertex2: EpaVertex, vertex3: EpaVertex, center: Vec3, autoCheck?: boolean): boolean;
        setAdjacentTriangle(triangle: EpaTriangle): boolean;
        removeAdjacentTriangles(): void;
        removeReferences(): void;
        dump(): void;
        static count: number;
    }

    /**
 * Internal class.
 */
    export class EpaVertex {
        constructor();
        _next: EpaVertex;
        v: Vec3;
        w1: Vec3;
        w2: Vec3;
        _tmpEdgeLoopNext: EpaVertex;
        _tmpEdgeLoopOuterTriangle: EpaTriangle;
        randId: number;
        init(v: Vec3, w1: Vec3, w2: Vec3): EpaVertex;
        removeReferences(): void;
    }

    /**
     * Internal class.
     */
    export class EpaPolyhedron {
        constructor();
        _vertices: EpaVertex[];
        _numVertices: number;
        _triangleList: EpaTriangle;
        _triangleListLast: EpaTriangle;
        _numTriangles: number;
        _trianglePool: EpaTriangle;
        _vertexPool: EpaVertex;
        _center: Vec3;
        _status: number;
        _init(v1: EpaVertex, v2: EpaVertex, v3: EpaVertex, v4: EpaVertex): boolean;
        _addVertex(vertex: EpaVertex, base: EpaTriangle): boolean;
        _dumpAsObjModel(): void;
    }

    /**
 * Internal class.
 */
    export class EpaPolyhedronState {
        protected constructor();
        static readonly OK: number;
        static readonly INVALID_TRIANGLE: number;
        static readonly NO_ADJACENT_PAIR_INDEX: number;
        static readonly NO_ADJACENT_TRIANGLE: number;
        static readonly EDGE_LOOP_BROKEN: number;
        static readonly NO_OUTER_TRIANGLE: number;
        static readonly TRIANGLE_INVISIBLE: number;
    }

    /**
 * Setting provides advenced parameters used by the physics simulation.
 */
    export class Setting {
        protected constructor();
        static defaultFriction: number;
        static defaultRestitution: number;
        static defaultDensity: number;
        static defaultCollisionGroup: number;
        static defaultCollisionMask: number;
        static maxTranslationPerStep: number;
        static maxRotationPerStep: number;
        static bvhProxyPadding: number;
        static bvhIncrementalCollisionThreshold: number;
        static defaultGJKMargin: number;
        static enableGJKCaching: boolean;
        static maxEPAVertices: number;
        static maxEPAPolyhedronFaces: number;
        static contactEnableBounceThreshold: number;
        static velocityBaumgarte: number;
        static positionSplitImpulseBaumgarte: number;
        static positionNgsBaumgarte: number;
        static contactUseAlternativePositionCorrectionAlgorithmDepthThreshold: number;
        static defaultContactPositionCorrectionAlgorithm: number;
        static alternativeContactPositionCorrectionAlgorithm: number;
        static contactPersistenceThreshold: number;
        static maxManifoldPoints: number;
        static defaultJointConstraintSolverType: number;
        static defaultJointPositionCorrectionAlgorithm: number;
        static jointWarmStartingFactorForBaungarte: number;
        static jointWarmStartingFactor: number;
        static minSpringDamperDampingRatio: number;
        static minRagdollMaxSwingAngle: number;
        static maxJacobianRows: number;
        static directMlcpSolverEps: number;
        static islandInitialRigidBodyArraySize: number;
        static islandInitialConstraintArraySize: number;
        static sleepingVelocityThreshold: number;
        static sleepingAngularVelocityThreshold: number;
        static sleepingTimeThreshold: number;
        static disableSleeping: boolean;
        static linearSlop: number;
        static angularSlop: number;
    }

    /**
     * GJK algorithm and EPA for narrow-phase collision detection.
     */
    export class GjkEpa {
        /**
         * Default constructor. Consider using `GjkEpa.getInstance` instead of creating a new
         * instance.
         */
        constructor();
        /**
         * Computed closest point of the first geometry in world coordinate system.
         */
        closestPoint1: Vec3;
        /**
         * Computed closest point of the second geometry in world coordinate system.
         */
        closestPoint2: Vec3;
        /**
         * Computed distance between two geometries. This value may be negative if two
         * geometries are overlapping.
         */
        distance: number;
        /**
         * Computes the closest points of two convex geometries `c1` and `c2` with transforms `tf1` and `tf2`
         * respectively, and returns the status of the result (see `GjkEpaResultState` for details). If cached
         * data `cache` is not `null`, this tries to exploit the previous result in `cache` to improve performance,
         * and stores the new result to `cache`.
         *
         * Set the compiler option `OIMO_GJK_EPA_DEBUG` for debugging (warning: massive logging).
         */
        computeClosestPoints(c1: ConvexGeometry, c2: ConvexGeometry, tf1: Transform, tf2: Transform, cache: CachedDetectorData): number;
        /**
         * Computes the distance between two convex geometries `c1` and `c2` with transforms `tf1` and `tf2`
         * respectively, and returns the status of the result (see `GjkEpaResultState` for details). Different
         * from `GjkEpa.computeClosestPoints`, this does not compute negative distances and closest points if
         * two geometries are overlapping. If cached data `cache` is not `null`, this tries to exploit the
         * previous result in `cache` to improve performance, and stores the new result to `cache`.
         *
         * Set the compiler option `OIMO_GJK_EPA_DEBUG` for debugging (warning: massive logging).
         */
        computeDistance(c1: ConvexGeometry, c2: ConvexGeometry, tf1: Transform, tf2: Transform, cache: CachedDetectorData): number;
        /**
         * Performs a convex casting between `c1` and `c2`. Returns `true` and sets the result information
         * to `hit` if the convex geometries intersect. Each convex geometries translates by `tl1` and `tl2`,
         * starting from the beginning transforms `tf1` and `tf2` respectively.
         *
         * Set the compiler option `OIMO_GJK_EPA_DEBUG` for debugging (warning: massive logging).
         */
        convexCast(c1: ConvexGeometry, c2: ConvexGeometry, tf1: Transform, tf2: Transform, tl1: Vec3, tl2: Vec3, hit: RayCastHit): boolean;
        /**
         * Performs ray cansting against the convex geometry `c` with transform `tf`. Returns `true` and sets
         * the result information to `hit` if the line segment from `begin` to `end` intersects the convex
         * geometry. Otherwise returns `false`.
         *
         * Set the compiler option `OIMO_GJK_EPA_DEBUG` for debugging (warning: massive logging).
         */
        rayCast(c: ConvexGeometry, tf: Transform, begin: Vec3, end: Vec3, hit: RayCastHit): boolean;
        /**
         * Returns an instance of `GjkEpa`.
         */
        static getInstance(): GjkEpa;
    }

    export class GjkEpaLog {
        protected constructor();
    }

    /**
 * The list of the state of a result of `GjkEpa.computeClosestPoints`.
 */
    export class GjkEpaResultState {
        protected constructor();
        static readonly _SUCCEEDED: number;
        static readonly _GJK_FAILED_TO_MAKE_TETRAHEDRON: number;
        static readonly _GJK_DID_NOT_CONVERGE: number;
        static readonly _EPA_FAILED_TO_INIT: number;
        static readonly _EPA_FAILED_TO_ADD_VERTEX: number;
        static readonly _EPA_DID_NOT_CONVERGE: number;
        /**
         * GJK/EPA computation is successfully finished.
         */
        static readonly SUCCEEDED: number;
        /**
         * Failed to construct a tetrahedron enclosing the origin in GJK computation.
         */
        static readonly GJK_FAILED_TO_MAKE_TETRAHEDRON: number;
        /**
         * GJK iterations did not converge in time.
         */
        static readonly GJK_DID_NOT_CONVERGE: number;
        /**
         * Failed to construct initial polyhedron in EPA construction.
         */
        static readonly EPA_FAILED_TO_INIT: number;
        /**
         * Failed to add a new vertex to the polyhedron in EPA computation.
         */
        static readonly EPA_FAILED_TO_ADD_VERTEX: number;
        /**
         * EPA iterations did not converge in time.
         */
        static readonly EPA_DID_NOT_CONVERGE: number;
    }

    /**
 * Simplex utilities for GJK/EPA computations.
 */
    export class SimplexUtil {
        protected constructor();
        /**
         * Sets `out` to the minimum length point on the line (`vec1`, `vec2`)
         * and returns the index of the voronoi region.
         */
        static projectOrigin2(vec1: Vec3, vec2: Vec3, out: Vec3): number;
        /**
         * Sets `out` to the minimum length point on the triangle (`vec1`, `vec2`, `vec3`)
         * and returns the index of the voronoi region.
         */
        static projectOrigin3(vec1: Vec3, vec2: Vec3, vec3: Vec3, out: Vec3): number;
        /**
         * Sets `out` to the minimum length point on the tetrahedron (`vec1`, `vec2`, `vec3`, `vec4`)
         * and returns the index of the voronoi region.
         */
        static projectOrigin4(vec1: Vec3, vec2: Vec3, vec3: Vec3, vec4: Vec3, out: Vec3): number;
    }

    /**
     * This class provides mathematical operations for internal purposes.
     */
    export class MathUtil {
        protected constructor();
        /**
         * Positive infinity.
         */
        static readonly POSITIVE_INFINITY: number;
        /**
         * Negative infinity.
         */
        static readonly NEGATIVE_INFINITY: number;
        /**
         * The ratio of the circumference of a circle to its diameter.
         */
        static readonly PI: number;
        /**
         * Shorthand for `PI * 2`.
         */
        static readonly TWO_PI: number;
        /**
         * Shorthand for `PI / 2`.
         */
        static readonly HALF_PI: number;
        /**
         * Shorthand for `PI / 180`.
         */
        static readonly TO_RADIANS: number;
        /**
         * Shorthand for `180 / PI`.
         */
        static readonly TO_DEGREES: number;
        /**
         * Returns the absolute value of `x`.
         */
        static abs(x: number): number;
        /**
         * Returns `Math.sin(x)`.
         */
        static sin(x: number): number;
        /**
         * Returns `Math.cos(x)`.
         */
        static cos(x: number): number;
        /**
         * Returns `Math.tan(x)`.
         */
        static tan(x: number): number;
        /**
         * Returns `Math.asin(x)`.
         */
        static asin(x: number): number;
        /**
         * Returns `Math.acos(x)`.
         */
        static acos(x: number): number;
        /**
         * Returns `Math.atan(x)`.
         */
        static atan(x: number): number;
        /**
         * Returns `Math.asin(clamp(-1, x, 1))`.
         * This never returns `NaN` as long as `x` is not `NaN`.
         */
        static safeAsin(x: number): number;
        /**
         * Returns `Math.acos(clamp(-1, x, 1))`.
         * This never returns `NaN` as long as `x` is not `NaN`.
         */
        static safeAcos(x: number): number;
        /**
         * Returns `Math.atan2(y, x)`
         */
        static atan2(y: number, x: number): number;
        /**
         * Returns `Math.sqrt(x)`.
         */
        static sqrt(x: number): number;
        /**
         * Returns a clamped value of `x` from `min` to `max`.
         */
        static clamp(x: number, min: number, max: number): number;
        /**
         * Returns `Math.random()`.
         */
        static rand(): number;
        /**
         * Returns a random value from `min` inclusive to `max` exclusive.
         */
        static randIn(min: number, max: number): number;
        /**
         * Returns a random `Vec3` from `(min, min, min)` inclusive to `(max, max, max)` exclusive.
         */
        static randVec3In(min: number, max: number): Vec3;
        /**
         * Returns a random `Vec3` from `(-1.0, -1.0, -1.0)` inclusive to `(1.0, 1.0, 1.0)` exclusive.
         */
        static randVec3(): Vec3;
    }

    /**
 * The object pool system of `Vec3`, `Mat3`, `Mat4`, and `Quat`.
 */
    export class Pool {
        /**
         * Default constructor.
         */
        constructor();
        /**
         * Returns a `Vec3` object. If an unused object of `Vec3` is pooled, this does
         * not create a new instance.
         */
        vec3(): Vec3;
        /**
         * Returns a `Mat3` object. If an unused object of `Mat3` is pooled, this does
         * not create a new instance.
         */
        mat3(): Mat3;
        /**
         * Returns a `Mat4` object. If an unused object of `Vec3` is pooled, this does
         * not create a new instance.
         */
        mat4(): Mat4;
        /**
         * Returns a `Quat` object. If an unused object of `Quat` is pooled, this does
         * not create a new instance.
         */
        quat(): Quat;
        /**
         * Disposes an object got from `Pool.vec3`, `Pool.mat3`, `Pool.mat4`, or `Pool.quat`.
         */
        dispose(vec3?: Vec3, mat3?: Mat3, mat4?: Mat4, quat?: Quat): void;
        /**
         * Disposes an `Vec3` object got from `Pool.vec3`.
         */
        disposeVec3(v: Vec3): void;
        /**
         * Disposes an `Mat3` object got from `Pool.mat3`.
         */
        disposeMat3(m: Mat3): void;
        /**
         * Disposes an `Mat4` object got from `Pool.mat4`.
         */
        disposeMat4(m: Mat4): void;
        /**
         * Disposes an `Quat` object got from `Pool.quat`.
         */
        disposeQuat(q: Quat): void;
    }

    /**
         * A rigid body configuration is used for constructions of rigid bodies. An instance of this
         * class can safely be reused, as a rigid body will not have any references to a field of
         * this class.
         */
    export class RigidBodyConfig {
        /**
         * Default constructor.
         */
        constructor();
        /**
         * The world position of the rigid body's center of gravity.
         */
        position: Vec3;
        /**
         * The rotation matrix of the rigid body.
         */
        rotation: Mat3;
        /**
         * The initial value of the rigid body's linear velocity.
         */
        linearVelocity: Vec3;
        /**
         * The initial value of the rigid body's angular velocity.
         */
        angularVelocity: Vec3;
        /**
         * The rigid body's motion type. See `RigidBodyType` for details.
         */
        type: number;
        /**
         * Whether to automatically sleep the rigid body when it stops moving
         * for a certain period of time, namely `Setting.sleepingTimeThreshold`.
         */
        autoSleep: boolean;
        /**
         * The damping coefficient of the linear velocity. Set positive values to
         * gradually reduce the linear velocity.
         */
        linearDamping: number;
        /**
         * The damping coefficient of the angular velocity. Set positive values to
         * gradually reduce the angular velocity.
         */
        angularDamping: number;
    }

    /**
 * A callback class for contact events. Contact events between two shapes
 * will occur in following order:
 *
 * 1. `beginContact`
 * 1. `preSolve` (before velocity update)
 * 1. `postSolve` (after velocity update)
 * 1. (repeats 2. and 3. every frame while the shapes are touching)
 * 1. `endContact`
 */
    export class ContactCallback {
        /**
         * Default constructor.
         */
        constructor();
        /**
         * This is called when two shapes start touching each other. `c` is the contact of
         * the two shapes.
         */
        beginContact(c: Contact): void;
        /**
         * This is called every frame **before** velocity solver iterations while two shapes
         * are touching. `c` is the contact for the two shapes.
         */
        preSolve(c: Contact): void;
        /**
         * This is called every frame **after** velocity solver iterations while two shapes
         * are touching. `c` is the contact for the two shapes.
         */
        postSolve(c: Contact): void;
        /**
         * This is called when two shapes end touching each other. `c` is the contact of
         * the two shapes.
         */
        endContact(c: Contact): void;
        /**
         * This is called when two shapes begin touching each other but one of them is marked as a trigger. `c` 
         * is the contact of the  two shapes.
         */
        beginTriggerContact(c: Contact): void;
        /**
         * This is called when two shapes end touching each other but one of them is marked as a trigger. `c` 
         * is the contact of the  two shapes.
         */
        endTriggerContact(c: Contact): void;
    }

    /**
     * A shape configuration is used for construction of shapes. An instance of
     * this class can safely be reused as a shape will not have any references
     * of a field of this class.
     */
    export class ShapeConfig {
        /**
         * Default constructor.
         */
        constructor();
        /**
         * The shape's local position relative to the parent rigid body's origin.
         */
        position: Vec3;
        /**
         * The shape's local rotation matrix relative to the parent rigid body's
         * rotation.
         */
        rotation: Mat3;
        /**
         * The coefficient of friction of the shape.
         */
        friction: number;
        /**
         * The coefficient of restitution of the shape.
         */
        restitution: number;
        /**
         * The density of the shape, usually in Kg/m^3.
         */
        density: number;
        /**
         * The collision geometry of the shape.
         */
        geometry: Geometry;
        /**
         * The collision group bits the shape belongs to. This is used for collision
         * filtering.
         *
         * Two shapes `shape1` and `shape2` will collide only if both
         * `shape1.collisionGroup & shape2.collisionMask` and
         * `shape2.collisionGroup & shape1.collisionMask` are not zero.
         */
        collisionGroup: number;
        /**
         * The collision mask bits of the shape. This is used for collision
         * filtering.
         *
         * Two shapes `shape1` and `shape2` will collide only if both
         * `shape1.collisionGroup & shape2.collisionMask` and
         * `shape2.collisionGroup & shape1.collisionMask` are not zero.
         */
        collisionMask: number;
        /**
         * The contact callback of the shape. The callback methods are called
         * when contact events the shape is involved occurred.
         */
        contactCallback: ContactCallback;
    }

    /**
     * A shape is a component of a rigid body. It attaches a collision geometry to the parent rigid body
     * with some physical properties such as coefficients of friction and restitution. The collision
     * geometry can locally be transformed relative to the parent rigid body's center of gravity.
     */
    export class Shape {
        /**
         * Creates a new shape by configuration `config`.
         */
        constructor(config: ShapeConfig);
        _id: number;
        _prev: Shape;
        _next: Shape;
        _rigidBody: RigidBody;
        _geom: Geometry;
        _localTransform: Transform;
        _ptransform: Transform;
        _transform: Transform;
        _restitution: number;
        _friction: number;
        _density: number;
        _aabb: Aabb;
        _proxy: Proxy;
        _collisionGroup: number;
        _collisionMask: number;
        _contactCallback: ContactCallback;
        /**
         * Extra field that users can use for their own purposes.
         */
        userData: any;
        /**
         * Returns the coefficient of friction.
         */
        getFriction(): number;
        /**
         * Sets the coefficient of friction to `friction`.
         */
        setFriction(friction: number): void;
        /**
         * Returns the coefficient of restitution.
         */
        getRestitution(): number;
        /**
         * Sets the coefficient of restitution to `restitution`.
         */
        setRestitution(restitution: number): void;
        /**
         * Returns the transform of the shape relative to the parent rigid body's transform.
         */
        getLocalTransform(): Transform;
        /**
         * Sets `transform` to the transform of the shape relative to the parent rigid body's
         * transform.
         *
         * This does not create a new instance of `Transform`.
         */
        getLocalTransformTo(transform: Transform): void;
        /**
         * Returns the world transform of the shape.
         */
        getTransform(): Transform;
        /**
         * Sets `transform` to the world transform of the shape.
         *
         * This does not create a new instance of `Transform`.
         */
        getTransformTo(transform: Transform): void;
        /**
         * Sets the shape's transform to `transform` relative to the parent rigid body's transform.
         *
         * This affects the parent rigid body's mass data.
         */
        setLocalTransform(transform: Transform): void;
        /**
         * Returns the density of the shape.
         */
        getDensity(): number;
        /**
         * Sets the density of the shape to `density`.
         *
         * This affects the parent rigid body's mass data.
         */
        setDensity(density: number): void;
        /**
         * Returns the AABB of the shape. The AABB may be incorrect if the shape doesn't have a
         * parent rigid body.
         */
        getAabb(): Aabb;
        /**
         * Sets `aabb` to the AABB of the shape. The AABB may be incorrect if the shape doesn't have a
         * parent rigid body.
         *
         * This does not create a new instance of `AABB`.
         */
        getAabbTo(aabb: Aabb): void;
        /**
         * Returns the colision geometry of the shape.
         */
        getGeometry(): Geometry;
        /**
         * Returns the parent rigid body. This returns `null` if the shape doesn't have a parent
         * rigid body.
         */
        getRigidBody(): RigidBody;
        /**
         * Returns the collision group bits the shape belongs to.
         */
        getCollisionGroup(): number;
        /**
         * Sets the shape's collision group bits to `collisionGroup`.
         */
        setCollisionGroup(collisionGroup: number): void;
        /**
         * Returns the collision mask bits of the shape.
         */
        getCollisionMask(): number;
        /**
         * Sets the shape's collision mask bits to `collisionMask`.
         */
        setCollisionMask(collisionMask: number): void;
        /**
         * Returns the contact callback of the shape.
         */
        getContactCallback(): ContactCallback;
        /**
         * Sets the contact callback of the shape to `callback`.
         */
        setContactCallback(callback: ContactCallback): void;
        /**
         * Returns the previous shape in the rigid body.
         *
         * If the previous one does not exist, `null` will be returned.
         */
        getPrev(): Shape;
        /**
         * Returns the next shape in the rigid body.
         *
         * If the next one does not exist, `null` will be returned.
         */
        getNext(): Shape;
    }

    /**
     * A joint configuration is used for constructions of various joints.
     * An instance of any kind of the joint configurations can safely be reused.
     */
    export class JointConfig {
        constructor();
        /**
         * The first rigid body attached to the 
         */
        rigidBody1: RigidBody;
        /**
         * The second rigid body attached to the 
         */
        rigidBody2: RigidBody;
        /**
         * The local position of the first rigid body's anchor point.
         */
        localAnchor1: Vec3;
        /**
         * The local position of the second rigid body's anchor point.
         */
        localAnchor2: Vec3;
        /**
         * Whether to allow the connected rigid bodies to collide each other.
         */
        allowCollision: boolean;
        /**
         * The type of the constraint solver for the 
         *
         * See `ConstraintSolverType` for details.
         */
        solverType: number;
        /**
         * The type of the position correction algorithm for the 
         *
         * See `PositionCorrectionAlgorithm` for details.
         */
        positionCorrectionAlgorithm: number;
        /**
         * The joint will be destroyed when magnitude of the constraint force exceeds the value.
         *
         * Set `0` for unbreakable joints.
         */
        breakForce: number;
        /**
         * The joint will be destroyed when magnitude of the constraint torque exceeds the value.
         *
         * Set `0` for unbreakable joints.
         */
        breakTorque: number;
    }

    /**
 * A joint link is used to build a constraint graph for clustering rigid bodies.
 * In a constraint graph, rigid bodies are nodes and constraints are edges.
 * See also `ContactLink`.
 */
    export class JointLink {
        constructor(joint: Joint);
        _prev: JointLink;
        _next: JointLink;
        _joint: Joint;
        _other: RigidBody;
        /**
         * Returns the contact the rigid body is attached to.
         */
        getContact(): Joint;
        /**
         * Returns the other rigid body attached to the  This provides a quick access
         * from a rigid body to the other one attached to the 
         */
        getOther(): RigidBody;
        /**
         * Returns the previous joint link in the rigid body.
         *
         * If the previous one does not exist, `null` will be returned.
         */
        getPrev(): JointLink;
        /**
         * Returns the next joint link in the rigid body.
         *
         * If the previous one does not exist, `null` will be returned.
         */
        getNext(): JointLink;
    }

    /**
     * Internal class.
     */
    export class JointImpulse {
        constructor();
        impulse: number;
        impulseM: number;
        impulseP: number;
    }

    /**
     * Information of time-step sizes of the simulation.
     */
    export class TimeStep {
        constructor();
        /**
         * The time step of simulation.
         */
        dt: number;
        /**
         * The inverse time step of simulation, equivalent to simulation FPS.
         */
        invDt: number;
        /**
         * The ratio of time steps. Defined by current time step divided by previous
         * time step.
         */
        dtRatio: number;
    }

    /**
         * The base class of all constarint solvers.
         */
    export class ConstraintSolver {
        constructor();
        _b1: RigidBody;
        _b2: RigidBody;
        _addedToIsland: boolean;
        /**
         * Prepares for velocity iteration. Time step information `timeStep` is given for
         * computing time-depending data.
         */
        preSolveVelocity(timeStep: TimeStep): void;
        /**
         * Applies initial impulses.
         */
        warmStart(timeStep: TimeStep): void;
        /**
         * Performs single velocity iteration.
         */
        solveVelocity(): void;
        /**
         * Performs post-processes of velocity part. Time step information `timeStep` is given
         * for computing time-depending data.
         */
        postSolveVelocity(timeStep: TimeStep): void;
        /**
         * Prepares for position iteration (split impulse or nonlinear Gauss-Seidel). Time step
         * information `timeStep` is given for computing time-depending data.
         *
         * This may not be called depending on position correction algorithm.
         */
        preSolvePosition(timeStep: TimeStep): void;
        /**
         * Performs single position iteration (split impulse)
         */
        solvePositionSplitImpulse(): void;
        /**
         * Performs single position iteration (nonlinear Gauss-Seidel)
         */
        solvePositionNgs(timeStep: TimeStep): void;
        /**
         * Performs post-processes.
         */
        postSolve(): void;
    }

    /**
     * The row of a Jacobian matrix.
     */
    export class JacobianRow {
        constructor();
        lin1X: number;
        lin1Y: number;
        lin1Z: number;
        lin2X: number;
        lin2Y: number;
        lin2Z: number;
        ang1X: number;
        ang1Y: number;
        ang1Z: number;
        ang2X: number;
        ang2Y: number;
        ang2Z: number;
        updateSparsity(): void;
    }

    /**
 * Internal class.
 */
    export class JointSolverInfoRow {
        constructor();
        /**
         * Used for both velocity and position 
         */
        jacobian: JacobianRow;
        /**
         * Used for both velocity and position 
         */
        rhs: number;
        /**
         * Used for velocity 
         */
        cfm: number;
        /**
         * Used for both velocity and position 
         */
        minImpulse: number;
        /**
         * Used for both velocity and position 
         */
        maxImpulse: number;
        /**
         * Used for velocity 
         */
        motorSpeed: number;
        /**
         * Used for velocity 
         */
        motorMaxImpulse: number;
        /**
         * Used for both velocity and position 
         */
        impulse: JointImpulse;
    }

    /**
     * Internal class.
     */
    export class JointSolverInfo {
        constructor();
        b1: RigidBody;
        b2: RigidBody;
        numRows: number;
        rows: JointSolverInfoRow[];
    }

    /**
 * The base class of joints. Joints are used to connect two rigid bodies
 * in various ways. See `JointType` for all types of joints.
 */
    export class Joint {
        constructor(config: JointConfig, type: number);
        _b1: RigidBody;
        _b2: RigidBody;
        _link1: JointLink;
        _link2: JointLink;
        _positionCorrectionAlgorithm: number;
        _allowCollision: boolean;
        _prev: Joint;
        _next: Joint;
        _world: World;
        _localAnchor1X: number;
        _localAnchor1Y: number;
        _localAnchor1Z: number;
        _localAnchor2X: number;
        _localAnchor2Y: number;
        _localAnchor2Z: number;
        _relativeAnchor1X: number;
        _relativeAnchor1Y: number;
        _relativeAnchor1Z: number;
        _relativeAnchor2X: number;
        _relativeAnchor2Y: number;
        _relativeAnchor2Z: number;
        _anchor1X: number;
        _anchor1Y: number;
        _anchor1Z: number;
        _anchor2X: number;
        _anchor2Y: number;
        _anchor2Z: number;
        _localBasisX1X: number;
        _localBasisX1Y: number;
        _localBasisX1Z: number;
        _localBasisY1X: number;
        _localBasisY1Y: number;
        _localBasisY1Z: number;
        _localBasisZ1X: number;
        _localBasisZ1Y: number;
        _localBasisZ1Z: number;
        _localBasisX2X: number;
        _localBasisX2Y: number;
        _localBasisX2Z: number;
        _localBasisY2X: number;
        _localBasisY2Y: number;
        _localBasisY2Z: number;
        _localBasisZ2X: number;
        _localBasisZ2Y: number;
        _localBasisZ2Z: number;
        _basisX1X: number;
        _basisX1Y: number;
        _basisX1Z: number;
        _basisY1X: number;
        _basisY1Y: number;
        _basisY1Z: number;
        _basisZ1X: number;
        _basisZ1Y: number;
        _basisZ1Z: number;
        _basisX2X: number;
        _basisX2Y: number;
        _basisX2Z: number;
        _basisY2X: number;
        _basisY2Y: number;
        _basisY2Z: number;
        _basisZ2X: number;
        _basisZ2Y: number;
        _basisZ2Z: number;
        _impulses: JointImpulse[];
        _appliedForceX: number;
        _appliedForceY: number;
        _appliedForceZ: number;
        _appliedTorqueX: number;
        _appliedTorqueY: number;
        _appliedTorqueZ: number;
        _breakForce: number;
        _breakTorque: number;
        _type: number;
        _solver: ConstraintSolver;
        /**
         * Extra field that users can use for their own purposes.
         */
        userData: any;
        _syncAnchors(): void;
        _getVelocitySolverInfo(timeStep: TimeStep, info: JointSolverInfo): void;
        _getPositionSolverInfo(info: JointSolverInfo): void;
        _checkDestruction(): void;
        /**
         * Returns the first rigid body.
         */
        getRigidBody1(): RigidBody;
        /**
         * Returns the second rigid body.
         */
        getRigidBody2(): RigidBody;
        /**
         * Returns the type of the 
         *
         * See `JointType` for details.
         */
        getType(): number;
        /**
         * Returns the first rigid body's anchor point in world coordinates.
         */
        getAnchor1(): Vec3;
        /**
         * Returns the second rigid body's anchor point in world coordinates.
         */
        getAnchor2(): Vec3;
        /**
         * Sets `anchor` to the first rigid body's anchor point in world coordinates.
         *
         * This does not create a new instance of `Vec3`.
         */
        getAnchor1To(anchor: Vec3): void;
        /**
         * Sets `anchor` to the second rigid body's anchor point in world coordinates.
         *
         * This does not create a new instance of `Vec3`.
         */
        getAnchor2To(anchor: Vec3): void;
        /**
         * Returns the first rigid body's local anchor point in world coordinates.
         */
        getLocalAnchor1(): Vec3;
        /**
         * Returns the second rigid body's local anchor point in world coordinates.
         */
        getLocalAnchor2(): Vec3;
        /**
         * Sets `localAnchor` to the first rigid body's anchor point in local coordinates.
         *
         * This does not create a new instance of `Vec3`.
         */
        getLocalAnchor1To(localAnchor: Vec3): void;
        /**
         * Sets `localAnchor` to the second rigid body's anchor point in local coordinates.
         *
         * This does not create a new instance of `Vec3`.
         */
        getLocalAnchor2To(localAnchor: Vec3): void;
        /**
         * Returns the basis of the joint for the first rigid body in world coordinates.
         */
        getBasis1(): Mat3;
        /**
         * Returns the basis of the joint for the second rigid body in world coordinates.
         */
        getBasis2(): Mat3;
        /**
         * Sets `basis` to the basis of the joint for the first rigid body in world coordinates.
         *
         * This does not create a new instance of `Mat3`.
         */
        getBasis1To(basis: Mat3): void;
        /**
         * Sets `basis` to the basis of the joint for the second rigid body in world coordinates.
         *
         * This does not create a new instance of `Mat3`.
         */
        getBasis2To(basis: Mat3): void;
        /**
         * Returns whether to allow the connected rigid bodies to collide each other.
         */
        getAllowCollision(): boolean;
        /**
         * Sets whether to allow the connected rigid bodies to collide each other.
         */
        setAllowCollision(allowCollision: boolean): void;
        /**
         * Returns the magnitude of the constraint force at which the joint will be destroyed.
         *
         * Returns `0` if the joint is unbreakable.
         */
        getBreakForce(): number;
        /**
         * Sets the magnitude of the constraint force at which the joint will be destroyed.
         *
         * Set `0` for unbreakable joints.
         */
        setBreakForce(breakForce: number): void;
        /**
         * Returns the magnitude of the constraint torque at which the joint will be destroyed.
         *
         * Returns `0` if the joint is unbreakable.
         */
        getBreakTorque(): number;
        /**
         * Sets the magnitude of the constraint force at which the joint will be destroyed.
         *
         * Set `0` for unbreakable joints.
         */
        setBreakTorque(breakTorque: number): void;
        /**
         * Returns the type of the position correction algorithm for the 
         *
         * See `PositionCorrectionAlgorithm` for details.
         */
        getPositionCorrectionAlgorithm(): number;
        /**
         * Sets the type of the position correction algorithm to `positionCorrectionAlgorithm` for the 
         *
         * See `PositionCorrectionAlgorithm` for details.
         */
        setPositionCorrectionAlgorithm(positionCorrectionAlgorithm: number): void;
        /**
         * Returns the force applied to the first rigid body at the last time step.
         */
        getAppliedForce(): Vec3;
        /**
         * Sets `appliedForce` to the force applied to the first rigid body at the last time step.
         *
         * This does not create a new instance of `Vec3`.
         */
        getAppliedForceTo(appliedForce: Vec3): void;
        /**
         * Returns the torque applied to the first rigid body at the last time step.
         */
        getAppliedTorque(): Vec3;
        /**
         * Sets `appliedTorque` to the torque applied to the first rigid body at the last time step.
         *
         * This does not create a new instance of `Vec3`.
         */
        getAppliedTorqueTo(appliedTorque: Vec3): void;
        /**
         * Returns the previous joint in the world.
         *
         * If the previous one does not exist, `null` will be returned.
         */
        getPrev(): Joint;
        /**
         * Returns the next joint in the world.
         *
         * If the next one does not exist, `null` will be returned.
         */
        getNext(): Joint;
    }

    /**
     * The manager of the contacts in the physics world. A contact of two
     * shapes is created when the AABBs of them begin overlapping, and
     * is destroyed when they end overlapping.
     */
    export class ContactManager {
        constructor(broadPhase: BroadPhase);
        _numContacts: number;
        _contactList: Contact;
        _contactListLast: Contact;
        _contactPool: Contact;
        _broadPhase: BroadPhase;
        _collisionMatrix: CollisionMatrix;
        _updateContacts(): void;
        _postSolve(): void;
        /**
         * Returns the number of the contacts in the world.
         */
        getNumContacts(): number;
        /**
         * Returns the linked list of the contacts in the world.
         */
        getContactList(): Contact;
    }

    /**
 * A callback class for ray casts in a world.
 */
    export class RayCastCallback {
        /**
         * Default constructor.
         */
        constructor();
        /**
         * This is called every time the world detects a shape `shape` that
         * the ray intersects with the hit data `hit`.
         */
        process(shape: Shape, hit: RayCastHit): void;
    }

    /**
     * A callback interface for aabb tests in a world.
     */
    export class AabbTestCallback {
        /**
         * Default constructor.
         */
        constructor();
        /**
         * This is called every time the world detects a shape `shape` that
         * the query aabb intersects.
         */
        process(shape: Shape): void;
    }

    /**
 * The physics simulation world. This manages entire the dynamic simulation. You can add
 * rigid bodies and joints to the world to simulate them.
 */
    export class World {
        /**
         * Creates a new physics world, with broad-phase collision detection algorithm `broadPhaseType` and
         * gravitational acceleration `gravity`.
         */
        constructor(broadPhaseType?: number, gravity?: Vec3);
        _rigidBodyList: RigidBody;
        _rigidBodyListLast: RigidBody;
        _jointList: Joint;
        _jointListLast: Joint;
        _broadPhase: BroadPhase;
        _contactManager: ContactManager;
        _numRigidBodies: number;
        _numJoints: number;
        _numShapes: number;
        _numIslands: number;
        _numVelocityIterations: number;
        _numPositionIterations: number;
        _gravity: Vec3;
        /**
         * Advances the simulation by the time step `timeStep`.
         */
        step(timeStep: number): void;
        /**
         * Adds the rigid body `rigidBody` to the simulation world.
         */
        addRigidBody(rigidBody: RigidBody): void;
        /**
         * Removes the rigid body `rigidBody` from the simulation world.
         */
        removeRigidBody(rigidBody: RigidBody): void;
        /**
         * Adds the joint `joint` to the simulation world.
         */
        addJoint(joint: Joint): void;
        /**
         * Removes the joint `joint` from the simulation world.
         */
        removeJoint(joint: Joint): void;
        /**
         * Sets the debug draw interface to `debugDraw`. Call `World.debugDraw` to draw the simulation world.
         */
        setDebugDraw(debugDraw: DebugDraw): void;
        /**
         * Returns the debug draw interface.
         */
        getDebugDraw(): DebugDraw;
        /**
         * Draws the simulation world for debugging. Call `World.setDebugDraw` to set the debug draw interface.
         */
        debugDraw(): void;
        /**
         * Performs a ray casting. `process` is called for all shapes the ray
         * from `begin` to `end` hits.
         */
        rayCast(begin: Vec3, end: Vec3, callback: RayCastCallback): void;
        /**
         * Performs a convex casting. `process` is called for all shapes the convex geometry
         * `convex` hits. The convex geometry translates by `translation` starting from the beginning
         * transform `begin`.
         */
        convexCast(convex: ConvexGeometry, begin: Transform, translation: Vec3, callback: RayCastCallback): void;
        /**
         * Performs an AABB query. `process` is called for all shapes that their
         * AABB and `aabb` intersect.
         */
        aabbTest(aabb: Aabb, callback: AabbTestCallback): void;
        /**
         * Returns the list of the rigid bodies added to the world.
         */
        getRigidBodyList(): RigidBody;
        /**
         * Returns the list of the joints added to the world.
         */
        getJointList(): Joint;
        /**
         * Returns the broad-phase collision detection algorithm.
         */
        getBroadPhase(): BroadPhase;
        /**
         * Returns the contact manager.
         */
        getContactManager(): ContactManager;
        /**
         * Returns the number of the rigid bodies added to the world.
         */
        getNumRigidBodies(): number;
        /**
         * Returns the number of the joints added to the world.
         */
        getNumJoints(): number;
        /**
         * Returns the number of the shapes added to the world.
         */
        getNumShapes(): number;
        /**
         * Returns the number of simulation islands.
         */
        getNumIslands(): number;
        /**
         * Returns the number of velocity iterations of constraint solvers.
         */
        getNumVelocityIterations(): number;
        /**
         * Sets the number of velocity iterations of constraint solvers to `numVelocityIterations`.
         */
        setNumVelocityIterations(numVelocityIterations: number): void;
        /**
         * Returns the number of position iterations of constraint solvers.
         */
        getNumPositionIterations(): number;
        /**
         * Sets the number of position iterations of constraint solvers to `numPositionIterations`.
         */
        setNumPositionIterations(numPositionIterations: number): void;
        /**
         * Returns the gravitational acceleration of the simulation world.
         */
        getGravity(): Vec3;
        /**
         * Sets the gravitational acceleration of the simulation world to `gravity`.
         */
        setGravity(gravity: Vec3): void;
    }

    /**
 * This class holds mass and moment of inertia for a rigid body.
 */
    export class MassData {
        /**
         * Default constructor.
         */
        constructor();
        /**
         * Mass. `0` for a non-dynamic rigid body.
         */
        mass: number;
        /**
         * Inertia tensor in local space. Zero matrix for a non-dynamic rigid body.
         */
        localInertia: Mat3;
    }

    /**
     * A rigid body. To add a rigid body to a physics world, create a `RigidBody`
     * instance, create and add shapes via `addShape`, and add the rigid
     * body to the physics world through `World.addRigidBody`. Rigid bodies have
     * three motion types: dynamic, static, and kinematic. See `RigidBodyType` for
     * details of motion types.
     */
    export class RigidBody {
        /**
         * Creates a new rigid body by configuration `config`.
         */
        constructor(config: RigidBodyConfig);
        _next: RigidBody;
        _prev: RigidBody;
        _shapeList: Shape;
        _shapeListLast: Shape;
        _numShapes: number;
        _velX: number;
        _velY: number;
        _velZ: number;
        _angVelX: number;
        _angVelY: number;
        _angVelZ: number;
        _pseudoVelX: number;
        _pseudoVelY: number;
        _pseudoVelZ: number;
        _angPseudoVelX: number;
        _angPseudoVelY: number;
        _angPseudoVelZ: number;
        _ptransform: Transform;
        _transform: Transform;
        _type: number;
        _sleepTime: number;
        _sleeping: boolean;
        _autoSleep: boolean;
        _mass: number;
        _invMass: number;
        _localInertia00: number;
        _localInertia01: number;
        _localInertia02: number;
        _localInertia10: number;
        _localInertia11: number;
        _localInertia12: number;
        _localInertia20: number;
        _localInertia21: number;
        _localInertia22: number;
        _rotFactor: Vec3;
        _invLocalInertia00: number;
        _invLocalInertia01: number;
        _invLocalInertia02: number;
        _invLocalInertia10: number;
        _invLocalInertia11: number;
        _invLocalInertia12: number;
        _invLocalInertia20: number;
        _invLocalInertia21: number;
        _invLocalInertia22: number;
        _invLocalInertiaWithoutRotFactor00: number;
        _invLocalInertiaWithoutRotFactor01: number;
        _invLocalInertiaWithoutRotFactor02: number;
        _invLocalInertiaWithoutRotFactor10: number;
        _invLocalInertiaWithoutRotFactor11: number;
        _invLocalInertiaWithoutRotFactor12: number;
        _invLocalInertiaWithoutRotFactor20: number;
        _invLocalInertiaWithoutRotFactor21: number;
        _invLocalInertiaWithoutRotFactor22: number;
        _invInertia00: number;
        _invInertia01: number;
        _invInertia02: number;
        _invInertia10: number;
        _invInertia11: number;
        _invInertia12: number;
        _invInertia20: number;
        _invInertia21: number;
        _invInertia22: number;
        _linearDamping: number;
        _angularDamping: number;
        _forceX: number;
        _forceY: number;
        _forceZ: number;
        _torqueX: number;
        _torqueY: number;
        _torqueZ: number;
        _linearContactImpulseX: number;
        _linearContactImpulseY: number;
        _linearContactImpulseZ: number;
        _angularContactImpulseX: number;
        _angularContactImpulseY: number;
        _angularContactImpulseZ: number;
        _world: World;
        _contactLinkList: ContactLink;
        _contactLinkListLast: ContactLink;
        _numContactLinks: number;
        _jointLinkList: JointLink;
        _jointLinkListLast: JointLink;
        _numJointLinks: number;
        _addedToIsland: boolean;
        _gravityScale: number;

        /** Flags the body as trigger which results in not being part of active collisions, but only triggering events. */
        _isTrigger: boolean;

        /**
         * Extra field that users can use for their own purposes.
         */
        userData: any;
        _integrate(dt: number): void;
        _integratePseudoVelocity(): void;
        /**
         * Returns the world position of the rigid body.
         */
        getPosition(): Vec3;
        /**
         * Sets `position` to the world position of the rigid body.
         *
         * This does not create a new instance of `Vec3`.
         */
        getPositionTo(position: Vec3): void;
        /**
         * Sets the world position of the rigid body to `position`.
         */
        setPosition(position: Vec3): void;
        /**
         * Translates the position of the rigid body by `translation`.
         */
        translate(translation: Vec3): void;
        /**
         * Returns the rotation matrix of the rigid body.
         */
        getRotation(): Mat3;
        /**
         * Sets `rotation` to the rotation matrix of the rigid body.
         *
         * This does not create a new instance of `Mat3`.
         */
        getRotationTo(rotation: Mat3): void;
        /**
         * Sets the rotation matrix of the rigid body to `rotation`.
         */
        setRotation(rotation: Mat3): void;
        /**
         * Sets the rotation of the rigid body by Euler angles `eulerAngles` in radians.
         */
        setRotationXyz(eulerAngles: Vec3): void;
        /**
         * Rotates the rigid body by the rotation matrix `rotation`.
         */
        rotate(rotation: Mat3): void;
        /**
         * Rotates the rigid body by Euler angles `eulerAngles` in radians.
         */
        rotateXyz(eulerAngles: Vec3): void;
        /**
         * Returns the rotation of the rigid body as a quaternion.
         */
        getOrientation(): Quat;
        /**
         * Sets `orientation` to the rotation quaternion of the rigid body.
         *
         * This does not create a new instance of `Quat`.
         */
        getOrientationTo(orientation: Quat): void;
        /**
         * Sets the rotation of the rigid body from a quaternion `quaternion`.
         */
        setOrientation(quaternion: Quat): void;
        /**
         * Returns the transform of the rigid body.
         */
        getTransform(): Transform;
        /**
         * Sets `transform` to the transform of the rigid body.
         *
         * This does not create a new instance of `Transform`.
         */
        getTransformTo(transform: Transform): void;
        /**
         * Sets the transform of the rigid body to `transform`.
         *
         * This does not keep any references to `transform`.
         */
        setTransform(transform: Transform): void;
        /**
         * Returns the mass of the rigid body.
         *
         * If the rigid body has infinite mass, `0` will be returned.
         */
        getMass(): number;
        /**
         * Returns the moment of inertia tensor in local space.
         */
        getLocalInertia(): Mat3;
        /**
         * Sets `inertia` to the moment of inertia tensor in local space.
         *
         * This does not create a new instance of `Mat3`
         */
        getLocalInertiaTo(inertia: Mat3): void;
        /**
         * Returns the mass data of the rigid body.
         */
        getMassData(): MassData;
        /**
         * Sets `massData` to the mass data of the rigid body.
         *
         * This does not create a new instance of `MassData`.
         */
        getMassDataTo(massData: MassData): void;
        /**
         * Sets the mass and moment of inertia of the rigid body by the mass data `massData`.
         * The properties set by this will be overwritten when
         *
         * - some shapes are added or removed
         * - the type of the rigid body is changed
         */
        setMassData(massData: MassData): void;
        /**
         * Returns the rotation factor of the rigid body.
         */
        getRotationFactor(): Vec3;
        /**
         * Sets the rotation factor of the rigid body to `rotationFactor`.
         *
         * This changes moment of inertia internally, so that the change of
         * angular velocity in **global space** along X, Y and Z axis will scale by `rotationFactor.x`,
         * `rotationFactor.y` and `rotationFactor.z` times respectively.
         */
        setRotationFactor(rotationFactor: Vec3): void;
        /**
         * Returns the linear velocity of the rigid body.
         */
        getLinearVelocity(): Vec3;
        /**
         * Sets `linearVelocity` to the linear velocity of the rigid body.
         *
         * This does not create a new intrance of `Vec3`.
         */
        getLinearVelocityTo(linearVelocity: Vec3): void;
        /**
         * Sets the linear velocity of the rigid body.
         */
        setLinearVelocity(linearVelocity: Vec3): void;
        /**
         * Returns the angular velocity of the rigid body.
         */
        getAngularVelocity(): Vec3;
        /**
         * Sets `angularVelocity` to the angular velocity of the rigid body.
         *
         * This does not create a new intrance of `Vec3`.
         */
        getAngularVelocityTo(angularVelocity: Vec3): void;
        /**
         * Sets the angular velocity of the rigid body.
         */
        setAngularVelocity(angularVelocity: Vec3): void;
        /**
         * Adds `linearVelocityChange` to the linear velcity of the rigid body.
         */
        addLinearVelocity(linearVelocityChange: Vec3): void;
        /**
         * Adds `angularVelocityChange` to the angular velcity of the rigid body.
         */
        addAngularVelocity(angularVelocityChange: Vec3): void;
        /**
         * Applies the impulse `impulse` to the rigid body at `positionInWorld` in world position.
         *
         * This changes both the linear velocity and the angular velocity.
         */
        applyImpulse(impulse: Vec3, positionInWorld: Vec3): void;
        /**
         * Applies the linear impulse `impulse` to the rigid body.
         *
         * This does not change the angular velocity.
         */
        applyLinearImpulse(impulse: Vec3): void;
        /**
         * Applies the angular impulse `impulse` to the rigid body.
         *
         * This does not change the linear velocity.
         */
        applyAngularImpulse(impulse: Vec3): void;
        /**
         * Applies the force `force` to `positionInWorld` in world position.
         */
        applyForce(force: Vec3, positionInWorld: Vec3): void;
        /**
         * Applies the force `force` to the center of mass.
         */
        applyForceToCenter(force: Vec3): void;
        /**
         * Applies the torque `torque`.
         */
        applyTorque(torque: Vec3): void;
        /**
         * Returns the total linear impulse applied by contact constraints.
         */
        getLinearContactImpulse(): Vec3;
        /**
         * Sets `linearContactImpulse` to the total linear impulse applied by contact constraints.
         *
         * This does not create a new instance of `Vec3`.
         */
        getLinearContactImpulseTo(linearContactImpulse: Vec3): void;
        /**
         * Returns the total angular impulse applied by contact constraints.
         */
        getAngularContactImpulse(): Vec3;
        /**
         * Sets `angularContactImpulse` to the total angular impulse applied by contact constraints.
         *
         * This does not create a new instance of `Vec3`.
         */
        getAngularContactImpulseTo(angularContactImpulse: Vec3): void;
        /**
         * Returns the gravity scaling factor of the rigid body.
         */
        getGravityScale(): number;
        /**
         * Sets the gravity scaling factor of the rigid body to `gravityScale`.
         *
         * If `0` is set, the rigid body will not be affected by gravity.
         */
        setGravityScale(gravityScale: number): void;
        /**
         * Returns the local coordinates of the point `worldPoint` in world coodinates.
         */
        getLocalPoint(worldPoint: Vec3): Vec3;
        /**
         * Sets `localPoint` to the local coordinates of the point `worldPoint` in world coodinates.
         *
         * This does not create a new instance of `Vec3`.
         */
        getLocalPointTo(worldPoint: Vec3, localPoint: Vec3): void;
        /**
         * Returns the local coordinates of the vector `worldVector` in world coodinates.
         */
        getLocalVector(worldVector: Vec3): Vec3;
        /**
         * Sets `localVector` to the local coordinates of the vector `worldVector` in world coodinates.
         *
         * This does not create a new instance of `Vec3`.
         */
        getLocalVectorTo(worldVector: Vec3, localVector: Vec3): void;
        /**
         * Returns the world coordinates of the point `localPoint` in local coodinates.
         */
        getWorldPoint(localPoint: Vec3): Vec3;
        /**
         * Sets `worldPoint` to the world coordinates of the point `localPoint` in local coodinates.
         *
         * This does not create a new instance of `Vec3`.
         */
        getWorldPointTo(localPoint: Vec3, worldPoint: Vec3): void;
        /**
         * Returns the world coordinates of the vector `localVector` in local coodinates.
         */
        getWorldVector(localVector: Vec3): Vec3;
        /**
         * Sets `worldVector` to the world coordinates of the vector `localVector` in local coodinates.
         *
         * This does not create a new instance of `Vec3`.
         */
        getWorldVectorTo(localVector: Vec3, worldVector: Vec3): void;
        /**
         * Returns the number of the shapes added.
         */
        getNumShapes(): number;
        /**
         * Returns the list of the shapes of the rigid body.
         */
        getShapeList(): Shape;
        /**
         * Returns the number of the contact lists the rigid body is involved.
         */
        getNumContactLinks(): number;
        /**
         * Returns the list of the contact links the rigid body is involved.
         */
        getContactLinkList(): ContactLink;
        /**
         * Returns the number of the joint links the rigid body is attached.
         */
        getNumJointLinks(): number;
        /**
         * Returns the list of the joint links the rigid body is attached.
         */
        getJointLinkList(): JointLink;
        /**
         * Adds the shape to the rigid body.
         */
        addShape(shape: Shape): void;
        /**
         * Removes the shape from the rigid body.
         */
        removeShape(shape: Shape): void;
        /**
         * Returns the rigid body's type of behaviour.
         *
         * See `RigidBodyType` class for details.
         */
        getType(): number;
        /**
         * Sets the rigid body's type of behaviour.
         *
         * See `RigidBodyType` class for details.
         */
        setType(type: number): void;
        /**
         * Sets the rigid body's sleep flag false.
         *
         * This also resets the sleeping timer of the rigid body.
         */
        wakeUp(): void;
        /**
         * Sets the rigid body's sleep flag true.
         *
         * This also resets the sleeping timer of the rigid body.
         */
        sleep(): void;
        /**
         * Returns whether the rigid body is sleeping.
         */
        isSleeping(): boolean;
        /**
         * Returns how long the rigid body is stopping moving. This returns `0` if the body
         * has already slept.
         */
        getSleepTime(): number;
        /**
         * Sets the rigid body's auto sleep flag.
         *
         * If auto sleep is enabled, the rigid body will automatically sleep when needed.
         */
        setAutoSleep(autoSleepEnabled: boolean): void;
        /**
         * Returns the linear damping.
         */
        getLinearDamping(): number;
        /**
         * Sets the linear damping to `damping`.
         */
        setLinearDamping(damping: number): void;
        /**
         * Returns the angular damping.
         */
        getAngularDamping(): number;
        /**
         * Sets the angular damping to `damping`.
         */
        setAngularDamping(damping: number): void;
        /**
         * Returns the previous rigid body in the world.
         *
         * If the previous one does not exist, `null` will be returned.
         */
        getPrev(): RigidBody;
        /**
         * Returns the next rigid body in the world.
         *
         * If the next one does not exist, `null` will be returned.
         */
        getNext(): RigidBody;
    }

    /**
 * A contact link is used to build a constraint graph for clustering rigid bodies.
 * In a constraint graph, rigid bodies are nodes and constraints are edges.
 * See also `JointLink`.
 */
    export class ContactLink {
        constructor();
        _prev: ContactLink;
        _next: ContactLink;
        _contact: Contact;
        _other: RigidBody;
        /**
         * Returns the contact of the link.
         */
        getContact(): Contact;
        /**
         * Returns the other rigid body of the link. This provides a quick access from a
         * rigid body to the other one of the 
         */
        getOther(): RigidBody;
        /**
         * Returns the previous contact link in the rigid body.
         *
         * If the previous one does not exist, `null` will be returned.
         */
        getPrev(): ContactLink;
        /**
         * Returns the next contact link in the rigid body.
         *
         * If the next one does not exist, `null` will be returned.
         */
        getNext(): ContactLink;
    }

    /**
 * Internal class.
 */
    export class ContactImpulse {
        constructor();
        impulseN: number;
        impulseT: number;
        impulseB: number;
        impulseP: number;
        impulseLX: number;
        impulseLY: number;
        impulseLZ: number;
        copyFrom(imp: ContactImpulse): void;
    }

    /**
     * A manifold point is a contact point in a contact manifold. This holds detailed collision
     * data (position, overlap depth, impulse, etc...) for collision response.
     */
    export class ManifoldPoint {
        constructor();
        _localPos1X: number;
        _localPos1Y: number;
        _localPos1Z: number;
        _localPos2X: number;
        _localPos2Y: number;
        _localPos2Z: number;
        _relPos1X: number;
        _relPos1Y: number;
        _relPos1Z: number;
        _relPos2X: number;
        _relPos2Y: number;
        _relPos2Z: number;
        _pos1X: number;
        _pos1Y: number;
        _pos1Z: number;
        _pos2X: number;
        _pos2Y: number;
        _pos2Z: number;
        _depth: number;
        _impulse: ContactImpulse;
        _warmStarted: boolean;
        _disabled: boolean;
        _id: number;
        /**
         * Returns the first rigid body's manifold point in world coordinate.
         */
        getPosition1(): Vec3;
        /**
         * Sets `position` to the first rigid body's manifold point in world coordinate.
         * This does not create a new instance of `Vec3`.
         */
        getPosition1To(position: Vec3): void;
        /**
         * Returns the second rigid body's manifold point in world coordinate.
         */
        getPosition2(): Vec3;
        /**
         * Sets `position` to the second rigid body's manifold point in world coordinate.
         * This does not create a new instance of `Vec3`.
         */
        getPosition2To(position: Vec3): void;
        /**
         * Returns the amount of the overlap. If the manifold point is separate, a negative
         * value is returned.
         */
        getDepth(): number;
        /**
         * Returns whether the manifold point has existed for more than two steps.
         */
        isWarmStarted(): boolean;
        /**
         * Returns the normal impulse of the manifold point.
         */
        getNormalImpulse(): number;
        /**
         * Returns the tangent impulse of the manifold point.
         */
        getTangentImpulse(): number;
        /**
         * Returns the binormal impulse of the manifold point.
         */
        getBinormalImpulse(): number;
        /**
         * Returns whether the manifold point is enabled.
         */
        isEnabled(): boolean;
    }

    /**
 * A contact manifold holds collision data of a pair of shapes.
 */
    export class Manifold {
        constructor();
        _normalX: number;
        _normalY: number;
        _normalZ: number;
        _tangentX: number;
        _tangentY: number;
        _tangentZ: number;
        _binormalX: number;
        _binormalY: number;
        _binormalZ: number;
        _numPoints: number;
        _points: ManifoldPoint[];
        _clear(): void;
        _buildBasis(normal: Vec3): void;
        _updateDepthsAndPositions(tf1: Transform, tf2: Transform): void;
        /**
         * Returns the normal vector of the contact manifold. The normal vector has unit
         * length and is perpendicular to the contact plane.
         */
        getNormal(): Vec3;
        /**
         * Sets `normal` to the normal vector of the contact manifold. The normal vector has
         * unit length and is perpendicular to the contact plane.
         *
         * This does not create a new instance of `Vec3`.
         */
        getNormalTo(normal: Vec3): void;
        /**
         * Returns the tangent vector of the contact manifold. The tangent vector has unit
         * length and is perpendicular to the normal vector.
         */
        getTangent(): Vec3;
        /**
         * Sets `tangent` to the tangent vector of the contact manifold. The tangent vector has
         * unit length and is perpendicular to the normal vector.
         *
         * This does not create a new instance of `Vec3`.
         */
        getTangentTo(tangent: Vec3): void;
        /**
         * Returns the binormal vector of the contact manifold. The binormal vector has unit
         * length and is perpendicular to both the normal and the tangent vector.
         */
        getBinormal(): Vec3;
        /**
         * Sets `binormal` to the binormal vector of the contact manifold. The binormal vector has
         * unit length and is perpendicular to both the normal and the tangent vector.
         *
         * This does not create a new instance of `Vec3`.
         */
        getBinormalTo(binormal: Vec3): void;
        /**
         * Returns the manifold point vector of the contact manifold. Note that **only the first
         * `Manifold.getNumPoints` elements of the vector are in use**, and the manifold points may
         * be disabled (see `ManifoldPoint.isEnabled`).
         */
        getPoints(): ManifoldPoint[];
        /**
         * Returns the number of existing manifold points.
         */
        getNumPoints(): number;
    }

    /**
 * Internal class
 */
    export class ManifoldUpdater {
        constructor(manifold: Manifold);
        totalUpdate(result: DetectorResult, tf1: Transform, tf2: Transform): void;
        incrementalUpdate(result: DetectorResult, tf1: Transform, tf2: Transform): void;
    }

    /**
 * Internal class.
 */
    export class ContactSolverInfoRow {
        constructor();
        /**
         * Used for both velocity and position 
         */
        jacobianN: JacobianRow;
        /**
         * Used for velocity 
         */
        jacobianT: JacobianRow;
        /**
         * Used for velocity 
         */
        jacobianB: JacobianRow;
        /**
         * Used for both velocity and position 
         */
        rhs: number;
        /**
         * Used for velocity 
         */
        cfm: number;
        /**
         * Used for velocity 
         */
        friction: number;
        /**
         * Used for both velocity and position 
         */
        impulse: ContactImpulse;
    }

    /**
 * Internal class.
 */
    export class ContactSolverInfo {
        constructor();
        b1: RigidBody;
        b2: RigidBody;
        numRows: number;
        rows: ContactSolverInfoRow[];
    }

    /**
 * A contact constraint provides collision information for a contact constraint 
 * This holds a contact manifold, which has some contact points, contact normals, and
 * contact impulses. See `Manifold` for more information.
 */
    export class ContactConstraint {
        constructor(manifold: Manifold);
        _positionCorrectionAlgorithm: number;
        _manifold: Manifold;
        _s1: Shape;
        _s2: Shape;
        _tf1: Transform;
        _tf2: Transform;
        _invM1: number;
        _invM2: number;
        _friction: number;
        _restitution: number;
        _invI100: number;
        _invI101: number;
        _invI102: number;
        _invI110: number;
        _invI111: number;
        _invI112: number;
        _invI120: number;
        _invI121: number;
        _invI122: number;
        _invI200: number;
        _invI201: number;
        _invI202: number;
        _invI210: number;
        _invI211: number;
        _invI212: number;
        _invI220: number;
        _invI221: number;
        _invI222: number;
        _b1: RigidBody;
        _b2: RigidBody;
        _solver: ConstraintSolver;
        _getVelocitySolverInfo(timeStep: TimeStep, info: ContactSolverInfo): void;
        _getPositionSolverInfo(info: ContactSolverInfo): void;
        _syncManifold(): void;
        /**
         * Returns the first shape of the 
         */
        getShape1(): Shape;
        /**
         * Returns the second shape of the 
         */
        getShape2(): Shape;
        /**
         * Returns the contact manifold.
         */
        getManifold(): Manifold;
        /**
         * Returns whether the two rigid bodies are touching.
         */
        isTouching(): boolean;
    }

    /**
 * A contact is a cached pair of overlapping shapes in the physics world. contacts
 * are created by `ContactManager` when two AABBs of shapes begin overlapping.
 *
 * As AABBs are larger than its shapes, shapes of a contact don't always
 * touching or colliding though their AABBs are overlapping.
 */
    export class Contact {
        constructor();
        _next: Contact;
        _prev: Contact;
        _link1: ContactLink;
        _link2: ContactLink;
        _s1: Shape;
        _s2: Shape;
        _b1: RigidBody;
        _b2: RigidBody;
        _detector: Detector;
        _cachedDetectorData: CachedDetectorData;
        _detectorResult: DetectorResult;
        _latest: boolean;
        _shouldBeSkipped: boolean;
        _manifold: Manifold;
        _updater: ManifoldUpdater;
        _contactConstraint: ContactConstraint;
        _touching: boolean;
        _updateManifold(): void;
        _postSolve(): void;
        /**
         * Returns the first shape of the 
         */
        getShape1(): Shape;
        /**
         * Returns the second shape of the 
         */
        getShape2(): Shape;
        /**
         * Returns whether the shapes are touching.
         */
        isTouching(): boolean;
        /**
         * Returns the contact manifold.
         */
        getManifold(): Manifold;
        /**
         * Returns the contact 
         */
        getContactConstraint(): ContactConstraint;
        /**
         * Returns the previous contact in the world.
         *
         * If the previous contact does not exist, `null` will be returned.
         */
        getPrev(): Contact;
        /**
         * Returns the next contact in the world.
         *
         * If the next contact does not exist, `null` will be returned.
         */
        getNext(): Contact;
    }

    /**
 * Simulation island.
 */
    export class Island {
        constructor();
        _clear(): void;
        _addRigidBody(rigidBody: RigidBody): void;
        _addConstraintSolver(solver: ConstraintSolver, positionCorrection: number): void;
        _stepSingleRigidBody(timeStep: TimeStep, rb: RigidBody): void;
        _step(timeStep: TimeStep, numVelocityIterations: number, numPositionIterations: number): void;
    }

    /**
     * A ray cast callback implementation that keeps only the closest hit data.
     * This is reusable, but make sure to clear the old result by calling
     * `RayCastClosest.clear` if used once or more before.
     */
    export class RayCastClosest extends RayCastCallback {
        /**
         * Default constructor.
         */
        constructor();
        /**
         * The shape the ray hit.
         */
        shape: Shape;
        /**
         * The position the ray hit at.
         */
        position: Vec3;
        /**
         * The normal vector of the surface the ray hit.
         */
        normal: Vec3;
        /**
         * The ratio of the position the ray hit from the start point to the end point.
         */
        fraction: number;
        /**
         * Whether the ray hit any shape in the world.
         */
        hit: boolean;
        /**
         * Clears the result data.
         */
        clear(): void;
        process(shape: Shape, hit: RayCastHit): void;
    }

    /**
 * Performance
 */
    export class Performance {
        protected constructor();
        static broadPhaseCollisionTime: number;
        static narrowPhaseCollisionTime: number;
        static dynamicsTime: number;
        static totalTime: number;
    }

    /**
 * The list of the algorithms for position corretion.
 */
    export class PositionCorrectionAlgorithm {
        protected constructor();
        static readonly _BAUMGARTE: number;
        static readonly _SPLIT_IMPULSE: number;
        static readonly _NGS: number;
        /**
         * Baumgarte stabilizaiton. Fastest but introduces extra energy.
         */
        static readonly BAUMGARTE: number;
        /**
         * Use split impulse and pseudo velocity. Fast enough and does not introduce extra
         * energy, but somewhat unstable, especially for joints.
         */
        static readonly SPLIT_IMPULSE: number;
        /**
         * Nonlinear Gauss-Seidel method. Slow but stable.
         */
        static readonly NGS: number;
    }

    /**
 * Internal class
 */
    export class BasisTracker {
        constructor(joint: Joint);
        xX: number;
        xY: number;
        xZ: number;
        yX: number;
        yY: number;
        yZ: number;
        zX: number;
        zY: number;
        zZ: number;
    }

    /**
 * Translational limits and motor settings of a 
 */
    export class TranslationalLimitMotor {
        /**
         * Default constructor.
         */
        constructor();
        /**
         * The lower bound of the limit in usually meters.
         *
         * The limit is disabled if `lowerLimit > upperLimit`.
         */
        lowerLimit: number;
        /**
         * The upper bound of the limit in usually meters.
         *
         * The limit is disabled if `lowerLimit > upperLimit`.
         */
        upperLimit: number;
        /**
         * The target speed of the motor in usually meters per second.
         */
        motorSpeed: number;
        /**
         * The maximum force of the motor in usually newtons.
         *
         * The motor is disabled if `motorForce <= 0`.
         */
        motorForce: number;
        /**
         * Sets limit properties at once and returns `this`.
         * `this.lowerLimit` is set to `lower`, and `this.upperLimit` is set to `upper`.
         */
        setLimits(lower: number, upper: number): TranslationalLimitMotor;
        /**
         * Sets motor properties at once and returns `this`.
         * `this.motorSpeed` is set to `speed`, and `this.motorForce` is set to `force`.
         */
        setMotor(speed: number, force: number): TranslationalLimitMotor;
        /**
         * Returns a clone of the object.
         */
        clone(): TranslationalLimitMotor;
    }

    /**
 * Spring and damper settings of a 
 */
    export class SpringDamper {
        /**
         * Default constructor.
         */
        constructor();
        /**
         * The frequency of the spring in Hz.
         * Set `0.0` to disable the spring and make the constraint totally rigid.
         */
        frequency: number;
        /**
         * The damping ratio of the 
         * Set `1.0` to make the constraint critically dumped.
         */
        dampingRatio: number;
        /**
         * Whether to use symplectic Euler method instead of implicit Euler method, to numarically integrate the 
         * Note that symplectic Euler method conserves energy better than implicit Euler method does, but the constraint will be
         * unstable under the high frequency.
         */
        useSymplecticEuler: boolean;
        /**
         * Sets spring and damper parameters at once and returns `this`.
         * `this.frequency` is set to `frequency`, and `this.dampingRatio` is set to `dampingRatio`.
         */
        setSpring(frequency: number, dampingRatio: number): SpringDamper;
        setSymplecticEuler(useSymplecticEuler: boolean): SpringDamper;
        /**
         * Returns a clone of the object.
         */
        clone(): SpringDamper;
    }

    /**
 * Rotational limits and motor settings of a 
 */
    export class RotationalLimitMotor {
        /**
         * Default constructor.
         */
        constructor();
        /**
         * The lower bound of the limit in radians.
         *
         * The limit is disabled if `lowerLimit > upperLimit`.
         */
        lowerLimit: number;
        /**
         * The upper bound of the limit in radians.
         *
         * The limit is disabled if `lowerLimit > upperLimit`.
         */
        upperLimit: number;
        /**
         * The target speed of the motor in usually radians per second.
         */
        motorSpeed: number;
        /**
         * The maximum torque of the motor in usually newton meters.
         *
         * The motor is disabled if `motorTorque <= 0`.
         */
        motorTorque: number;
        /**
         * Sets limit properties at once and returns `this`.
         * `this.lowerLimit` is set to `lower`, and `this.upperLimit` is set to `upper`.
         */
        setLimits(lower: number, upper: number): RotationalLimitMotor;
        /**
         * Sets motor properties at once and returns `this`.
         * `this.motorSpeed` is set to `speed`, and `this.motorTorque` is set to `torque`.
         */
        setMotor(speed: number, torque: number): RotationalLimitMotor;
        /**
         * Returns a clone of the object.
         */
        clone(): RotationalLimitMotor;
    }

    /**
 * A cylindrical joint config is used for constructions of cylindrical joints.
 */
    export class CylindricalJointConfig extends JointConfig {
        /**
         * Default constructor.
         */
        constructor();
        /**
         * The first body's local constraint axis.
         */
        localAxis1: Vec3;
        /**
         * The second body's local constraint axis.
         */
        localAxis2: Vec3;
        /**
         * The translational limit and motor along the constraint axis of the 
         */
        translationalLimitMotor: TranslationalLimitMotor;
        /**
         * The translational spring and damper along constraint the axis of the 
         */
        translationalSpringDamper: SpringDamper;
        /**
         * The rotational limit and motor along the constraint axis of the 
         */
        rotationalLimitMotor: RotationalLimitMotor;
        /**
         * The rotational spring and damper along the constraint axis of the 
         */
        rotationalSpringDamper: SpringDamper;
        /**
         * Sets rigid bodies, local anchors from the world anchor `worldAnchor`, local axes
         * from the world axis `worldAxis`, and returns `this`.
         */
        init(rigidBody1: RigidBody, rigidBody2: RigidBody, worldAnchor: Vec3, worldAxis: Vec3): CylindricalJointConfig;
    }

    /**
 * A cylindrical joint constrains two rigid bodies to share their constraint
 * axes, and restricts relative translation and rotation onto the constraint
 * axis. This joint provides two degrees of freedom. You can enable lower and
 * upper limits, motors, spring and damper effects of both translation and
 * rotation part of the 
 */
    export class CylindricalJoint extends Joint {
        /**
         * Creates a new cylindrical joint by configuration `config`.
         */
        constructor(config: CylindricalJointConfig);
        _translSd: SpringDamper;
        _translLm: TranslationalLimitMotor;
        _rotSd: SpringDamper;
        _rotLm: RotationalLimitMotor;
        _basis: BasisTracker;
        _syncAnchors(): void;
        _getVelocitySolverInfo(timeStep: TimeStep, info: JointSolverInfo): void;
        _getPositionSolverInfo(info: JointSolverInfo): void;
        /**
         * Returns the first rigid body's constraint axis in world coordinates.
         */
        getAxis1(): Vec3;
        /**
         * Returns the second rigid body's constraint axis in world coordinates.
         */
        getAxis2(): Vec3;
        /**
         * Sets `axis` to the first rigid body's constraint axis in world coordinates.
         *
         * This does not create a new instance of `Vec3`.
         */
        getAxis1To(axis: Vec3): void;
        /**
         * Sets `axis` to the second rigid body's constraint axis in world coordinates.
         *
         * This does not create a new instance of `Vec3`.
         */
        getAxis2To(axis: Vec3): void;
        /**
         * Returns the first rigid body's constraint axis relative to the rigid body's transform.
         */
        getLocalAxis1(): Vec3;
        /**
         * Returns the second rigid body's constraint axis relative to the rigid body's transform.
         */
        getLocalAxis2(): Vec3;
        /**
         * Sets `axis` to the first rigid body's constraint axis relative to the rigid body's transform.
         *
         * This does not create a new instance of `Vec3`.
         */
        getLocalAxis1To(axis: Vec3): void;
        /**
         * Sets `axis` to the second rigid body's constraint axis relative to the rigid body's transform.
         *
         * This does not create a new instance of `Vec3`.
         */
        getLocalAxis2To(axis: Vec3): void;
        /**
         * Returns the translational spring and damper settings.
         */
        getTranslationalSpringDamper(): SpringDamper;
        /**
         * Returns the rotational spring and damper settings.
         */
        getRotationalSpringDamper(): SpringDamper;
        /**
         * Returns the translational limits and motor settings.
         */
        getTranslationalLimitMotor(): TranslationalLimitMotor;
        /**
         * Returns the rotational limits and motor settings.
         */
        getRotationalLimitMotor(): RotationalLimitMotor;
        /**
         * Returns the rotation angle in radians.
         */
        getAngle(): number;
        /**
         * Returns the translation of the 
         */
        getTranslation(): number;
    }

    /**
     * A generic joint config is used for constructions of generic joints.
     */
    export class GenericJointConfig extends JointConfig {
        /**
         * Default constructor.
         */
        constructor();
        /**
         * The first body's local constraint basis.
         */
        localBasis1: Mat3;
        /**
         * The second body's local constraint basis.
         */
        localBasis2: Mat3;
        /**
         * The translational limits and motors along the first body's the constraint basis.
         */
        translationalLimitMotors: TranslationalLimitMotor[];
        /**
         * The translational springs and dampers along the first body's constraint basis.
         */
        translationalSpringDampers: SpringDamper[];
        /**
         * The rotational limits and motors along the rotation axes of the relative x-y-z Euler angles.
         */
        rotationalLimitMotors: RotationalLimitMotor[];
        /**
         * The rotational springs and dampers along the rotation axes of the relative x-y-z Euler angles.
         */
        rotationalSpringDampers: SpringDamper[];
        /**
         * Sets rigid bodies, local anchors from the world anchor `worldAnchor`, local bases
         * from the world bases `worldBasis1` and `worldBasis2`, and returns `this`.
         */
        init(rigidBody1: RigidBody, rigidBody2: RigidBody, worldAnchor: Vec3, worldBasis1: Mat3, worldBasis2: Mat3): GenericJointConfig;
    }

    /**
 * A generic joint (a.k.a. 6-DoF joint) constrains two rigid bodies in
 * highly flexible way, so that every translational and rotational axis
 * can be locked, unlocked, springy, or powered by a motor like other
 * joints. Note that rotation angles are measured as x-y-z Euler angles,
 * not as z-x-z Euler angles.
 */
    export class GenericJoint extends Joint {
        /**
         * Creates a new generic joint by configuration `config`.
         */
        constructor(config: GenericJointConfig);
        _translSds: SpringDamper[];
        _rotSds: SpringDamper[];
        _translLms: TranslationalLimitMotor[];
        _rotLms: RotationalLimitMotor[];
        _axisXX: number;
        _axisXY: number;
        _axisXZ: number;
        _axisYX: number;
        _axisYY: number;
        _axisYZ: number;
        _axisZX: number;
        _axisZY: number;
        _axisZZ: number;
        _angleX: number;
        _angleY: number;
        _angleZ: number;
        _syncAnchors(): void;
        _getVelocitySolverInfo(timeStep: TimeStep, info: JointSolverInfo): void;
        _getPositionSolverInfo(info: JointSolverInfo): void;
        /**
         * Returns the first (x) rotation axis of the relative Euler angles.
         */
        getAxisX(): Vec3;
        /**
         * Returns the second (y) rotation axis of the relative Euler angles.
         */
        getAxisY(): Vec3;
        /**
         * Returns the third (z) rotation axis of the relative Euler angles.
         */
        getAxisZ(): Vec3;
        /**
         * Returns the translational spring and damper settings along the first body's constraint basis.
         */
        getTranslationalSpringDampers(): SpringDamper[];
        /**
         * Returns the rotational spring and damper settings along the rotation axes of the relative x-y-z Euler angles.
         */
        getRotationalSpringDampers(): SpringDamper[];
        /**
         * Returns the translational limits and motor settings along the first body's constraint basis.
         */
        getTranslationalLimitMotors(): TranslationalLimitMotor[];
        /**
         * Returns the rotational limits and motor settings along the rotation axes of the relative x-y-z Euler angles.
         */
        getRotationalLimitMotors(): RotationalLimitMotor[];
        /**
         * Returns the relative x-y-z Euler angles.
         */
        getAngles(): Vec3;
        /**
         * Returns the translations along the first rigid body's constraint basis.
         */
        getTranslations(): Vec3;
    }

    export class JointMacro {
        protected constructor();
    }

    /**
     * The list of the types of the joints.
     */
    export class JointType {
        protected constructor();
        static readonly _SPHERICAL: number;
        static readonly _REVOLUTE: number;
        static readonly _CYLINDRICAL: number;
        static readonly _PRISMATIC: number;
        static readonly _UNIVERSAL: number;
        static readonly _RAGDOLL: number;
        static readonly _GENERIC: number;
        /**
         * Represents a spherical 
         *
         * See `SphericalJoint` for details.
         */
        static readonly SPHERICAL: number;
        /**
         * Represents a revolute 
         *
         * See `RevoluteJoint` for details.
         */
        static readonly REVOLUTE: number;
        /**
         * Represents a cylindrical 
         *
         * See `CylindricalJoint` for details.
         */
        static readonly CYLINDRICAL: number;
        /**
         * Represents a prismatic 
         *
         * See `PrismaticJoint` for details.
         */
        static readonly PRISMATIC: number;
        /**
         * Represents a universal 
         *
         * See `UniversalJoint` for details.
         */
        static readonly UNIVERSAL: number;
        /**
         * Represents a ragdoll 
         *
         * See `RagdollJoint` for details.
         */
        static readonly RAGDOLL: number;
        /**
         * Represents a generic 
         *
         * See `GenericJoint` for details.
         */
        static readonly GENERIC: number;
    }

    /**
     * A prismatic joint config is used for constructions of prismatic joints.
     */
    export class PrismaticJointConfig extends JointConfig {
        /**
         * Default constructor.
         */
        constructor();
        /**
         * The first body's local constraint axis.
         */
        localAxis1: Vec3;
        /**
         * The second body's local constraint axis.
         */
        localAxis2: Vec3;
        /**
         * The translational limit and motor along the constraint axis of the 
         */
        limitMotor: TranslationalLimitMotor;
        /**
         * The translational spring and damper along the constraint axis of the 
         */
        springDamper: SpringDamper;
        /**
         * Sets rigid bodies, local anchors from the world anchor `worldAnchor`, local axes
         * from the world axis `worldAxis`, and returns `this`.
         */
        init(rigidBody1: RigidBody, rigidBody2: RigidBody, worldAnchor: Vec3, worldAxis: Vec3): PrismaticJointConfig;
    }

    /**
     * A prismatic joint (a.k.a. slider joint) constrains two rigid bodies to
     * share their anchor points and constraint axes, and restricts relative
     * translation onto the constraint axis. This joint provides one degree of
     * freedom. You can enable lower and upper limits, a motor, a spring and
     * damper effect of the translational part of the 
     */
    export class PrismaticJoint extends Joint {
        /**
         * Creates a new prismatic joint by configuration `config`.
         */
        constructor(config: PrismaticJointConfig);
        _sd: SpringDamper;
        _lm: TranslationalLimitMotor;
        _basis: BasisTracker;
        _syncAnchors(): void;
        _getVelocitySolverInfo(timeStep: TimeStep, info: JointSolverInfo): void;
        _getPositionSolverInfo(info: JointSolverInfo): void;
        /**
         * Returns the first rigid body's constraint axis in world coordinates.
         */
        getAxis1(): Vec3;
        /**
         * Returns the second rigid body's constraint axis in world coordinates.
         */
        getAxis2(): Vec3;
        /**
         * Sets `axis` to the first rigid body's constraint axis in world coordinates.
         *
         * This does not create a new instance of `Vec3`.
         */
        getAxis1To(axis: Vec3): void;
        /**
         * Sets `axis` to the second rigid body's constraint axis in world coordinates.
         *
         * This does not create a new instance of `Vec3`.
         */
        getAxis2To(axis: Vec3): void;
        /**
         * Returns the first rigid body's constraint axis relative to the rigid body's transform.
         */
        getLocalAxis1(): Vec3;
        /**
         * Returns the second rigid body's constraint axis relative to the rigid body's transform.
         */
        getLocalAxis2(): Vec3;
        /**
         * Sets `axis` to the first rigid body's constraint axis relative to the rigid body's transform.
         *
         * This does not create a new instance of `Vec3`.
         */
        getLocalAxis1To(axis: Vec3): void;
        /**
         * Sets `axis` to the second rigid body's constraint axis relative to the rigid body's transform.
         *
         * This does not create a new instance of `Vec3`.
         */
        getLocalAxis2To(axis: Vec3): void;
        /**
         * Returns the translational spring and damper settings.
         */
        getSpringDamper(): SpringDamper;
        /**
         * Returns the translational limits and motor settings.
         */
        getLimitMotor(): TranslationalLimitMotor;
        /**
         * Returns the translation of the 
         */
        getTranslation(): number;
    }

    /**
 * A ragdoll joint config is used for constructions of ragdoll joints.
 */
    export class RagdollJointConfig extends JointConfig {
        /**
         * Default constructor.
         */
        constructor();
        /**
         * The first body's local twist axis.
         */
        localTwistAxis1: Vec3;
        /**
         * The second body's local twist axis.
         */
        localTwistAxis2: Vec3;
        /**
         * The first body's local swing axis.
         *
         * The second swing axis is also attached to the first body. It is perpendicular to the first swing
         * axis, and is automatically computed when the joint is created.
         */
        localSwingAxis1: Vec3;
        /**
         * The rotational spring and damper along the twist axis of the 
         */
        twistSpringDamper: SpringDamper;
        /**
         * The rotational limit and motor along the twist axis of the 
         */
        twistLimitMotor: RotationalLimitMotor;
        /**
         * The rotational spring and damper along the swing axis of the 
         */
        swingSpringDamper: SpringDamper;
        /**
         * The max angle of rotation along the first swing axis.
         * This value must be positive.
         */
        maxSwingAngle1: number;
        /**
         * The max angle of rotation along the second swing axis.
         * This value must be positive.
         */
        maxSwingAngle2: number;
        /**
         * Sets rigid bodies, local anchors from the world anchor `worldAnchor`, local twist axes
         * from the world twist axis `worldTwistAxis`, local swing axis from the world swing axis
         * `worldSwingAxis`, and returns `this`.
         */
        init(rigidBody1: RigidBody, rigidBody2: RigidBody, worldAnchor: Vec3, worldTwistAxis: Vec3, worldSwingAxis: Vec3): RagdollJointConfig;
    }

    /**
         * A ragdoll joint is designed to simulate ragdoll's limbs. It constrains
         * swing and twist angles between two rigid bodies. The two rigid bodies
         * have constraint axes, and the swing angle is defined by the angle of
         * two constraint axes, while the twist angle is defined by the rotation
         * angle along the two axes. In addition to lower and upper limits of the
         * twist angle, You can set an "elliptic cone limit" of the swing angle
         * by specifying two swing axes (though one of them is automatically
         * computed) and corresponding maximum swing angles. You can also enable a
         * motor of the twist part of the constraint, spring and damper effect of
         * the both swing and twist part of the 
         */
    export class RagdollJoint extends Joint {
        /**
         * Creates a new ragdoll joint by configuration `config`.
         */
        constructor(config: RagdollJointConfig);
        _twistSd: SpringDamper;
        _swingSd: SpringDamper;
        _twistLm: RotationalLimitMotor;
        _maxSwingAngle1: number;
        _maxSwingAngle2: number;
        _swingAngle: number;
        _twistAngle: number;
        _syncAnchors(): void;
        _getVelocitySolverInfo(timeStep: TimeStep, info: JointSolverInfo): void;
        _getPositionSolverInfo(info: JointSolverInfo): void;
        /**
         * Returns the first rigid body's constraint axis in world coordinates.
         */
        getAxis1(): Vec3;
        /**
         * Returns the second rigid body's constraint axis in world coordinates.
         */
        getAxis2(): Vec3;
        /**
         * Sets `axis` to the first rigid body's constraint axis in world coordinates.
         *
         * This does not create a new instance of `Vec3`.
         */
        getAxis1To(axis: Vec3): void;
        /**
         * Sets `axis` to the second rigid body's constraint axis in world coordinates.
         *
         * This does not create a new instance of `Vec3`.
         */
        getAxis2To(axis: Vec3): void;
        /**
         * Returns the first rigid body's constraint axis relative to the rigid body's transform.
         */
        getLocalAxis1(): Vec3;
        /**
         * Returns the second rigid body's constraint axis relative to the rigid body's transform.
         */
        getLocalAxis2(): Vec3;
        /**
         * Sets `axis` to the first rigid body's constraint axis relative to the rigid body's transform.
         *
         * This does not create a new instance of `Vec3`.
         */
        getLocalAxis1To(axis: Vec3): void;
        /**
         * Sets `axis` to the second rigid body's constraint axis relative to the rigid body's transform.
         *
         * This does not create a new instance of `Vec3`.
         */
        getLocalAxis2To(axis: Vec3): void;
        /**
         * Returns the rotational spring and damper settings along the twist axis.
         */
        getTwistSpringDamper(): SpringDamper;
        /**
         * Returns the rotational limits and motor settings along the twist axis.
         */
        getTwistLimitMotor(): RotationalLimitMotor;
        /**
         * Returns the rotational spring and damper settings along the swing axis.
         */
        getSwingSpringDamper(): SpringDamper;
        /**
         * Returns the swing axis in world coordinates.
         */
        getSwingAxis(): Vec3;
        /**
         * Sets `axis` to the swing axis in world coordinates.
         *
         * This does not create a new instance of `Vec3`.
         */
        getSwingAxisTo(axis: Vec3): void;
        /**
         * Returns the swing angle in radians.
         */
        getSwingAngle(): number;
        /**
         * Returns the twist angle in radians.
         */
        getTwistAngle(): number;
    }

    /**
         * A revolute joint config is used for constructions of revolute joints.
         */
    export class RevoluteJointConfig extends JointConfig {
        /**
         * Default constructor.
         */
        constructor();
        /**
         * The first body's local constraint axis.
         */
        localAxis1: Vec3;
        /**
         * The second body's local constraint axis.
         */
        localAxis2: Vec3;
        /**
         * The rotational spring and damper settings.
         */
        springDamper: SpringDamper;
        /**
         * The rotational limits and motor settings.
         */
        limitMotor: RotationalLimitMotor;
        /**
         * Sets rigid bodies, local anchors from the world anchor `worldAnchor`, local axes
         * from the world axis `worldAxis`, and returns `this`.
         */
        init(rigidBody1: RigidBody, rigidBody2: RigidBody, worldAnchor: Vec3, worldAxis: Vec3): RevoluteJointConfig;
    }

    /**
     * A revolute joint (a.k.a. hinge joint) constrains two rigid bodies to share
     * their anchor points and constraint axes, and restricts relative rotation onto
     * the constraint axis. This joint provides one degree of freedom. You can enable
     * lower and upper limits, a motor, a spring and damper effect of the rotational
     * part of the 
     */
    export class RevoluteJoint extends Joint {
        /**
         * Creates a new revolute joint by configuration `config`.
         */
        constructor(config: RevoluteJointConfig);
        _sd: SpringDamper;
        _lm: RotationalLimitMotor;
        _basis: BasisTracker;
        _syncAnchors(): void;
        _getVelocitySolverInfo(timeStep: TimeStep, info: JointSolverInfo): void;
        _getPositionSolverInfo(info: JointSolverInfo): void;
        /**
         * Returns the first rigid body's constraint axis in world coordinates.
         */
        getAxis1(): Vec3;
        /**
         * Returns the second rigid body's constraint axis in world coordinates.
         */
        getAxis2(): Vec3;
        /**
         * Sets `axis` to the first rigid body's constraint axis in world coordinates.
         *
         * This does not create a new instance of `Vec3`.
         */
        getAxis1To(axis: Vec3): void;
        /**
         * Sets `axis` to the second rigid body's constraint axis in world coordinates.
         *
         * This does not create a new instance of `Vec3`.
         */
        getAxis2To(axis: Vec3): void;
        /**
         * Returns the first rigid body's constraint axis relative to the rigid body's transform.
         */
        getLocalAxis1(): Vec3;
        /**
         * Returns the second rigid body's constraint axis relative to the rigid body's transform.
         */
        getLocalAxis2(): Vec3;
        /**
         * Sets `axis` to the first rigid body's constraint axis relative to the rigid body's transform.
         *
         * This does not create a new instance of `Vec3`.
         */
        getLocalAxis1To(axis: Vec3): void;
        /**
         * Sets `axis` to the second rigid body's constraint axis relative to the rigid body's transform.
         *
         * This does not create a new instance of `Vec3`.
         */
        getLocalAxis2To(axis: Vec3): void;
        /**
         * Returns the rotational spring and damper settings.
         */
        getSpringDamper(): SpringDamper;
        /**
         * Returns the rotational limits and motor settings.
         */
        getLimitMotor(): RotationalLimitMotor;
        /**
         * Returns the rotation angle in radians.
         */
        getAngle(): number;
    }

    /**
         * A spherical joint config is used for constructions of spherical joints.
         */
    export class SphericalJointConfig extends JointConfig {
        /**
         * Default constructor.
         */
        constructor();
        /**
         * The spring and damper setting of the 
         */
        springDamper: SpringDamper;
        /**
         * Sets rigid bodies, local anchors from the world anchor `worldAnchor`, and returns `this`.
         */
        init(rigidBody1: RigidBody, rigidBody2: RigidBody, worldAnchor: Vec3): SphericalJointConfig;
    }

    /**
     * A spherical joint (a.k.a. ball and socket joint) constrains two rigid bodies to share
     * their anchor points. This joint provides three degrees of freedom. You can enable a
     * spring and damper effect of the 
     */
    export class SphericalJoint extends Joint {
        /**
         * Creates a new spherical joint by configuration `config`.
         */
        constructor(config: SphericalJointConfig);
        _sd: SpringDamper;
        _getVelocitySolverInfo(timeStep: TimeStep, info: JointSolverInfo): void;
        _getPositionSolverInfo(info: JointSolverInfo): void;
        /**
         * Returns the spring and damper settings.
         */
        getSpringDamper(): SpringDamper;
    }

    /**
     * A universal joint config is used for constructions of universal joints.
     */
    export class UniversalJointConfig extends JointConfig {
        /**
         * Default constructor.
         */
        constructor();
        /**
         * The first body's local constraint axis.
         */
        localAxis1: Vec3;
        /**
         * The second body's local constraint axis.
         */
        localAxis2: Vec3;
        /**
         * The rotational spring and damper along the first body's constraint axis.
         */
        springDamper1: SpringDamper;
        /**
         * The rotational spring and damper along the second body's constraint axis.
         */
        springDamper2: SpringDamper;
        /**
         * The rotational limit and motor along the first body's constraint axis.
         */
        limitMotor1: RotationalLimitMotor;
        /**
         * The rotational limit and motor along the second body's constraint axis.
         */
        limitMotor2: RotationalLimitMotor;
        /**
         * Sets rigid bodies, local anchors from the world anchor `worldAnchor`, local axes
         * from the world axes `worldAxis1` and `worldAxis2`, and returns `this`.
         */
        init(rigidBody1: RigidBody, rigidBody2: RigidBody, worldAnchor: Vec3, worldAxis1: Vec3, worldAxis2: Vec3): UniversalJointConfig;
    }

    /**
     * A universal joint constrains two rigid bodies' constraint axes to be perpendicular
     * to each other. Rigid bodies can rotate along their constraint axes, but cannot along
     * the direction perpendicular to two constraint axes. This joint provides two degrees
     * of freedom. You can enable lower and upper limits, motors, spring and damper effects
     * of the two rotational constraints.
     */
    export class UniversalJoint extends Joint {
        /**
         * Creates a new universal joint by configuration `config`.
         */
        constructor(config: UniversalJointConfig);
        _sd1: SpringDamper;
        _sd2: SpringDamper;
        _lm1: RotationalLimitMotor;
        _lm2: RotationalLimitMotor;
        _axisXX: number;
        _axisXY: number;
        _axisXZ: number;
        _axisYX: number;
        _axisYY: number;
        _axisYZ: number;
        _axisZX: number;
        _axisZY: number;
        _axisZZ: number;
        _angleX: number;
        _angleY: number;
        _angleZ: number;
        _syncAnchors(): void;
        _getVelocitySolverInfo(timeStep: TimeStep, info: JointSolverInfo): void;
        _getPositionSolverInfo(info: JointSolverInfo): void;
        /**
         * Returns the first rigid body's constraint axis in world coordinates.
         */
        getAxis1(): Vec3;
        /**
         * Returns the second rigid body's constraint axis in world coordinates.
         */
        getAxis2(): Vec3;
        /**
         * Sets `axis` to the first rigid body's constraint axis in world coordinates.
         *
         * This does not create a new instance of `Vec3`.
         */
        getAxis1To(axis: Vec3): void;
        /**
         * Sets `axis` to the second rigid body's constraint axis in world coordinates.
         *
         * This does not create a new instance of `Vec3`.
         */
        getAxis2To(axis: Vec3): void;
        /**
         * Returns the first rigid body's constraint axis relative to the rigid body's transform.
         */
        getLocalAxis1(): Vec3;
        /**
         * Returns the second rigid body's constraint axis relative to the rigid body's transform.
         */
        getLocalAxis2(): Vec3;
        /**
         * Sets `axis` to the first rigid body's constraint axis relative to the rigid body's transform.
         *
         * This does not create a new instance of `Vec3`.
         */
        getLocalAxis1To(axis: Vec3): void;
        /**
         * Sets `axis` to the second rigid body's constraint axis relative to the rigid body's transform.
         *
         * This does not create a new instance of `Vec3`.
         */
        getLocalAxis2To(axis: Vec3): void;
        /**
         * Returns the rotational spring and damper settings along the first body's constraint axis.
         */
        getSpringDamper1(): SpringDamper;
        /**
         * Returns the rotational spring and damper settings along the second body's constraint axis.
         */
        getSpringDamper2(): SpringDamper;
        /**
         * Returns the rotational limits and motor settings along the first body's constraint axis.
         */
        getLimitMotor1(): RotationalLimitMotor;
        /**
         * Returns the rotational limits and motor settings along the second body's constraint axis.
         */
        getLimitMotor2(): RotationalLimitMotor;
        /**
         * Returns the rotation angle along the first body's constraint axis.
         */
        getAngle1(): number;
        /**
         * Returns the rotation angle along the second body's constraint axis.
         */
        getAngle2(): number;
    }

    /**
     * The list of the constraint solvers.
     */
    export class ConstraintSolverType {
        protected constructor();
        static readonly _ITERATIVE: number;
        static readonly _DIRECT: number;
        /**
         * Iterative constraint  Fast and stable enough for common usages.
         */
        static readonly ITERATIVE: number;
        /**
         * Direct constraint  Very stable but not suitable for a situation where fast
         * computation is required.
         */
        static readonly DIRECT: number;
    }

    /**
     * Internal class.
     */
    export class ContactSolverMassDataRow {
        constructor();
        invMLinN1X: number;
        invMLinN1Y: number;
        invMLinN1Z: number;
        invMLinN2X: number;
        invMLinN2Y: number;
        invMLinN2Z: number;
        invMAngN1X: number;
        invMAngN1Y: number;
        invMAngN1Z: number;
        invMAngN2X: number;
        invMAngN2Y: number;
        invMAngN2Z: number;
        invMLinT1X: number;
        invMLinT1Y: number;
        invMLinT1Z: number;
        invMLinT2X: number;
        invMLinT2Y: number;
        invMLinT2Z: number;
        invMAngT1X: number;
        invMAngT1Y: number;
        invMAngT1Z: number;
        invMAngT2X: number;
        invMAngT2Y: number;
        invMAngT2Z: number;
        invMLinB1X: number;
        invMLinB1Y: number;
        invMLinB1Z: number;
        invMLinB2X: number;
        invMLinB2Y: number;
        invMLinB2Z: number;
        invMAngB1X: number;
        invMAngB1Y: number;
        invMAngB1Z: number;
        invMAngB2X: number;
        invMAngB2Y: number;
        invMAngB2Z: number;
        massN: number;
        massTB00: number;
        massTB01: number;
        massTB10: number;
        massTB11: number;
    }

    /**
     * Internal class.
     */
    export class JointSolverMassDataRow {
        constructor();
        invMLin1X: number;
        invMLin1Y: number;
        invMLin1Z: number;
        invMLin2X: number;
        invMLin2Y: number;
        invMLin2Z: number;
        invMAng1X: number;
        invMAng1Y: number;
        invMAng1Z: number;
        invMAng2X: number;
        invMAng2Y: number;
        invMAng2Z: number;
        mass: number;
        massWithoutCfm: number;
    }

    /**
     * Internal class
     */
    export class BoundaryBuildInfo {
        constructor(size: number);
        size: number;
        numBounded: number;
        iBounded: number[];
        signs: number[];
        numUnbounded: number;
        iUnbounded: number[];
    }

    /**
     * Internal class
     */
    export class MassMatrix {
        constructor(size: number);
        _size: number;
        _invMass: number[][];
        _invMassWithoutCfm: number[][];
        _massData: JointSolverMassDataRow[];
        _cachedSubmatrices: number[][][];
        _cacheComputed: boolean[];
        _maxSubmatrixId: number;
        computeInvMass(info: JointSolverInfo, massData: JointSolverMassDataRow[]): void;
    }

    /**
 * Internal class
 */
    export class Boundary {
        constructor(maxRows: number);
        numBounded: number;
        iBounded: number[];
        signs: number[];
        numUnbounded: number;
        iUnbounded: number[];
        init(buildInfo: BoundaryBuildInfo): void;
        computeImpulses(info: JointSolverInfo, mass: MassMatrix, relVels: number[], impulses: number[], dImpulses: number[], impulseFactor: number, noCheck: boolean): boolean;
    }

    /**
 * Internal class.
 */
    export class BoundaryBuilder {
        constructor(maxRows: number);
        numBoundaries: number;
        boundaries: Boundary[];
        buildBoundaries(info: JointSolverInfo): void;
    }

    /**
 * Internal Class
 */
    export class BoundarySelector {
        constructor(n: number);
        getIndex(i: number): number;
        select(index: number): void;
        /**
         * Makes first n elements the permutation of {0, 1, ... , n-1}
         */
        setSize(size: number): void;
    }

    /**
 * The direct solver of a mixed linear complementality problem (MLCP) for
 * joint constraints.
 */
    export class DirectJointConstraintSolver extends ConstraintSolver {
        constructor(joint: Joint);
        preSolveVelocity(timeStep: TimeStep): void;
        warmStart(timeStep: TimeStep): void;
        solveVelocity(): void;
        postSolveVelocity(timeStep: TimeStep): void;
        preSolvePosition(timeStep: TimeStep): void;
        solvePositionSplitImpulse(): void;
        solvePositionNgs(timeStep: TimeStep): void;
        postSolve(): void;
    }

    /**
 * A contact constraint solver using projected Gauss-Seidel (sequential impulse).
 */
    export class PgsContactConstraintSolver extends ConstraintSolver {
        constructor(constraint: ContactConstraint);
        preSolveVelocity(timeStep: TimeStep): void;
        warmStart(timeStep: TimeStep): void;
        solveVelocity(): void;
        preSolvePosition(timeStep: TimeStep): void;
        solvePositionSplitImpulse(): void;
        solvePositionNgs(timeStep: TimeStep): void;
        postSolve(): void;
    }

    /**
     * A joint constraint solver using projected Gauss-Seidel (sequential impulse).
     */
    export class PgsJointConstraintSolver extends ConstraintSolver {
        constructor(joint: Joint);
        preSolveVelocity(timeStep: TimeStep): void;
        warmStart(timeStep: TimeStep): void;
        solveVelocity(): void;
        postSolveVelocity(timeStep: TimeStep): void;
        preSolvePosition(timeStep: TimeStep): void;
        solvePositionSplitImpulse(): void;
        solvePositionNgs(timeStep: TimeStep): void;
        postSolve(): void;
    }

    /**
 * The list of a rigid body's motion types.
 */
    export class RigidBodyType {
        protected constructor();
        static readonly _DYNAMIC: number;
        static readonly _STATIC: number;
        static readonly _KINEMATIC: number;
        /**
         * Represents a dynamic rigid body. A dynamic rigid body has finite mass (and usually inertia
         * tensor). The rigid body is affected by gravity, or by constraints the rigid body is involved.
         */
        static readonly DYNAMIC: number;
        /**
         * Represents a static rigid body. A static rigid body has zero velocities and infinite mass
         * and inertia tensor. The rigid body is not affected by any force or impulse, such as gravity,
         * constraints, or external forces or impulses added by an user.
         */
        static readonly STATIC: number;
        /**
         * Represents a kinematic rigid body. A kinematic rigid body is similar to a static one, except
         * that it can have non-zero linear and angular velocities. This is useful for overlapping rigid
         * bodies to pre-computed motions.
         */
        static readonly KINEMATIC: number;
    }

}