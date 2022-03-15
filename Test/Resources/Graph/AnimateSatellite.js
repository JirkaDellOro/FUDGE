var Graph;
(function (Graph) {
    var ƒ = FudgeCore;
    class AnimateSatellite extends ƒ.ComponentScript {
        constructor() {
            super();
            this.hndAddComponent = (_event) => {
                this.node.addEventListener("startSatellite", this.start, true);
            };
            this.hndRemoveComponent = (_event) => {
                this.node.removeEventListener("startSatellite", this.start);
                ƒ.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, this.update);
            };
            this.start = (_event) => {
                this.mtxLocal = this.node.mtxLocal;
                this.mtxPivot = this.node.getComponent(ƒ.ComponentMesh).mtxPivot;
                this.mtxPivot.translateZ(-0.5);
                this.mtxPivot.scale(ƒ.Vector3.ONE(0.2));
                this.mtxLocal.rotateY(Math.random() * 360);
                ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
            };
            this.update = (_event) => {
                // tpo: test performance optimization
                // this.mtxLocal.set(ƒ.Matrix4x4.MULTIPLICATION(this.mtxLocal, AnimateSatellite.mtxRotY));
                // this.mtxPivot.set(ƒ.Matrix4x4.MULTIPLICATION(this.mtxPivot, AnimateSatellite.mtxRotX));
                // :tpo
                this.mtxLocal.rotateY(1);
                this.mtxPivot.rotateX(5);
            };
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndAddComponent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndRemoveComponent);
        }
    }
    // tpo: test performance optimization
    AnimateSatellite.mtxRotY = ƒ.Matrix4x4.ROTATION_Y(1);
    AnimateSatellite.mtxRotX = ƒ.Matrix4x4.ROTATION_X(5);
    Graph.AnimateSatellite = AnimateSatellite;
})(Graph || (Graph = {}));
//# sourceMappingURL=AnimateSatellite.js.map