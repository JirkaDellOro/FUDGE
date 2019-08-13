var WebEngine;
(function (WebEngine) {
    /**
     * The camera component passes the ability to render a scene from the perspective of the
     * node it is attached to.
     */
    class CameraComponent extends WebEngine.Component {
        constructor(_perspective = true) {
            super();
            this.enabled = true;
            this.projectionMatrix = new WebEngine.Mat4;
            this.perspective = _perspective;
            if (!this.perspective) {
                this.setCameraToOrthographic();
            }
            else {
                this.setCameraToPerspective();
            }
            this.fieldOfView = 45;
            this.backgroundColor = new WebEngine.Vec3(0, 0, 0);
            this.backgroundEnabled = true;
        }
        // Get and set Methods.######################################################################################
        get Enabled() {
            return this.enabled;
        }
        enable() {
            this.enabled = true;
        }
        disable() {
            this.enabled = false;
        }
        get Perspective() {
            return this.perspective;
        }
        get FieldOfView() {
            return this.fieldOfView;
        }
        get BackgroundColor() {
            return this.backgroundColor;
        }
        get BackgroundEnabled() {
            return this.backgroundEnabled;
        }
        enableBackground() {
            this.backgroundEnabled = true;
        }
        disableBackground() {
            this.backgroundEnabled = false;
        }
        get ViewProjectionMatrix() {
            let viewMatrix = WebEngine.Mat4.inverse(this.container.getComponentByName("Transform").Matrix || WebEngine.Mat4.identity());
            return WebEngine.Mat4.multiply(this.projectionMatrix, viewMatrix);
        }
        // Projection methods.######################################################################################
        /**
         * Set the camera to perspective projection. The world origin is in the center of the canvaselement.
         * @param _aspect The aspect ratio between width and height of projectionspace.(Default = canvas.clientWidth / canvas.ClientHeight)
         * @param _fieldOfView The field of view in Degrees. (Default = 45)
         */
        setCameraToPerspective(_aspect = WebEngine.gl2.canvas.clientWidth / WebEngine.gl2.canvas.clientHeight, _fieldOfView = 45) {
            this.fieldOfView = _fieldOfView;
            this.perspective = true;
            this.projectionMatrix = WebEngine.Mat4.perspective(_aspect, _fieldOfView, 1, 2000);
        }
        /**
         * Set the camera to orthographic projection. The origin is in the top left corner of the canvaselement.
         * @param _left The positionvalue of the projectionspace's left border. (Default = 0)
         * @param _right The positionvalue of the projectionspace's right border. (Default = canvas.clientWidth)
         * @param _bottom The positionvalue of the projectionspace's bottom border.(Default = canvas.clientHeight)
         * @param _top The positionvalue of the projectionspace's top border.(Default = 0)
         */
        setCameraToOrthographic(_left = 0, _right = WebEngine.gl2.canvas.clientWidth, _bottom = WebEngine.gl2.canvas.clientHeight, _top = 0) {
            this.perspective = false;
            this.projectionMatrix = WebEngine.Mat4.orthographic(_left, _right, _bottom, _top, 400, -400);
        }
    } // End class.
    WebEngine.CameraComponent = CameraComponent;
})(WebEngine || (WebEngine = {})); // End namespace.
//# sourceMappingURL=CameraComponent.js.map