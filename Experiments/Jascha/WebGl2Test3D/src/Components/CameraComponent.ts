namespace WebEngine {

    /**
     * The camera component passes the ability to render a scene from the perspective of the
     * node it is attached to.
     */
    export class CameraComponent extends Component {
        private enabled: boolean; // Determines whether or not the camera will render what it can see.
        private perspective: boolean; // Determines whether the image will be rendered with perspective or orthographic projection.
        private projectionMatrix: Mat4; // The matrix to multiply each scene objects transformation by, to determine where it will be drawn.
        private fieldOfView: number; // The camera's sensorangle.
        private backgroundColor: Vec3; // The color of the background the camera will render.
        private backgroundEnabled: boolean; // Determines whether or not the background of this camera will be rendered.

        public constructor(_perspective: boolean = true) {
            super();
            this.enabled = true;
            this.projectionMatrix = new Mat4;
            this.perspective = _perspective;
            if (!this.perspective) {
                this.setCameraToOrthographic();
            }
            else {
                this.setCameraToPerspective();
            }
            this.fieldOfView = 45;
            this.backgroundColor = new Vec3(0, 0, 0);
            this.backgroundEnabled = true;
        }

        // Get and set Methods.######################################################################################
        public get Enabled(): boolean {
            return this.enabled;
        }
        public enable(): void {
            this.enabled = true;
        }
        public disable(): void {
            this.enabled = false;
        }
        public get Perspective(): boolean {
            return this.perspective;
        }
        public get FieldOfView(): number {
            return this.fieldOfView;
        }
        public get BackgroundColor(): Vec3 {
            return this.backgroundColor;
        }
        public get BackgroundEnabled():boolean{
            return this.backgroundEnabled;
        }
        public enableBackground():void{
            this.backgroundEnabled = true;
        }
        public disableBackground() : void{
            this.backgroundEnabled = false;
        }
        public get ViewProjectionMatrix(): Mat4{
            let viewMatrix : Mat4 = Mat4.inverse((<TransformComponent>this.container.getComponentByName("Transform")).Matrix || Mat4.identity());
            return Mat4.multiply(this.projectionMatrix, viewMatrix);
        }

        // Projection methods.######################################################################################
        /**
         * Set the camera to perspective projection. The world origin is in the center of the canvaselement.
         * @param _aspect The aspect ratio between width and height of projectionspace.(Default = canvas.clientWidth / canvas.ClientHeight)
         * @param _fieldOfView The field of view in Degrees. (Default = 45)
         */
        public setCameraToPerspective(_aspect: number = gl2.canvas.clientWidth / gl2.canvas.clientHeight, _fieldOfView: number = 45): void {
            this.fieldOfView = _fieldOfView;
            this.perspective = true;
            this.projectionMatrix = Mat4.perspective(_aspect, _fieldOfView, 1, 2000);
        }
        /**
         * Set the camera to orthographic projection. The origin is in the top left corner of the canvaselement.
         * @param _left The positionvalue of the projectionspace's left border. (Default = 0)
         * @param _right The positionvalue of the projectionspace's right border. (Default = canvas.clientWidth)
         * @param _bottom The positionvalue of the projectionspace's bottom border.(Default = canvas.clientHeight)
         * @param _top The positionvalue of the projectionspace's top border.(Default = 0)
         */
        public setCameraToOrthographic(_left: number = 0, _right: number = gl2.canvas.clientWidth, _bottom: number = gl2.canvas.clientHeight,
            _top: number = 0): void {
            this.perspective = false;
            this.projectionMatrix = Mat4.orthographic(_left, _right, _bottom, _top, 400, -400);
        }
    } // End class.

} // End namespace.