/// <reference path="Component.ts"/>
namespace Fudge {
    export enum FOV_DIRECTION {
        HORIZONTAL, VERTICAL, DIAGONAL
    }
    /**
     * The camera component holds the projection-matrix and other data needed to render a scene from the perspective of the node it is attached to.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class ComponentCamera extends Component {
        // TODO: a ComponentPivot might be interesting to ease behaviour scripting
        private orthographic: boolean = false; // Determines whether the image will be rendered with perspective or orthographic projection.
        private projection: Matrix4x4 = new Matrix4x4; // The matrix to multiply each scene objects transformation by, to determine where it will be drawn.
        private fieldOfView: number = 45; // The camera's sensorangle.
        private aspectRatio: number = 1.0;
        private fovDirection: FOV_DIRECTION = FOV_DIRECTION.DIAGONAL;
        private backgroundColor: Color = new Color(0, 0, 0, 1); // The color of the background the camera will render.
        private backgroundEnabled: boolean = true; // Determines whether or not the background of this camera will be rendered.
        // TODO: examine, if background should be an attribute of Camera or Viewport

        public get isOrthographic(): boolean {
            return this.orthographic;
        }

        public getBackgoundColor(): Color {
            return this.backgroundColor;
        }

        public getBackgroundEnabled(): boolean {
            return this.backgroundEnabled;
        }

        public getAspect(): number {
            return this.aspectRatio;
        }

        public getFieldOfView(): number {
            return this.fieldOfView;
        }

        /**
         * Returns the multiplikation of the worldtransformation of the camera container with the projection matrix
         * @returns the world-projection-matrix
         */
        public get ViewProjectionMatrix(): Matrix4x4 {
            try {
                let cmpTransform: ComponentTransform = this.getContainer().cmpTransform;
                let viewMatrix: Matrix4x4 = Matrix4x4.inverse(cmpTransform.local); // TODO: WorldMatrix-> Camera must be calculated
                return Matrix4x4.multiply(this.projection, viewMatrix);
            } catch {
                return this.projection;
            }
        }

        /**
         * Set the camera to perspective projection. The world origin is in the center of the canvaselement.
         * @param _aspect The aspect ratio between width and height of projectionspace.(Default = canvas.clientWidth / canvas.ClientHeight)
         * @param _fieldOfView The field of view in Degrees. (Default = 45)
         */
        public projectCentral(_aspect: number = this.aspectRatio, _fieldOfView: number = this.fieldOfView, _direction: FOV_DIRECTION = this.fovDirection): void {
            this.aspectRatio = _aspect;
            this.fieldOfView = _fieldOfView;
            this.fovDirection = _direction;
            this.orthographic = false;
            this.projection = Matrix4x4.centralProjection(_aspect, this.fieldOfView, 1, 2000, this.fovDirection); // TODO: remove magic numbers
        }
        /**
         * Set the camera to orthographic projection. The origin is in the top left corner of the canvaselement.
         * @param _left The positionvalue of the projectionspace's left border. (Default = 0)
         * @param _right The positionvalue of the projectionspace's right border. (Default = canvas.clientWidth)
         * @param _bottom The positionvalue of the projectionspace's bottom border.(Default = canvas.clientHeight)
         * @param _top The positionvalue of the projectionspace's top border.(Default = 0)
         */
        public projectOrthographic(_left: number = 0, _right: number = RenderManager.getCanvas().clientWidth, _bottom: number = RenderManager.getCanvas().clientHeight, _top: number = 0): void {
            this.orthographic = true;
            this.projection = Matrix4x4.orthographicProjection(_left, _right, _bottom, _top, 400, -400); // TODO: examine magic numbers!
        }

        public serialize(): Serialization {
            let serialization: Serialization = {
                backgroundColor: this.backgroundColor,
                backgroundEnabled: this.backgroundEnabled,
                orthographic: this.orthographic,
                fieldOfView: this.fieldOfView,
                fovDirection: this.fovDirection,
                aspect: this.aspectRatio,
                [super.constructor.name]: super.serialize()
            };
            return serialization;
        }
        public deserialize(_serialization: Serialization): Serializable {
            this.backgroundColor = _serialization.backgroundColor;
            this.backgroundEnabled = _serialization.backgroundEnabled;
            this.orthographic = _serialization.orthographic;
            this.fieldOfView = _serialization.fieldOfView;
            this.aspectRatio = _serialization.aspect;
            this.fovDirection = _serialization.fovDirection;
            super.deserialize(_serialization[super.constructor.name]);
            if (this.isOrthographic)
                this.projectOrthographic(); // TODO: serialize and deserialize parameters
            else
                this.projectCentral();
            return this;
        }

        public getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes {
            let types: MutatorAttributeTypes = super.getMutatorAttributeTypes(_mutator);
            if (types.fovDirection)
                types.fovDirection = FOV_DIRECTION;
            return types;
        }
    }
}