namespace ScreenToRayToScreen {
    import ƒ = FudgeCore;

    export class CameraOrbit extends ƒ.Node {
        private maxRotX: number = 75;
        private minDistance: number = 10;

        public constructor(_maxRotX: number) {
            super("CameraOrbit");

            this.maxRotX = Math.min(_maxRotX, 89);

            let cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
            this.addComponent(cmpTransform);

            let rotatorX: ƒ.Node = new ƒ.Node("CameraRotX");
            rotatorX.addComponent(new ƒ.ComponentTransform());
            this.appendChild(rotatorX);

            let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
            cmpCamera.backgroundColor = ƒ.Color.CSS("WHITE");
            rotatorX.addComponent(cmpCamera);
            this.setDistance(20);
        }

        public get cmpCamera(): ƒ.ComponentCamera {
            return this.rotatorX.getComponent(ƒ.ComponentCamera);
        }

        public get rotatorX(): ƒ.Node {
            return this.getChildrenByName("CameraRotX")[0];
        }

        public setDistance(_distance: number): void {
            let newDistance: number = Math.max(this.minDistance, _distance);
            this.cmpCamera.pivot.translation = ƒ.Vector3.Z(newDistance);
        }

        public getDistance(): number {
            return this.cmpCamera.pivot.translation.z;
        }

        public moveDistance(_delta: number): void {
            this.setDistance(this.cmpCamera.pivot.translation.z + _delta);
        }

        public setRotationY(_angle: number): void {
            this.cmpTransform.local.rotation = ƒ.Vector3.Y(_angle);
        }


        public setRotationX(_angle: number): void {
            _angle = Math.min(Math.max(-this.maxRotX, _angle), this.maxRotX);
            this.rotatorX.cmpTransform.local.rotation = ƒ.Vector3.X(_angle);
        }

        public rotateY(_delta: number): void {
            this.cmpTransform.local.rotateY(_delta);
        }

        public rotateX(_delta: number): void {
            let angle: number = this.rotatorX.cmpTransform.local.rotation.x + _delta;
            this.setRotationX(angle);
        }

        public translate(_delta: number): void {
            let distance: number = this.cmpCamera.pivot.translation.z + _delta;
            this.setDistance(distance);
        }

        public getRotationY(): number {
            return this.cmpTransform.local.rotation.y;
        }
        public getSegmentY(): number {
            return (4 + Math.floor((-this.getRotationY() + 45) / 90)) % 4;
        }
    }
}
