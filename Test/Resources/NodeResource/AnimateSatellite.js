var NodeResource;
(function (NodeResource) {
    var ƒ = Fudge;
    class AnimateSatellite extends ƒ.ComponentScript {
        constructor() {
            super();
            this.hndAddComponent = (_event) => {
                this.getContainer().addEventListener("startSatellite", this.start, true);
            };
            this.hndRemoveComponent = (_event) => {
                this.getContainer().removeEventListener("startSatellite", this.start);
                ƒ.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, this.update);
            };
            this.start = (_event) => {
                this.local = this.getContainer().cmpTransform.local;
                this.pivot = this.getContainer().getComponent(ƒ.ComponentMesh).pivot;
                this.pivot.translateZ(-1);
                this.pivot.scale(ƒ.Vector3.ONE(0.2));
                this.local.rotateY(Math.random() * 360);
                ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
            };
            this.update = (_event) => {
                this.local.rotateY(1);
                this.pivot.rotateX(5);
            };
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndAddComponent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndRemoveComponent);
        }
    }
    NodeResource.AnimateSatellite = AnimateSatellite;
})(NodeResource || (NodeResource = {}));
//# sourceMappingURL=AnimateSatellite.js.map