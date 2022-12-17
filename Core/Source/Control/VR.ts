namespace FudgeCore {
    /**
     * @author Valentin Schmidberger, HFU, 2022
     * VR Component Class, for Session Management, Controller Management and Reference Space Management. 
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
        private actualPos: Vector3 = Vector3.ZERO();


        /**
         * Sets a Vector3 in the reference space of XR Session.
         */
        public setPositionVRRig(_newPos: Vector3 = Vector3.ZERO()): void {
            let posAddToVRRig: Vector3 = Vector3.DIFFERENCE(_newPos, this.actualPos);
            this.actualPos = Vector3.SUM(this.actualPos, posAddToVRRig);
            let invTranslation: Vector3 = Vector3.SCALE(posAddToVRRig, -1);

            XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(invTranslation));
        }
        /**
         * Adds Vector3 Rotation in the reference space of XR Session. 
         * Rotation needs to be added in the Origin (0,0,0), otherwise the XR-Rig gets rotated around the origin. 
         */
        public rotateVRRig(_newRot: Vector3): void {
            let newRot: Vector3 = Vector3.SCALE(_newRot, Math.PI / 180)
            let orientation: Quaternion = new Quaternion();
            orientation.setFromVector3(newRot.x, newRot.y, newRot.z);

            //set xr - rig back to origin
            XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.DIFFERENCE(this.actualPos, Vector3.ZERO())));
            //rotate xr rig in origin
            XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.ZERO(), <DOMPointInit><unknown>orientation));
            //set xr - rig back to last position 
            XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.DIFFERENCE(Vector3.ZERO(), this.actualPos)));
        }

        /**
         * Sets controller matrices, gamepad references and thumbsticks movements.
         */
        public setController(_xrFrame: XRFrame): void {
            if (XRViewport.default.session.inputSources.length > 0) {
                XRViewport.default.session.inputSources.forEach(controller => {
                    try {
                        switch (controller.handedness) {
                            case ("right"):
                                this.rController.cntrlTransform.mtxLocal.set(_xrFrame.getPose(controller.targetRaySpace, XRViewport.default.referenceSpace).transform.matrix);
                                if (this.rController.gamePad) {
                                    this.rController.thumbstickX = controller.gamepad.axes[2];
                                    this.rController.thumbstickY = controller.gamepad.axes[3];
                                }
                                if (!this.rController.gamePad)
                                    this.rController.gamePad = controller.gamepad;
                                break;
                            case ("left"):
                                this.lController.cntrlTransform.mtxLocal.set(_xrFrame.getPose(controller.targetRaySpace, XRViewport.default.referenceSpace).transform.matrix);
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