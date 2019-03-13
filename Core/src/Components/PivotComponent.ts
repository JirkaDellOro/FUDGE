namespace Fudge {
    /**
     * Class to hold the transformation-data of the mesh that is attached to the same node.
     * The pivot-transformation does not affect the transformation of the node itself or its children.
     */
    export class PivotComponent extends Component {
        protected matrix: Matrix4x4 = Matrix4x4.identity(); // The matrix to transform the mesh by.

        public get Matrix(): Matrix4x4 {
            return this.matrix;
        }

        public get Position(): Vector3 {
            return new Vector3(this.matrix.Data[12], this.matrix.Data[13], this.matrix.Data[14])
        }

        /**
         * # Transformation methods
         */
        /**
         * Resets this.matrix to idenity Matrix.
         */
        public reset(): void {
            this.matrix = Matrix4x4.identity();
        }
        /**
         * # Translation methods
         */
        /**
         * Translate the transformation along the x-, y- and z-axis.
         * @param _x The x-value of the translation.
         * @param _y The y-value of the translation.
         * @param _z The z-value of the translation.
         */
        public translate(_x: number, _y: number, _z: number): void {
            this.matrix = Matrix4x4.translate(this.matrix, _x, _y, _z);
        }
        /**
         * Translate the transformation along the x-axis.
         * @param _x The value of the translation.
         */
        public translateX(_x: number): void {
            this.matrix = Matrix4x4.translate(this.matrix, _x, 0, 0);
        }
        /**
         * Translate the transformation along the y-axis.
         * @param _y The value of the translation.
         */
        public translateY(_y: number): void {
            this.matrix = Matrix4x4.translate(this.matrix, 0, _y, 0);
        }
        /**
         * Translate the transformation along the z-axis.
         * @param _z The value of the translation.
         */
        public translateZ(_z: number): void {
            this.matrix = Matrix4x4.translate(this.matrix, 0, 0, _z);
        }

        /**
         * # Rotation methods
         */
        /**
         * Rotate the transformation along the around its x-Axis.
         * @param _angle The angle to rotate by.
         */
        public rotateX(_angle: number): void {
            this.matrix = Matrix4x4.rotateX(this.matrix, _angle);
        }
        /**
         * Rotate the transformation along the around its y-Axis.
         * @param _angle The angle to rotate by.
         */
        public rotateY(_angle: number): void {
            this.matrix = Matrix4x4.rotateY(this.matrix, _angle);
        }
        /**
         * Rotate the transformation along the around its z-Axis.
         * @param _angle The angle to rotate by.
         */
        public rotateZ(_zAngle: number): void {
            this.matrix = Matrix4x4.rotateZ(this.matrix, _zAngle);
        }
        /**
         * Wrapper function to rotate the transform so that its z-Axis is facing in the direction of the targets position.
         * TODO: This method does not work properly if the mesh that calls it and the target are ancestor/descendant of
         * one another, as it does not take into account the transformation that is passed from one to the other.
         * @param _target The target to look at.
         */
        public lookAt(_target: Vector3): void {
            this.matrix = Matrix4x4.lookAt(this.Position, _target); // TODO: Handle rotation around z-axis
        }
        /**
         * # Scaling methods
         */
        /**
         * Scale the transformation along the x-, y- and z-axis.
         * @param _xScale The value to scale x by.
         * @param _yScale The value to scale y by.
         * @param _zScale The value to scale z by.
         */
        public scale(_xScale: number, _yScale: number, _zScale: number): void {
            this.matrix = Matrix4x4.scale(this.matrix, _xScale, _yScale, _zScale);
        }
        /**
         * Scale the transformation along the x-axis.
         * @param _scale The value to scale by.
         */
        public scaleX(_scale: number): void {
            this.matrix = Matrix4x4.scale(this.matrix, _scale, 1, 1);
        }
        /**
         * Scale the transformation along the y-axis.
         * @param _scale The value to scale by.
         */
        public scaleY(_scale: number): void {
            this.matrix = Matrix4x4.scale(this.matrix, 1, _scale, 1);
        }
        /**
         * Scale the transformation along the z-axis.
         * @param _scale The value to scale by.
         */
        public scaleZ(_scale: number): void {
            this.matrix = Matrix4x4.scale(this.matrix, 1, 1, _scale);
        }
    }
}
