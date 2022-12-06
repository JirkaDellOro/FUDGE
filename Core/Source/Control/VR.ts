namespace FudgeCore {
    export class VR extends Component {

        public rightController: ComponentTransform = null;
        public leftController: ComponentTransform = null;
        public rayHitInfoRight: RayHitInfo;
        public rayHitInfoLeft: RayHitInfo;
        public xrSession: XRSession = null;
        public xrReferenceSpace: XRReferenceSpace = null;

        //sets new position in the reference space of xrSession, also known as teleportation
        public setNewXRRigidtransform(_newPos: Vector3 = Vector3.ZERO(), _newRot: Vector3 = Vector3.ZERO()): void {
            this.xrReferenceSpace = this.xrReferenceSpace.getOffsetReferenceSpace(new XRRigidTransform(_newPos, _newRot));
        }
        //sets controller matrices 
        public setController(_xrFrame: XRFrame): void {
            if (this.xrSession.inputSources.length > 0)
                this.xrSession.inputSources.forEach(controller => {
                    try {
                        switch (controller.handedness) {
                            case ("right"):
                                this.rightController.mtxLocal.set(_xrFrame.getPose(controller.targetRaySpace, this.xrReferenceSpace).transform.matrix);
                                break;
                            case ("left"):
                                this.leftController.mtxLocal.set(_xrFrame.getPose(controller.targetRaySpace, this.xrReferenceSpace).transform.matrix);
                                break;
                        }
                    } catch (e: unknown) {
                        Debug.info("Input Sources Error: " + e);
                    }

                });
        }
        //just for testing porpuses, rays get drawed only on one screen if they are not setted here // have to investigate why
        public setRay(): void {
            let vecZCntrlR: Vector3 = this.rightController.mtxLocal.getZ();
            this.rayHitInfoRight = Physics.raycast(this.rightController.mtxLocal.translation, new Vector3(-vecZCntrlR.x, -vecZCntrlR.y, -vecZCntrlR.z), 80, true);
            let vecZCntrlL: Vector3 = this.leftController.mtxLocal.getZ();
            this.rayHitInfoLeft = Physics.raycast(this.leftController.mtxLocal.translation, new Vector3(-vecZCntrlL.x, -vecZCntrlL.y, -vecZCntrlL.z), 80, true);
        }

    }
}