namespace FudgeCore {
    export class XRViewport extends Viewport {
        //region static  VR Attributes
        static #xrSession: XRSession = null;
        static #xrReferenceSpace: XRReferenceSpace = null;
        static #xrFrame: XRFrame = null;
        static #xrCamera: ComponentCamera = null;


        constructor() {
            super();
        }
        //region static getter/setter VR Attributes 
        public static set xrFrame(_xrFrame: XRFrame) {
            XRViewport.#xrFrame = _xrFrame;
            Render.drawXR(XRViewport.#xrCamera, XRViewport.#xrFrame);
        }
        public static set xrSession(_xrSession: XRSession) {
            XRViewport.#xrSession = _xrSession;
        }
        public static set xrReferenceSpace(_xrReferenceSpace: XRReferenceSpace) {
            XRViewport.#xrReferenceSpace = _xrReferenceSpace;
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

        // DAS MUSS RAUS HIER 
        //#region VR EVENTS

        //#endregion


        public initialize(_name: string, _branch: Node, _camera: ComponentCamera, _canvas: HTMLCanvasElement): void {
            super.initialize(_name, _branch, _camera, _canvas);
            //#region VR Session
            XRViewport.#xrCamera = _camera;
            //#endregion
        }
    }
}