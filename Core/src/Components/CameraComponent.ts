/// <reference path="Component.ts"/>
namespace Fudge {
    /**
     * The camera component holds the projection-matrix and other data needed to render a scene from the perspective of the node it is attached to.
     */
    export class CameraComponent extends Component {
        private enabled: boolean = true; // TODO: examine, why this is meaningful. Or shouldn't this be a property of the superclass?
        private orthographic: boolean = false; // Determines whether the image will be rendered with perspective or orthographic projection.
        private projectionMatrix: Matrix4x4 = new Matrix4x4; // The matrix to multiply each scene objects transformation by, to determine where it will be drawn.
        private fieldOfView: number = 45; // The camera's sensorangle.
        private backgroundColor: Vector3 = new Vector3(0, 0, 0); // The color of the background the camera will render.
        private backgroundEnabled: boolean = true; // Determines whether or not the background of this camera will be rendered.
        // TODO: examine, if background should be an attribute of Camera or Viewport

        public activate(_on: boolean): void {
            this.enabled = _on;
        }
        public get isActive(): boolean {
            return this.enabled;
        }

        public get isOrthographic(): boolean {
            return this.orthographic;
        }

        public getBackgoundColor(): Vector3 {
            return this.backgroundColor;
        }
        public getBackgroundEnabled(): boolean {
            return this.backgroundEnabled;
        }

        /**
         * Returns the multiplikation of the worldtransformation of the camera container with the projection matrix
         * @returns the world-projection-matrix
         */
        public get ViewProjectionMatrix(): Matrix4x4 {
            try {
                let transform: TransformComponent = <TransformComponent>this.container.getComponents(TransformComponent)[0];
                let viewMatrix: Matrix4x4 = Matrix4x4.inverse(transform.Matrix); // TODO: examine, why Matrix is used and not WorldMatrix!
                return Matrix4x4.multiply(this.projectionMatrix, viewMatrix);
            } catch {
                return this.projectionMatrix;
            }
        }

        /**
         * Set the camera to perspective projection. The world origin is in the center of the canvaselement.
         * @param _aspect The aspect ratio between width and height of projectionspace.(Default = canvas.clientWidth / canvas.ClientHeight)
         * @param _fieldOfView The field of view in Degrees. (Default = 45)
         */
        public projectCentral(_aspect: number = gl2.canvas.clientWidth / gl2.canvas.clientHeight, _fieldOfView: number = 45): void {
            this.fieldOfView = _fieldOfView;
            this.orthographic = false;
            this.projectionMatrix = Matrix4x4.centralProjection(_aspect, _fieldOfView, 1, 2000);
        }
        /**
         * Set the camera to orthographic projection. The origin is in the top left corner of the canvaselement.
         * @param _left The positionvalue of the projectionspace's left border. (Default = 0)
         * @param _right The positionvalue of the projectionspace's right border. (Default = canvas.clientWidth)
         * @param _bottom The positionvalue of the projectionspace's bottom border.(Default = canvas.clientHeight)
         * @param _top The positionvalue of the projectionspace's top border.(Default = 0)
         */
        public projectOrthographic(_left: number = 0, _right: number = gl2.canvas.clientWidth, _bottom: number = gl2.canvas.clientHeight, _top: number = 0): void {
            this.orthographic = true;
            this.projectionMatrix = Matrix4x4.orthographicProjection(_left, _right, _bottom, _top, 400, -400); // TODO: examine magic numbers!
        }
    }
}