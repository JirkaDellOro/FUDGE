namespace FudgeCore {
    export class XRController extends ComponentTransform {
        public rayHit: RayHitInfo;
        public isRayHitInfo: boolean = false;

        //just for testing porpuses, rays get drawed only on one screen if they are not setted here // have to investigate why
        public setRay(): void {
            let vecZCntrl: Vector3 = this.mtxLocal.getZ();
            this.rayHit = Physics.raycast(this.mtxLocal.translation, new Vector3(-vecZCntrl.x, -vecZCntrl.y, -vecZCntrl.z), 80, true);
        }
    }
}