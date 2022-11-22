namespace FudgeCore {
    export class XRTool {

        public rightController: XRController = null;
        public leftController: XRController = null;
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
                        Debug.info("Input Sources disconnected: " + e);
                    }

                });
            else
                Debug.info("No Input Devices detected");
        }

    }
}