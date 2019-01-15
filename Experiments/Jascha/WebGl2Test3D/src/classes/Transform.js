var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var WebGl2Test3D;
(function (WebGl2Test3D) {
    /**
     * Class to hold the transformdata of the node it is attached to.
     */
    var Transform = /** @class */ (function (_super) {
        __extends(Transform, _super);
        function Transform() {
            var _this = _super.call(this) || this;
            _this.setName("Transform");
            _this.setParent(null);
            _this.xTranslate = 0;
            _this.yTranslate = 0;
            _this.zTranslate = 0;
            _this.xAngle = 0;
            _this.yAngle = 0;
            _this.zAngle = 0;
            _this.xScale = 1;
            _this.yScale = 1;
            _this.zScale = 1;
            _this.pivotX = 0;
            _this.pivotY = 0;
            _this.pivotZ = 0;
            _this.pivotAngleX = 0;
            _this.pivotAngleY = 0;
            _this.pivotAngleZ = 0;
            _this.transformMatrix = WebGl2Test3D.M4.identity();
            return _this;
        }
        /**
         * Callup method for this transform's transformmatrix.
         */
        Transform.prototype.getTransformMatrix = function () {
            return this.transformMatrix;
        };
        /**
         * Resets this.transformMatrix and recomputes with new data.
         * Will be called on every change of a transformation value.
         */
        Transform.prototype.computeTransformMatrix = function () {
            var matrix = WebGl2Test3D.M4.identity();
            matrix = WebGl2Test3D.M4.translate(matrix, this.xTranslate, this.yTranslate, this.zTranslate);
            matrix = WebGl2Test3D.M4.rotateX(matrix, this.xAngle);
            matrix = WebGl2Test3D.M4.rotateY(matrix, this.yAngle);
            matrix = WebGl2Test3D.M4.rotateZ(matrix, this.zAngle);
            matrix = WebGl2Test3D.M4.scale(matrix, this.xScale, this.yScale, this.zScale);
            // Setting object-to-be-drawn's pivotpoint.
            matrix = WebGl2Test3D.M4.multiply(matrix, WebGl2Test3D.M4.moveOriginMatrix(this.pivotX, this.pivotY, this.pivotZ));
            matrix = WebGl2Test3D.M4.multiply(matrix, WebGl2Test3D.M4.rotateOriginMatrix(this.pivotAngleX, this.pivotAngleY, this.pivotAngleZ));
            this.transformMatrix = matrix;
        };
        // Translation methods
        Transform.prototype.translate = function (_x, _y, _z) {
            this.xTranslate = _x;
            this.yTranslate = _y;
            this.zTranslate = _z;
            this.computeTransformMatrix();
        };
        Transform.prototype.translateX = function (_x) {
            this.xTranslate = _x;
            this.computeTransformMatrix();
        };
        Transform.prototype.translateY = function (_y) {
            this.xTranslate = _y;
            this.computeTransformMatrix();
        };
        Transform.prototype.translateZ = function (_z) {
            this.xTranslate = _z;
            this.computeTransformMatrix();
        };
        // Rotation methods.
        Transform.prototype.rotate = function (_xAngle, _yAngle, _zAngle) {
            this.xAngle = _xAngle;
            this.yAngle = _yAngle;
            this.zAngle = _zAngle;
            this.computeTransformMatrix();
        };
        Transform.prototype.rotateX = function (_xAngle) {
            this.xAngle = _xAngle;
            this.computeTransformMatrix();
        };
        Transform.prototype.rotateY = function (_yAngle) {
            this.yAngle = _yAngle;
            this.computeTransformMatrix();
        };
        Transform.prototype.rotateZ = function (_zAngle) {
            this.zAngle = _zAngle;
            this.computeTransformMatrix();
        };
        // Scaling methods.
        Transform.prototype.scale = function (_xScale, _yScale, _zScale) {
            this.xScale = _xScale;
            this.yScale = _yScale;
            this.zScale = _zScale;
            this.computeTransformMatrix();
        };
        Transform.prototype.scaleX = function (_xScale) {
            this.xScale = _xScale;
            this.computeTransformMatrix();
        };
        Transform.prototype.scaleY = function (_yScale) {
            this.yScale = _yScale;
            this.computeTransformMatrix();
        };
        Transform.prototype.scaleZ = function (_zScale) {
            this.zScale = _zScale;
            this.computeTransformMatrix();
        };
        // Pivot translation methods.
        Transform.prototype.setPivot = function (_pivotX, _pivotY, _pivotZ) {
            this.pivotX = _pivotX;
            this.pivotY = _pivotY;
            this.pivotZ = _pivotZ;
            this.computeTransformMatrix();
        };
        Transform.prototype.setPivotXtranslate = function (_pivotX) {
            this.pivotX = _pivotX;
            this.computeTransformMatrix();
        };
        Transform.prototype.setPivotYtranslate = function (_pivotY) {
            this.pivotY = _pivotY;
            this.computeTransformMatrix();
        };
        Transform.prototype.setPivotZtranslate = function (_pivotZ) {
            this.pivotZ = _pivotZ;
            this.computeTransformMatrix();
        };
        // Pivot rotation methods.
        Transform.prototype.setPivotAngleX = function (_pivotAngleX) {
            this.pivotAngleX = _pivotAngleX;
            this.computeTransformMatrix();
        };
        Transform.prototype.setPivotAngleY = function (_pivotAngleY) {
            this.pivotAngleY = _pivotAngleY;
            this.computeTransformMatrix();
        };
        Transform.prototype.setPivotAngleZ = function (_pivotAngleZ) {
            this.pivotAngleZ = _pivotAngleZ;
            this.computeTransformMatrix();
        };
        return Transform;
    }(WebGl2Test3D.Component)); // End of class
    WebGl2Test3D.Transform = Transform;
})(WebGl2Test3D || (WebGl2Test3D = {})); // Close Namespace
//# sourceMappingURL=Transform.js.map