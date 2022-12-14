namespace FudgeCore {
    export class VR extends Component {

        public rController: VRController = new VRController();
        public lController: VRController = new VRController();
        public session: XRSession = null;
        public referenceSpace: XRReferenceSpace = null;

        //sets new position in the reference space of xrSession, also known as teleportation
        public setNewXRRigidtransform(_newPos: Vector3 = Vector3.ZERO(), _newRot: Vector3 = Vector3.ZERO()): void {
            this.referenceSpace = this.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(_newPos, _newRot));
        }
        //sets controller matrices 
        public setController(_xrFrame: XRFrame): void {
            if (this.session.inputSources.length > 0) {
                this.session.inputSources.forEach(controller => {
                    try {
                        switch (controller.handedness) {
                            case ("right"):
                                this.rController.cntrlTransform.mtxLocal.set(_xrFrame.getPose(controller.targetRaySpace, this.referenceSpace).transform.matrix);
                                this.rController.thumbstickX = controller.gamepad.axes[2];
                                this.rController.thumbstickY = controller.gamepad.axes[3];
                                if (!this.rController.gamePad)
                                    this.rController.gamePad = controller.gamepad;
                                break;
                            case ("left"):
                                this.lController.cntrlTransform.mtxLocal.set(_xrFrame.getPose(controller.targetRaySpace, this.referenceSpace).transform.matrix);
                                this.lController.thumbstickX = controller.gamepad.axes[2];
                                this.lController.thumbstickY = controller.gamepad.axes[3];
                                if (!this.lController.gamePad) {
                                    this.lController.gamePad = controller.gamepad;
                                }
                                break;
                        }
                    } catch (e: unknown) {
                        Debug.info("Input Sources Error: " + e);
                    }

                });
            }

        }
    }
}