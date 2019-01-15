namespace WebGl2Test3D {

    /**
     * Class to hold the transformdata of the node it is attached to.
     */
    export class Transform extends Component {

        private transformMatrix: number[];
        private xTranslate: number;
        private yTranslate: number;
        private zTranslate: number;
        private xAngle: number;
        private yAngle: number;
        private zAngle: number;
        private xScale: number;
        private yScale: number;
        private zScale: number;
        private pivotX: number;
        private pivotY: number;
        private pivotZ: number;
        private pivotAngleX: number;
        private pivotAngleY: number;
        private pivotAngleZ: number;



        public constructor() {
            super();
            this.setName("Transform");
            this.setParent(null);
            this.xTranslate = 0;
            this.yTranslate = 0;
            this.zTranslate = 0;
            this.xAngle = 0;
            this.yAngle = 0;
            this.zAngle = 0;
            this.xScale = 1;
            this.yScale = 1;
            this.zScale = 1;
            this.pivotX = 0;
            this.pivotY = 0;
            this.pivotZ = 0;
            this.pivotAngleX = 0;
            this.pivotAngleY = 0;
            this.pivotAngleZ = 0;
            this.transformMatrix = M4.identity();
        }

        /**
         * Callup method for this transform's transformmatrix.
         */
        public getTransformMatrix(): number[] {
            return this.transformMatrix;
        }

        /**
         * Resets this.transformMatrix and recomputes with new data.
         * Will be called on every change of a transformation value.
         */
        private computeTransformMatrix() {
            let matrix: number[] = M4.identity();
            matrix = M4.translate(matrix, this.xTranslate, this.yTranslate, this.zTranslate);
            matrix = M4.rotateX(matrix, this.xAngle);
            matrix = M4.rotateY(matrix, this.yAngle);
            matrix = M4.rotateZ(matrix, this.zAngle);
            matrix = M4.scale(matrix, this.xScale, this.yScale, this.zScale);
            // Setting object-to-be-drawn's pivotpoint.
            matrix = M4.multiply(matrix, M4.moveOriginMatrix(this.pivotX, this.pivotY, this.pivotZ));
            matrix = M4.multiply(matrix, M4.rotateOriginMatrix(this.pivotAngleX,this.pivotAngleY,this.pivotAngleZ));
            this.transformMatrix = matrix;
        }

        // Translation methods

        public translate(_x: number, _y: number, _z: number): void {
            this.xTranslate = _x;
            this.yTranslate = _y;
            this.zTranslate = _z;
            this.computeTransformMatrix();
        }

        public translateX(_x: number): void {
            this.xTranslate = _x;
            this.computeTransformMatrix();
        }
        public translateY(_y: number): void {
            this.xTranslate = _y;
            this.computeTransformMatrix();
        }
        public translateZ(_z: number): void {
            this.xTranslate = _z;
            this.computeTransformMatrix();
        }

        // Rotation methods.

        public rotate(_xAngle, _yAngle, _zAngle): void {
            this.xAngle = _xAngle;
            this.yAngle = _yAngle;
            this.zAngle = _zAngle;
            this.computeTransformMatrix();
        }

        public rotateX(_xAngle): void {
            this.xAngle = _xAngle;
            this.computeTransformMatrix();
        }

        public rotateY(_yAngle): void {
            this.yAngle = _yAngle;
            this.computeTransformMatrix();
        }

        public rotateZ(_zAngle): void {
            this.zAngle = _zAngle;
            this.computeTransformMatrix();
        }

        // Scaling methods.

        public scale(_xScale: number, _yScale: number, _zScale: number): void {
            this.xScale = _xScale;
            this.yScale = _yScale;
            this.zScale = _zScale;
            this.computeTransformMatrix();
        }

        public scaleX(_xScale: number): void {
            this.xScale = _xScale;
            this.computeTransformMatrix();
        }

        public scaleY(_yScale: number): void {
            this.yScale = _yScale;
            this.computeTransformMatrix();
        }

        public scaleZ(_zScale: number): void {
            this.zScale = _zScale;
            this.computeTransformMatrix();
        }

        // Pivot translation methods.

        public setPivot(_pivotX: number, _pivotY: number, _pivotZ: number): void {
            this.pivotX = _pivotX;
            this.pivotY = _pivotY;
            this.pivotZ = _pivotZ;
            this.computeTransformMatrix();
        }

        public setPivotXtranslate(_pivotX): void {
            this.pivotX = _pivotX;
            this.computeTransformMatrix();
        }

        public setPivotYtranslate(_pivotY): void {
            this.pivotY = _pivotY;
            this.computeTransformMatrix();
        }

        public setPivotZtranslate(_pivotZ): void {
            this.pivotZ = _pivotZ;
            this.computeTransformMatrix();
        }

        // Pivot rotation methods.

        public setPivotAngleX(_pivotAngleX): void {
            this.pivotAngleX = _pivotAngleX;
            this.computeTransformMatrix();
        }

        public setPivotAngleY(_pivotAngleY): void {
            this.pivotAngleY = _pivotAngleY;
            this.computeTransformMatrix();
        }

        public setPivotAngleZ(_pivotAngleZ): void {
            this.pivotAngleZ = _pivotAngleZ;
            this.computeTransformMatrix();
        }
    } // End of class
} // Close Namespace
