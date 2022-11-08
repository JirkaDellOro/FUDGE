namespace FudgeCore {
    export class XRViewport extends Viewport {
        //region static  VR Attributes
        static #xrSession: XRSession = null;
        static #xrReferenceSpace: XRReferenceSpace = null;
        static #xrFrame: XRFrame = null;
        static #xrCamera: ComponentCamera = null;
        static #physisDebugMode: PHYSICS_DEBUGMODE = PHYSICS_DEBUGMODE.NONE;
        static #rightController: ComponentTransform = new ComponentTransform();
        static #leftController: ComponentTransform = new ComponentTransform();

        constructor() {
            super();
        }
        //region static getter/setter VR Attributes 
        public static set xrFrame(_xrFrame: XRFrame) {
            XRViewport.#xrFrame = _xrFrame;
            Render.drawXR(XRViewport.#xrCamera, XRViewport.#xrFrame, this.#physisDebugMode);
        }
        public static set rightController(_rCntrlTransform: ComponentTransform) {
            XRViewport.#rightController.mtxLocal = _rCntrlTransform.mtxLocal;
        }
        public static set leftController(_lCntrlTransform: ComponentTransform) {
            XRViewport.#leftController.mtxLocal = _lCntrlTransform.mtxLocal;
        }
        public static set xrSession(_xrSession: XRSession) {
            XRViewport.#xrSession = _xrSession;
        }
        public static set xrReferenceSpace(_xrReferenceSpace: XRReferenceSpace) {
            XRViewport.#xrReferenceSpace = _xrReferenceSpace;
        }


        public static get rightController(): ComponentTransform {
            if (XRViewport.#rightController)
                return XRViewport.#rightController;
            else return null;
        }
        public static get leftController(): ComponentTransform {
            if (XRViewport.#leftController)
                return XRViewport.#leftController;
            else return null;
        }

        public static get xrSession(): XRSession {
            if (XRViewport.#xrSession)
                return XRViewport.#xrSession;
            else return null;
        }
        public static get xrReferenceSpace(): XRReferenceSpace {
            if (XRViewport.#xrReferenceSpace)
                return XRViewport.#xrReferenceSpace;
            else return null;
        }
        //#endregion
        //region static webXR functions
        public static setNewXRRigidtransform(_newPos: Vector3 = Vector3.ZERO(), _newRot: Vector3 = Vector3.ZERO()): void {
            this.#xrReferenceSpace = this.#xrReferenceSpace.getOffsetReferenceSpace(new XRRigidTransform(_newPos, _newRot));
        }
        public static setController(_xrFrame: XRFrame): void {
            if (XRViewport.xrSession.inputSources[0]) {
                XRViewport.rightController.mtxLocal.set(_xrFrame.getPose(XRViewport.xrSession.inputSources[0].targetRaySpace, XRViewport.xrReferenceSpace).transform.matrix);
            }
            if (XRViewport.xrSession.inputSources[1]) {
                XRViewport.leftController.mtxLocal.set(_xrFrame.getPose(XRViewport.xrSession.inputSources[1].targetRaySpace, XRViewport.xrReferenceSpace).transform.matrix);
            }
        }
        public static setRays(): void {
            let vecZLefttCntrl: Vector3 = XRViewport.leftController.mtxLocal.getZ();
            Physics.raycast(XRViewport.leftController.mtxLocal.translation, new Vector3(-vecZLefttCntrl.x, -vecZLefttCntrl.y, -vecZLefttCntrl.z), 80, true);

            let vecZRightCntrl: Vector3 = XRViewport.rightController.mtxLocal.getZ();
            Physics.raycast(XRViewport.rightController.mtxLocal.translation, new Vector3(-vecZRightCntrl.x, -vecZRightCntrl.y, -vecZRightCntrl.z), 80, true);
        }
        //#endregion


        public initialize(_name: string, _branch: Node, _camera: ComponentCamera, _canvas: HTMLCanvasElement): void {
            super.initialize(_name, _branch, _camera, _canvas);
            //#region VR Session
            XRViewport.#xrCamera = _camera;
            //#endregion
        }
        public draw(_calculateTransforms: boolean = true): void {
            if (XRViewport.xrSession == null) {
                super.draw(_calculateTransforms);
            }
            else {
                XRViewport.#physisDebugMode = this.physicsDebugMode;
                super.calculateDrawing(_calculateTransforms);
            }

        }
    }
}