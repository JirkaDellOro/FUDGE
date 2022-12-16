namespace FudgeCore {
    /**
     * @author Valentin Schmidberger, HFU, 2022
     * VR Component Class, for Session Management, Controller Management and Reference Space setting. 
     */
    export class VRController {

        public cntrlTransform: ComponentTransform = null;
        public gamePad: Gamepad = null;
        public thumbstickX: number = null;
        public thumbstickY: number = null;
    }

    export class VR extends Component {

        public rController: VRController = new VRController();
        public lController: VRController = new VRController();
        public session: XRSession = null;
        public referenceSpace: XRReferenceSpace = null;

        /**
         * Sets new position in the reference space of  XR Session, also known as teleportation.
         */
        public setNewXRRigidtransform(_newPos: Vector3 = Vector3.ZERO(), _newDir: Vector3 = Vector3.ZERO()): void {
            let orientation: Quaternion = new Quaternion();
            let pos: Vector3 = new Vector3(_newPos.x, -_newPos.y, _newPos.z);
            orientation.setFromVector3(_newDir.x, _newDir.y, _newDir.z);
            // this.referenceSpace = this.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(pos, <DOMPointInit><unknown>orientation));
            this.referenceSpace = this.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.ZERO(), <DOMPointInit><unknown>orientation));
            this.referenceSpace = this.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(pos));


            console.log(this.referenceSpace);
        }

        /**
         * Sets controller matrices, gamepad references and thumbsticks movements.
         */
        public setController(_xrFrame: XRFrame): void {
            if (this.session.inputSources.length > 0) {
                this.session.inputSources.forEach(controller => {
                    try {
                        switch (controller.handedness) {
                            case ("right"):
                                this.rController.cntrlTransform.mtxLocal.set(_xrFrame.getPose(controller.targetRaySpace, this.referenceSpace).transform.matrix);
                                if (this.rController.gamePad) {
                                    this.rController.thumbstickX = controller.gamepad.axes[2];
                                    this.rController.thumbstickY = controller.gamepad.axes[3];
                                }
                                if (!this.rController.gamePad)
                                    this.rController.gamePad = controller.gamepad;
                                break;
                            case ("left"):
                                this.lController.cntrlTransform.mtxLocal.set(_xrFrame.getPose(controller.targetRaySpace, this.referenceSpace).transform.matrix);
                                if (this.lController.gamePad) {
                                    this.lController.thumbstickX = controller.gamepad.axes[2];
                                    this.lController.thumbstickY = controller.gamepad.axes[3];
                                }
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