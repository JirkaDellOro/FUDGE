namespace FudgeCore {
    export class VR extends Component {

        public rController: ComponentTransform = null;
        public lController: ComponentTransform = null;
        public session: XRSession = null;
        public referenceSpace: XRReferenceSpace = null;

        //sets new position in the reference space of xrSession, also known as teleportation
        public setNewXRRigidtransform(_newPos: Vector3 = Vector3.ZERO(), _newRot: Vector3 = Vector3.ZERO()): void {
            this.referenceSpace = this.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(_newPos, _newRot));
        }
        //sets controller matrices 
        public setController(_xrFrame: XRFrame): void {
            if (this.session.inputSources.length > 0)
                this.session.inputSources.forEach(controller => {
                    try {
                        switch (controller.handedness) {
                            case ("right"):
                                this.rController.mtxLocal.set(_xrFrame.getPose(controller.targetRaySpace, this.referenceSpace).transform.matrix);
                                break;
                            case ("left"):
                                this.lController.mtxLocal.set(_xrFrame.getPose(controller.targetRaySpace, this.referenceSpace).transform.matrix);
                                break;
                        }
                    } catch (e: unknown) {
                        Debug.info("Input Sources Error: " + e);
                    }

                });
        }
    }
}