namespace FudgeCore {
    /**
     * @author Valentin Schmidberger, HFU, 2022
     * VR Component Class, for Session Management, Controller Management and Reference Space Management. 
     */
    export class VRController {

        public cmpTransform: ComponentTransform = null;
        public gamePad: Gamepad = null;
        public thumbstickX: number = null;
        public thumbstickY: number = null;
    }

    export class VR {

        public rightCntrl: VRController = new VRController();
        public leftCntrl: VRController = new VRController();

        public deviceTransform: ComponentTransform = null;

        constructor() {
            this.initializeGamepads();
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
                                this.rightCntrl.cmpTransform.mtxLocal.set(_xrFrame.getPose(controller.targetRaySpace, XRViewport.default.referenceSpace).transform.matrix);
                                if (this.rightCntrl.gamePad) {
                                    this.rightCntrl.thumbstickX = controller.gamepad.axes[2];
                                    this.rightCntrl.thumbstickY = controller.gamepad.axes[3];
                                }
                            case ("left"):
                                this.leftCntrl.cmpTransform.mtxLocal.set(_xrFrame.getPose(controller.targetRaySpace, XRViewport.default.referenceSpace).transform.matrix);
                                if (this.leftCntrl.gamePad) {
                                    this.leftCntrl.thumbstickX = controller.gamepad.axes[2];
                                    this.leftCntrl.thumbstickY = controller.gamepad.axes[3];
                                }
                                break;
                        }
                    } catch (e: unknown) {
                        Debug.info("Input Sources Error: " + e);
                    }
                });
            }
        }

        private initializeGamepads(): void {
            XRViewport.default.session.inputSources.forEach(controller => {
                switch (controller.handedness) {
                    case ("right"):
                        this.rightCntrl.gamePad = controller.gamepad;
                        break;
                    case ("left"):
                        this.leftCntrl.gamePad = controller.gamepad;
                        break;
                }
            });
        }
        /**
* Sets a Vector3 as Position of the reference space.
*/
        public set positionDevice(_newPos: Vector3) {
            let invTranslation: Vector3 = Vector3.SCALE(Vector3.DIFFERENCE(_newPos, this.deviceTransform.mtxLocal.translation), -1);
            XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(invTranslation));
            this.deviceTransform.mtxLocal.translation = _newPos;
        }

        /**
         * Adds a Vector3 in Position of the reference space.
         */
        public translateDevice(_by: Vector3): void {
            let invTranslation: Vector3 = Vector3.SCALE(_by, -1);
            XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(invTranslation));
            this.deviceTransform.mtxLocal.translate(_by);
        }

        /**
         * Sets Vector3 Rotation of the reference space.
         * Rotation needs to be set in the Origin (0,0,0), otherwise the XR-Rig gets rotated around the origin. 
         */
        public set rotationDevice(_newRot: Vector3) {
            let newRot: Vector3 = Vector3.SCALE(Vector3.SUM(_newRot, this.deviceTransform.mtxLocal.rotation), Math.PI / 180);

            let orientation: Quaternion = new Quaternion();
            orientation.setFromVector3(newRot.x, newRot.y, newRot.z);
            //set xr - rig back to origin
            XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.DIFFERENCE(this.deviceTransform.mtxLocal.translation, Vector3.ZERO())));
            //rotate xr rig in origin
            XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.ZERO(), <DOMPointInit><unknown>orientation));
            //set xr - rig back to last position 
            XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.DIFFERENCE(Vector3.ZERO(), this.deviceTransform.mtxLocal.translation)));
            this.deviceTransform.mtxLocal.rotation = _newRot;
        }

        /**
         * Adds a Vector3 in Rotation of the reference space.
         * Rotation needs to be added in the Origin (0,0,0), otherwise the XR-Rig gets rotated around the origin. 
         */
        public rotateDevice(_by: Vector3): void {
            let rotAmount: Vector3 = Vector3.SCALE(_by, Math.PI / 180);

            let orientation: Quaternion = new Quaternion();
            orientation.setFromVector3(rotAmount.x, rotAmount.y, rotAmount.z);

            //set xr - rig back to origin
            XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.DIFFERENCE(this.deviceTransform.mtxLocal.translation, Vector3.ZERO())));
            //rotate xr rig in origin
            XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.ZERO(), <DOMPointInit><unknown>orientation));
            //set xr - rig back to last position 
            XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.DIFFERENCE(Vector3.ZERO(), this.deviceTransform.mtxLocal.translation)));
            this.deviceTransform.mtxLocal.rotate(_by);
        }
    }
}