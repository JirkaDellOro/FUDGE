namespace Graph {
    import ƒ = FudgeCore;

    export class AnimateSatellite extends ƒ.ComponentScript {
        // tpo: test performance optimization
        private static mtxRotY: ƒ.Matrix4x4 = ƒ.Matrix4x4.ROTATION_Y(1);
        private static mtxRotX: ƒ.Matrix4x4 = ƒ.Matrix4x4.ROTATION_X(5);
        // :tpo
        private mtxLocal: ƒ.Matrix4x4;
        private mtxPivot: ƒ.Matrix4x4;

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
            this.mtxLocal = this.getContainer().mtxLocal;
            this.mtxPivot = (<ƒ.ComponentMesh>this.getContainer().getComponent(ƒ.ComponentMesh)).pivot;

            this.mtxPivot.translateZ(-0.5);
            this.mtxPivot.scale(ƒ.Vector3.ONE(0.2));
            this.mtxLocal.rotateY(Math.random() * 360);

            ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
        }

        public update = (_event: Event) => {
            // tpo: test performance optimization
            // this.mtxLocal.set(ƒ.Matrix4x4.MULTIPLICATION(this.mtxLocal, AnimateSatellite.mtxRotY));
            // this.mtxPivot.set(ƒ.Matrix4x4.MULTIPLICATION(this.mtxPivot, AnimateSatellite.mtxRotX));
            // :tpo
            this.mtxLocal.rotateY(1);
            this.mtxPivot.rotateX(5);
        }
    }
}