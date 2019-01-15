var WebGl2Test3D;
(function (WebGl2Test3D) {
    /**
     * Simple class for 4x4 matrix operations (e.g.)
     */
    var M4 = /** @class */ (function () {
        function M4() {
        }
        M4.identity = function () {
            return [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ];
        };
        M4.translation = function (_xTranslation, _yTranslation, _zTranslation) {
            return [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                _xTranslation, _yTranslation, _zTranslation, 1
            ];
        };
        M4.translate = function (_matrix, _xTranslation, _yTranslation, _zTranslation) {
            return M4.multiply(_matrix, M4.translation(_xTranslation, _yTranslation, _zTranslation));
        };
        M4.moveOriginMatrix = function (_x, _y, _z) {
            return M4.translation(_x, _y, _z);
        };
        M4.xRotation = function (_angleInDegrees) {
            var angleInRadians = _angleInDegrees * Math.PI / 180;
            var sin = Math.sin(angleInRadians);
            var cos = Math.cos(angleInRadians);
            return [
                1, 0, 0, 0,
                0, cos, sin, 0,
                0, -sin, cos, 0,
                0, 0, 0, 1
            ];
        };
        M4.rotateX = function (_matrix, _angleInDegrees) {
            return M4.multiply(_matrix, M4.xRotation(_angleInDegrees));
        };
        M4.yRotation = function (_angleInDegrees) {
            var angleInRadians = _angleInDegrees * Math.PI / 180;
            var sin = Math.sin(angleInRadians);
            var cos = Math.cos(angleInRadians);
            return [
                cos, 0, -sin, 0,
                0, 1, 0, 0,
                sin, 0, cos, 0,
                0, 0, 0, 1
            ];
        };
        M4.rotateY = function (_matrix, _angleInDegrees) {
            return M4.multiply(_matrix, M4.yRotation(_angleInDegrees));
        };
        M4.zRotation = function (_angleInDegrees) {
            var angleInRadians = _angleInDegrees * Math.PI / 180;
            var sin = Math.sin(angleInRadians);
            var cos = Math.cos(angleInRadians);
            return [
                cos, sin, 0, 0,
                -sin, cos, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ];
        };
        M4.rotateZ = function (_matrix, _angleInDegrees) {
            return M4.multiply(_matrix, M4.zRotation(_angleInDegrees));
        };
        M4.rotateOriginMatrix = function (_pivotAngleXInDegrees, _pivotAngleYInDegrees, _pivotAngleZInDegrees) {
            var matrix = M4.identity();
            matrix = M4.rotateX(matrix, _pivotAngleXInDegrees);
            matrix = M4.rotateY(matrix, _pivotAngleYInDegrees);
            matrix = M4.rotateZ(matrix, _pivotAngleZInDegrees);
            return matrix;
        };
        M4.scaling = function (_xScale, _yScale, _zScale) {
            return [
                _xScale, 0, 0, 0,
                0, _yScale, 0, 0,
                0, 0, _zScale, 0,
                0, 0, 0, 1
            ];
        };
        M4.scale = function (_matrix, _xScale, _yscale, _zScale) {
            return M4.multiply(_matrix, M4.scaling(_xScale, _yscale, _zScale));
        };
        M4.multiply = function (a, b) {
            var a00 = a[0 * 4 + 0];
            var a01 = a[0 * 4 + 1];
            var a02 = a[0 * 4 + 2];
            var a03 = a[0 * 4 + 3];
            var a10 = a[1 * 4 + 0];
            var a11 = a[1 * 4 + 1];
            var a12 = a[1 * 4 + 2];
            var a13 = a[1 * 4 + 3];
            var a20 = a[2 * 4 + 0];
            var a21 = a[2 * 4 + 1];
            var a22 = a[2 * 4 + 2];
            var a23 = a[2 * 4 + 3];
            var a30 = a[3 * 4 + 0];
            var a31 = a[3 * 4 + 1];
            var a32 = a[3 * 4 + 2];
            var a33 = a[3 * 4 + 3];
            var b00 = b[0 * 4 + 0];
            var b01 = b[0 * 4 + 1];
            var b02 = b[0 * 4 + 2];
            var b03 = b[0 * 4 + 3];
            var b10 = b[1 * 4 + 0];
            var b11 = b[1 * 4 + 1];
            var b12 = b[1 * 4 + 2];
            var b13 = b[1 * 4 + 3];
            var b20 = b[2 * 4 + 0];
            var b21 = b[2 * 4 + 1];
            var b22 = b[2 * 4 + 2];
            var b23 = b[2 * 4 + 3];
            var b30 = b[3 * 4 + 0];
            var b31 = b[3 * 4 + 1];
            var b32 = b[3 * 4 + 2];
            var b33 = b[3 * 4 + 3];
            return [
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
            ];
        };
        M4.orthografic = function (_left, _right, _bottom, _top, _near, _far) {
            return [
                2 / (_right - _left), 0, 0, 0,
                0, 2 / (_top - _bottom), 0, 0,
                0, 0, 2 / (_near - _far), 0,
                (_left + _right) / (_left - _right),
                (_bottom + _top) / (_bottom - _top),
                (_near + _far) / (_near - _far),
                1,
            ];
        };
        M4.perspective = function (_fieldOfViewInDegrees, _aspect, _near, _far) {
            var fieldOfViewInRadians = _fieldOfViewInDegrees * Math.PI / 180;
            var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
            var rangeInv = 1.0 / (_near - _far);
            return [
                f / _aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (_near + _far) * rangeInv, -1,
                0, 0, _near * _far * rangeInv * 2, 0,
            ];
        };
        M4.projection = function (_width, _height, _depth) {
            // Note: This matrix flips the Y axis so 0 is at the top.
            return [
                2 / _width, 0, 0, 0,
                0, -2 / _height, 0, 0,
                0, 0, 2 / _depth, 0,
                -1, 1, 0, 1,
            ];
        };
        return M4;
    }());
    WebGl2Test3D.M4 = M4;
})(WebGl2Test3D || (WebGl2Test3D = {}));
//# sourceMappingURL=M4.js.map