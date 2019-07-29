module NodeResource {
    import ƒ = Fudge;
    export class AnimateSatellite extends ƒ.ComponentScript {
        private local: ƒ.Matrix4x4;
        private pivot: ƒ.Matrix4x4;

        constructor() {
            super();
            this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndAddComponent);
            this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndRemoveComponent);
        }

        hndAddComponent = (_event: Event) => {
            this.getContainer().addEventListener("startSatellite", this.start, true);
        }

        hndRemoveComponent = (_event: Event) => {
            this.getContainer().removeEventListener("startSatellite", this.start);
            ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
        }

        public start = (_event: Event) => {
            this.local = this.getContainer().cmpTransform.local;
            this.pivot = (<ƒ.ComponentMesh>this.getContainer().getComponent(ƒ.ComponentMesh)).pivot;

            this.pivot.translateZ(-1);
            this.pivot.scale(ƒ.Vector3.ONE(0.2));
            this.local.rotateY(Math.random() * 360);

            ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
        }

        public update = (_event: Event) => {
            this.local.rotateY(1);
            this.pivot.rotateX(5);
        }
    }
}