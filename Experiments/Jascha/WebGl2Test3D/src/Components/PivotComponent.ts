namespace WebEngine {

    /**
     * Class to hold the transformationdata of the mesh that is attached to the same Node.
     * The pivottransformation does not affect the transformation of the nodes children.
     */
    export class PivotComponent extends Component {

        protected matrix: Mat4; // The matrix to transform the mesh by.


        public constructor() {
            super();
            this.name = "Pivot";
            this.container = null;
            this.matrix = Mat4.identity();
        }
        // Get and set methods.######################################################################################
        public get Matrix(): Mat4 {
            return this.matrix;
        }

        public get Position():Vec3{
            return new Vec3(this.matrix.Data[12],this.matrix.Data[13],this.matrix.Data[14])
        }

        // Transformation methods.######################################################################################

        /**
         * Resets this.matrix to idenity Matrix.
         */
        public reset(): void {
            this.matrix = Mat4.identity();
        }

        // Translation methods.######################################################################################
        /**
         * Wrapper function to translate the position of the mesh this pivot is attached to on the x-, y- and z-axis.
         * @param _x The x-value of the translation.
         * @param _y The y-value of the translation.
         * @param _z The z-value of the translation.
         */
        public translate(_x: number, _y: number, _z: number): void {
            this.matrix = Mat4.translate(this.matrix, _x, _y, _z);
        }
        /**
         * Wrapper function to translate the position of the mesh this pivot is attached to on the x-axis.
         * @param _x The value of the translation.
         */
        public translateX(_x: number): void {
            this.matrix = Mat4.translate(this.matrix, _x, 0, 0);
        }
        /**
         * Wrapper function to translate the position of the mesh this pivot is attached to on the y-axis.
         * @param _y The value of the translation.
         */
        public translateY(_y: number): void {
            this.matrix = Mat4.translate(this.matrix, 0, _y, 0);
        }
        /**
         * Wrapper function to translate the position of the mesh this pivot is attached to on the z-axis.
         * @param _z The value of the translation.
         */
        public translateZ(_z: number): void {
            this.matrix = Mat4.translate(this.matrix, 0, 0, _z);
        }

        // Rotation methods.######################################################################################
        /**
         * Wrapper function to rotate the mesh this pivot is attached to around its x-Axis.
         * @param _angle The angle to rotate by.
         */
        public rotateX(_angle): void {
            this.matrix = Mat4.rotateX(this.matrix, _angle);
        }
        /**
         * Wrapper function to rotate the mesh this pivot is attached to around its y-Axis.
         * @param _angle The angle to rotate by.
         */
        public rotateY(_angle): void {
            this.matrix = Mat4.rotateY(this.matrix, _angle);
        }
        /**
         * Wrapper function to rotate the mesh this pivot is attached to around its z-Axis.
         * @param _angle The angle to rotate by.
         */
        public rotateZ(_zAngle): void {
            this.matrix = Mat4.rotateZ(this.matrix, _zAngle);
        }
        /**
         * Wrapper function to rotate the mesh of the mesh this pivot is attached to so that its z-Axis is facing in the direction
         * of the targets position.
         * WARNING: This method does not work properly if the mesh that calls it and the target are ancestor/descendant of
         * one another, as it does not take into account the transformation that is passed from one to the other.
         * @param _target The target to look at.
         */
        public lookAt(_target: Vec3): void {
            this.matrix = Mat4.lookAt(this.Position, _target);
        }
        // Scaling methods.######################################################################################
        /**
         * Wrapper function to scale the mesh of the node this pivot is attached to on the x-, y- and z-axis.
         * @param _xScale The value to scale x by.
         * @param _yScale The value to scale y by.
         * @param _zScale The value to scale z by.
         */
        public scale(_xScale: number, _yScale: number, _zScale: number): void {
            this.matrix = Mat4.scale(this.matrix, _xScale, _yScale, _zScale);
        }
        /**
         * Wrapper function to scale the mesh of the node this pivot is attached to on the x-axis.
         * @param _scale The value to scale by.
         */
        public scaleX(_scale: number): void {
            this.matrix = Mat4.scale(this.matrix, _scale, 1, 1);
        }
        /**
         * Wrapper function to scale the mesh of the node this pivot is attached to on the y-axis.
         * @param _scale The value to scale by.
         */
        public scaleY(_scale: number): void {
            this.matrix = Mat4.scale(this.matrix, 1, _scale, 1);
        }
        /**
         * Wrapper function to scale the mesh of the node this pivot is attached to on the z-axis.
         * @param _scale The value to scale by.
         */
        public scaleZ(_scale: number): void {
            this.matrix = Mat4.scale(this.matrix, 1, 1, _scale);
        }

    } // End of class
} // Close Namespace
