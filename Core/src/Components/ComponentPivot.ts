namespace Fudge {
    /**
     * Class to hold the transformation-data of the mesh that is attached to the same node.
     * The pivot-transformation does not affect the transformation of the node itself or its children.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class ComponentPivot extends Component {
        public local: Matrix4x4 = Matrix4x4.identity; // The matrix to transform the mesh by.

        public get position(): Vector3 {
            return new Vector3(this.local.data[12], this.local.data[13], this.local.data[14]);
        }

        // #region Transformation
        /**
         * Resets this.matrix to idenity Matrix.
         */
        public reset(): void {
            this.local = Matrix4x4.identity;
        }
        // #endregion

        // #region Translation
        /**
         * Translate the transformation along the x-, y- and z-axis.
         * @param _x The x-value of the translation.
         * @param _y The y-value of the translation.
         * @param _z The z-value of the translation.
         */
        public translate(_x: number, _y: number, _z: number): void {
            this.local = Matrix4x4.translate(this.local, _x, _y, _z);
        }
        /**
         * Translate the transformation along the x-axis.
         * @param _x The value of the translation.
         */
        public translateX(_x: number): void {
            this.local = Matrix4x4.translate(this.local, _x, 0, 0);
        }
        /**
         * Translate the transformation along the y-axis.
         * @param _y The value of the translation.
         */
        public translateY(_y: number): void {
            this.local = Matrix4x4.translate(this.local, 0, _y, 0);
        }
        /**
         * Translate the transformation along the z-axis.
         * @param _z The value of the translation.
         */
        public translateZ(_z: number): void {
            this.local = Matrix4x4.translate(this.local, 0, 0, _z);
        }
        // #endregion

        // #region Rotation
        /**
         * Rotate the transformation along the around its x-Axis.
         * @param _angle The angle to rotate by.
         */
        public rotateX(_angle: number): void {
            this.local = Matrix4x4.rotateX(this.local, _angle);
        }
        /**
         * Rotate the transformation along the around its y-Axis.
         * @param _angle The angle to rotate by.
         */
        public rotateY(_angle: number): void {
            this.local = Matrix4x4.rotateY(this.local, _angle);
        }
        /**
         * Rotate the transformation along the around its z-Axis.
         * @param _angle The angle to rotate by.
         */
        public rotateZ(_zAngle: number): void {
            this.local = Matrix4x4.rotateZ(this.local, _zAngle);
        }
        /**
         * Wrapper function to rotate the transform so that its z-Axis is facing in the direction of the targets position.
         * TODO: Use world transformations! Does it make sense in Pivot?
         * @param _target The target to look at.
         */
        public lookAt(_target: Vector3): void {
            this.local = Matrix4x4.lookAt(this.position, _target); // TODO: Handle rotation around z-axis
        }
        // #endregion

        // #region Scaling
        /**
         * Scale the transformation along the x-, y- and z-axis.
         * @param _xScale The value to scale x by.
         * @param _yScale The value to scale y by.
         * @param _zScale The value to scale z by.
         */
        public scale(_xScale: number, _yScale: number, _zScale: number): void {
            this.local = Matrix4x4.scale(this.local, _xScale, _yScale, _zScale);
        }
        /**
         * Scale the transformation along the x-axis.
         * @param _scale The value to scale by.
         */
        public scaleX(_scale: number): void {
            this.local = Matrix4x4.scale(this.local, _scale, 1, 1);
        }
        /**
         * Scale the transformation along the y-axis.
         * @param _scale The value to scale by.
         */
        public scaleY(_scale: number): void {
            this.local = Matrix4x4.scale(this.local, 1, _scale, 1);
        }
        /**
         * Scale the transformation along the z-axis.
         * @param _scale The value to scale by.
         */
        public scaleZ(_scale: number): void {
            this.local = Matrix4x4.scale(this.local, 1, 1, _scale);
        }
        // #endregion

        // #region Serialization
        public serialize(): Serialization {
            // TODO: save translation, rotation and scale as vectors for readability and manipulation
            let serialization: Serialization = {
                local: this.local.serialize(),
                [super.type]: super.serialize()
            };
            return serialization;
        }
        public deserialize(_serialization: Serialization): Serializable {
            this.local.deserialize(_serialization.local);
            super.deserialize(_serialization[super.type]);
            return this;
        }
        // #endregion
    }
}
