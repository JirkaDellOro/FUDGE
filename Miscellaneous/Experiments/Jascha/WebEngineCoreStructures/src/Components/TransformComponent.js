var WebEngine;
(function (WebEngine) {
    /**
     * Class to hold the transformationdata of the node it is attached to. Extends Pivot for fewer redundancies.
     * While Pivot only affects the mesh of the node it is attached to, without altering the nodes origin, the
     * Transform component affects the origin of a node and its descendants.
     */
    class TransformComponent extends WebEngine.PivotComponent {
        constructor() {
            super();
            this.name = "Transform";
            this.worldMatrix = this.matrix;
        }
        // Get and Set methods.######################################################################################
        get WorldMatrix() {
            return this.worldMatrix;
        }
        set WorldMatrix(_matrix) {
            this.worldMatrix = _matrix;
        }
        get WorldPosition() {
            return new WebEngine.Vec3(this.worldMatrix.Data[12], this.worldMatrix.Data[13], this.worldMatrix.Data[14]);
        }
    } // End of class
    WebEngine.TransformComponent = TransformComponent;
})(WebEngine || (WebEngine = {})); // Close Namespace
//# sourceMappingURL=TransformComponent.js.map