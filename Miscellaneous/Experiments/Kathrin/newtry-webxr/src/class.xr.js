"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const THREE_1 = require("THREE");
class XR {
    constructor(xrCanvas) {
        this.surfaces = false;
        this.hitTesting = false;
        this.maxModels = 10;
        this.models = new Array();
        this.xrCanvas = xrCanvas;
        this.startSession = this.startSession.bind(this);
        this.onXRFrame = this.onXRFrame.bind(this);
        this.onHit = this.onHit.bind(this);
        this.addARObjectAt = this.addARObjectAt.bind(this);
        this.onSessionEnd = this.onSessionEnd.bind(this);
    }
    /**
     * Initialize XR - Check for available XR Device
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (navigator.xr && XRSession.prototype.requestHitTest) {
                yield navigator.xr
                    .requestDevice()
                    .then((device) => {
                    this.device = device;
                    return this.device;
                })
                    .catch(error => {
                    return this.onNoXRDevice(error.message);
                });
            }
            else {
                return this.onNoXRDevice("Your browser does not support WebXR");
            }
        });
    }
    /**
     * Start a XRSession
     */
    startSession() {
        const ctx = this.xrCanvas.getContext("xrpresent");
        this.device
            .requestSession({ outputContext: ctx, environmentIntegration: true })
            .then((session) => {
            this.session = session;
            this.xrCanvas.classList.add("active");
            this.onSessionStarted();
        })
            .catch(err => {
            return this.onNoXRDevice(err.message);
        });
    }
    /**
     * Show no XRDevice found message
     * @return {string} message
     */
    onNoXRDevice(message) {
        let msg = message ? message : "Could not find any XRDevices for creating XR-Contents";
        document.body.classList.add("unsupported");
        return msg;
    }
    /**
     * Enable/disable hit testing.
     * Default is false.
     * @param {boolean} enabled
     */
    enableHitTest(enabled) {
        this.hitTesting = enabled;
    }
    /**
     * Called when the XRSession has begun.
     * Creating the Scene
     * Start render loop
     */
    onSessionStarted() {
        return __awaiter(this, void 0, void 0, function* () {
            document.body.classList.add("ar");
            this.gl = this.createWebGLRenderingContext();
            // Ensure that the context want to write to is compatible with the XRDevice
            yield this.gl.setCompatibleXRDevice(this.session.device);
            // Set the session's baseLayer to an XRWebGLLayer using the renderer context
            this.session.baseLayer = new XRWebGLLayer(this.session, this.gl);
            this.createVirtualWorld();
            this.frameOfRef = yield this.session.requestFrameOfReference("eye-level");
            this.session.requestAnimationFrame(this.onXRFrame);
        });
    }
    createWebGLRenderingContext() {
        this.renderer = new THREE_1.WebGLRenderer({
            alpha: true,
            preserveDrawingBuffer: true
        });
        this.renderer.autoClear = false;
        return this.renderer.getContext();
    }
    createVirtualWorld() {
        this.scene = new THREE_1.Scene();
        const LIGHT = new THREE_1.AmbientLight(0xffffff, 1);
        const DIRECTIONAL_LIGHT = new THREE_1.DirectionalLight(0xffffff, 0.3);
        DIRECTIONAL_LIGHT.position.set(10, 15, 10);
        this.scene.add(LIGHT);
        this.scene.add(DIRECTIONAL_LIGHT);
        this.camera = new THREE_1.PerspectiveCamera();
        this.camera.matrixAutoUpdate = false;
    }
    /**
     * Called on the XRSession's requestAnimationFrame.
     * Called with the time and XRPresentationFrame.
     * @param {number} time
     * @param {XRPresentationFrame} frame
     */
    onXRFrame(time, frame) {
        this.time = time;
        this.frame = frame;
        if (this.session) {
            let session = frame.session;
            let pose = frame.getDevicePose(this.frameOfRef);
            // Check for surfaces
            if (!this.surfaces) {
                this.checkForSurfaces(frame);
            }
            // Queue up the next frame
            session.requestAnimationFrame(this.onXRFrame);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.session.baseLayer.framebuffer);
            // Keep real world camera view and virtual world camera in sync
            if (pose) {
                for (let view of frame.views) {
                    const viewport = session.baseLayer.getViewport(view);
                    this.renderer.setSize(viewport.width, viewport.height);
                    this.camera.projectionMatrix.fromArray(view.projectionMatrix);
                    const VIEW_MATRIX = new THREE_1.Matrix4().fromArray(pose.getViewMatrix(view));
                    this.camera.matrix.getInverse(VIEW_MATRIX);
                    this.camera.updateMatrixWorld(true);
                    // Render our scene with our THREE.WebGLRenderer
                    this.renderer.render(this.scene, this.camera);
                }
            }
        }
        else {
            document.body.classList.remove("ar");
            document.body.classList.remove("surfaces");
            this.xrCanvas.classList.remove("active");
        }
    }
    /**
     * Function binded to session for input Events
     * Fires "hits"-Event when Input is hitting a surface
     * @param event
     */
    onHit(event) {
        return __awaiter(this, void 0, void 0, function* () {
            let rayOrigin = new THREE_1.Vector3();
            let rayDirection = new THREE_1.Vector3();
            let inputPose = event.frame.getInputPose(event.inputSource, this.frameOfRef);
            let devicePose = event.frame.getDevicePose(this.frameOfRef);
            if (!inputPose) {
                return;
            }
            if (inputPose.targetRay) {
                rayOrigin.set(inputPose.targetRay.origin.x, inputPose.targetRay.origin.y, inputPose.targetRay.origin.z);
                rayDirection.set(inputPose.targetRay.direction.x, inputPose.targetRay.direction.y, inputPose.targetRay.direction.z);
                yield event.frame.session
                    .requestHitTest(new Float32Array(rayOrigin.toArray()), new Float32Array(rayDirection.toArray()), this.frameOfRef)
                    .then(results => {
                    this._hitEvent = new CustomEvent("hits", {
                        detail: {
                            hits: results,
                            devicePose: devicePose
                        }
                    });
                    if (results.length > 0) {
                        this.xrCanvas.dispatchEvent(this._hitEvent);
                    }
                    else {
                        let toast = document.getElementById("toast");
                        toast.innerHTML = "No plane detected here";
                        if (toast.classList.contains("show")) {
                            toast.classList.remove("show");
                            toast.classList.add("show");
                        }
                    }
                })
                    .catch(err => {
                    return err;
                });
            }
        });
    }
    /**
     * Check if their are surfaces ready, then activate click handler
     * Showing hint until surfaces class on body
     * @param {XRFrame} frame
     */
    checkForSurfaces(frame) {
        let rayOrigin = new THREE_1.Vector3();
        let rayDirection = new THREE_1.Vector3();
        const origin = new Float32Array(rayOrigin.toArray());
        const direction = new Float32Array(rayDirection.toArray());
        frame.session
            .requestHitTest(origin, direction, this.frameOfRef)
            .then(hits => {
            if (hits.length > 0) {
                console.log("got surface");
                this.surfaces = true;
                document.body.classList.add("surfaces");
                if (this.hitTesting) {
                    frame.session.addEventListener("select", this.onHit);
                }
            }
        })
            .catch(err => {
            // still searching for surfaces
        });
    }
    /**
     * add an object to a spezified point in virtual world
     * @param {Array<number>} matrix
     * @param {Array<number>} lookAtMatrix
     * @param {THREE.Group} model
     */
    addARObjectAt(matrix, lookAtMatrix, model) {
        let newModel = model.clone();
        newModel.visible = true;
        let hitMatrix = new THREE_1.Matrix4().fromArray(matrix);
        newModel.position.setFromMatrixPosition(hitMatrix);
        let poseMatrix = new THREE_1.Matrix4().fromArray(lookAtMatrix);
        let position = new THREE_1.Vector3();
        position.setFromMatrixPosition(poseMatrix);
        position.y = newModel.position.y;
        newModel.lookAt(position);
        //newModel.setRotationFromMatrix(poseMatrix); //################# ???? ONLY ROTATE Y ???? ##################
        this.scene.add(newModel);
        this.models.push(newModel);
        if (this.models.length > this.maxModels) {
            let oldModel = this.models.shift();
            this.scene.remove(oldModel);
        }
    }
    /**
     * Stops the XRSession
     */
    endXRSession() {
        if (this.session) {
            this.session.end().then(this.onSessionEnd);
        }
    }
    /**
     * Things to do when XRSession is stopped
     */
    onSessionEnd() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.session = null;
        this.onXRFrame(this.time, this.frame);
    }
}
exports.XR = XR;
//# sourceMappingURL=class.xr.js.map