namespace FudgeCore {
    /**
     * @author Valentin Schmidberger, HFU, 2022
     * VR Component Class, for Session Management, Controller Management and Reference Space Management. 
     */
    export class VRController {

        public cntrlTransform: ComponentTransform = null; //cmpTransform 
        public gamePad: Gamepad = null;
        public thumbstickX: number = null;
        public thumbstickY: number = null;
    }

    export class VR {

        public rController: VRController = new VRController(); // right - left ausschreiben!!!
        public lController: VRController = new VRController();
        constructor() {
            this.initilizeGamepads();

        }
        public setControllerConfigs(_xrFrame: XRFrame): void {
            if (_xrFrame)
                this.setController(_xrFrame);
        }
        /**
         * Sets controller matrices, gamepad references and thumbsticks movements.
         */
        private setController(_xrFrame: XRFrame): void {
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
                            case ("left"):
                                this.lController.cntrlTransform.mtxLocal.set(_xrFrame.getPose(controller.targetRaySpace, XRViewport.default.referenceSpace).transform.matrix);
                                if (this.lController.gamePad) {
                                    this.lController.thumbstickX = controller.gamepad.axes[2];
                                    this.lController.thumbstickY = controller.gamepad.axes[3];
                                }
                                break;
                        }
                    } catch (e: unknown) {
                        Debug.info("Input Sources Error: " + e);
                    }
                });
            }
        }

        private initilizeGamepads(): void {
            XRViewport.default.session.inputSources.forEach(controller => {
                switch (controller.handedness) {
                    case ("right"):
                        this.rController.gamePad = controller.gamepad;
                        break;
                    case ("left"):
                        this.lController.gamePad = controller.gamepad;
                        break;
                }
            });
        }

        /**
         * Sets a Vector3 as Position of the reference space.
         */
        public set rigPosition(_newPos: Vector3) {
            let invTranslation: Vector3 = Vector3.SCALE(Vector3.DIFFERENCE(_newPos, XRViewport.default.xrRigmtxLocal.translation), -1);
            XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(invTranslation));
            XRViewport.default.xrRigmtxLocal.translation = _newPos;
        }

        /**
         * Adds a Vector3 in Position of the reference space.
         */
        public translateRig(_by: Vector3): void {
            let invTranslation: Vector3 = Vector3.SCALE(_by, -1);
            XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(invTranslation));
            XRViewport.default.xrRigmtxLocal.translate(_by);
        }

        /**
         * Sets Vector3 Rotation of the reference space.
         * Rotation needs to be set in the Origin (0,0,0), otherwise the XR-Rig gets rotated around the origin. 
         */
        public set rigRotation(_newRot: Vector3) {
            let newRot: Vector3 = Vector3.SCALE(Vector3.SUM(_newRot, XRViewport.default.xrRigmtxLocal.rotation), Math.PI / 180);

            let orientation: Quaternion = new Quaternion();
            orientation.setFromVector3(newRot.x, newRot.y, newRot.z);
            //set xr - rig back to origin
            XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.DIFFERENCE(XRViewport.default.xrRigmtxLocal.translation, Vector3.ZERO())));
            //rotate xr rig in origin
            XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.ZERO(), <DOMPointInit><unknown>orientation));
            //set xr - rig back to last position 
            XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.DIFFERENCE(Vector3.ZERO(), XRViewport.default.xrRigmtxLocal.translation)));
            XRViewport.default.xrRigmtxLocal.rotation = _newRot;
        }

        /**
         * Adds a Vector3 in Rotation of the reference space.
         * Rotation needs to be added in the Origin (0,0,0), otherwise the XR-Rig gets rotated around the origin. 
         */
        public rotateRig(_by: Vector3): void {
            let rotAmount: Vector3 = Vector3.SCALE(_by, Math.PI / 180);

            let orientation: Quaternion = new Quaternion();
            orientation.setFromVector3(rotAmount.x, rotAmount.y, rotAmount.z);

            //set xr - rig back to origin
            XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.DIFFERENCE(XRViewport.default.xrRigmtxLocal.translation, Vector3.ZERO())));
            //rotate xr rig in origin
            XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.ZERO(), <DOMPointInit><unknown>orientation));
            //set xr - rig back to last position 
            XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.DIFFERENCE(Vector3.ZERO(), XRViewport.default.xrRigmtxLocal.translation)));
            XRViewport.default.xrRigmtxLocal.rotate(_by);
        }
    }
}