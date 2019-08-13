import { WebGLRenderer, Scene, PerspectiveCamera, Group, Matrix4, Vector3, Object3D, Raycaster } from "THREE";
import { ReturnMessage } from "../utils/class.utils";
import { Reticle } from "./class.reticle";

export class XR {
	private _session: XRSession;
	private _device: XRDevice;
	private _frameOfRef: XRFrameOfReference | XRCoordinateSystem;

	private _time: number;
	private _frame: XRFrame;

	private _hitTesting: boolean = false;

	private _xrCanvas: HTMLCanvasElement;
	private _renderer: WebGLRenderer;
	private _gl: WebGLRenderingContext;
	private _scene: Scene;
	private _camera: PerspectiveCamera;

	private _reticle: Reticle;
	private _showReticle: boolean = false;

	private _maxModels: number = 10;
	private _models: Array<Group> = new Array<Group>();

	private _raycaster: Raycaster;
	public hitEvent: CustomEvent;
	private _eventListenerAdded: boolean = false;

	constructor(xrCanvas: HTMLCanvasElement, renderer: WebGLRenderer, camera: PerspectiveCamera) {
		this._xrCanvas = xrCanvas;
		this._renderer = renderer;
		this._camera = camera;
		this._raycaster = this._raycaster ? this._raycaster : new Raycaster();
		this._reticle = new Reticle(this._xrCanvas.parentElement);

		this.startSession = this.startSession.bind(this);
		this.onXRFrame = this.onXRFrame.bind(this);
		this.onHit = this.onHit.bind(this);
		this.addARObjectAt = this.addARObjectAt.bind(this);
		this.onSessionEnd = this.onSessionEnd.bind(this);
		this.setupWebGLLayer = this.setupWebGLLayer.bind(this);
	}

	/**
	 * Enable/disable hit testing.
	 * Default is false.
	 * @param {boolean} enabled
	 */
	set enableHitTest(enabled: boolean) {
		this._hitTesting = enabled;
	}

	/**
	 * Enable/disable showing the reticle
	 * Default is true
	 * @param {boolean} enabled
	 */
	set enableReticleDistance(enabled: boolean) {
		this._reticle.enableReticleDistance = enabled;
	}

	/**
	 * Enable/disable showing the reticle
	 * Default is true
	 * @param {boolean} enabled
	 */
	set enableReticle(enabled: boolean) {
		this._showReticle = enabled;
	}

	/**
	 * Set the object to show as reticle
	 * @param {Object3D} object
	 */
	set reticle(object: Object3D) {
		this._reticle.objectToShow = object;
	}

	/**
	 * Initialize XR - Check for available XR Device
	 * @returns {Promise<ReturnMessage>} Request was successful or not
	 */
	async init(): Promise<ReturnMessage> {
		if (navigator.xr && XRSession.prototype.requestHitTest) {
			return new Promise((resolve, reject) => {
				navigator.xr
					.requestDevice()
					.then((device: XRDevice) => {
						this._device = device;
						resolve(new ReturnMessage(true, "Could access XRDevice"));
					})
					.catch(error => {
						reject(this.onNoXRDevice(error.message));
					});
			});
		} else {
			return this.onNoXRDevice("Your browser does not support WebXR");
		}
	}

	/**
	 * Start a XRSession and add the virtual scene from the callback
	 * @param {VirtualWorldCallback} callback
	 * @returns {Promise<ReturnMessage>} result
	 */
	startSession(callback: VirtualWorldCallback): Promise<ReturnMessage> {
		const ctx: XRPresentationContext = this._xrCanvas.getContext("xrpresent");

		return new Promise((resolve, reject) => {
			this._device
				.requestSession({ outputContext: ctx, environmentIntegration: true })
				.then((session: XRSession) => {
					this._session = session;
					this._xrCanvas.classList.add("active");
					this.onSessionStarted(callback);
					resolve(new ReturnMessage(true, "Started Session"));
				})
				.catch(err => {
					console.error(err.message);
					reject(this.onNoXRDevice(err.message));
				});
		});
	}

	/**
	 * Called when the XRSession has begun.
	 * Set the virtual scene from callback.
	 * Start the render loop.
	 * @param {VirtualWorldCallback} callback
	 */
	async onSessionStarted(callback: VirtualWorldCallback): Promise<void> {
		document.body.classList.add("ar");

		// Check that the GL content is compatible with the XRDevice
		this.setupWebGLLayer()
			.then(() => {
				this._scene = callback();
				this._session.baseLayer = new XRWebGLLayer(this._session, this._gl);
			})
			.then(() => {
				this._session.requestFrameOfReference("eye-level").then(frameOfRef => {
					this._frameOfRef = frameOfRef;
				});
				this._session.requestAnimationFrame(this.onXRFrame);
			});
	}

	/**
	 * Called on the XRSession's requestAnimationFrame.
	 * Called with the time and XRPresentationFrame.
	 * @param {number} time
	 * @param {XRPresentationFrame} frame
	 */
	onXRFrame(time: number, frame: XRPresentationFrame): void {
		this._time = time;
		this._frame = frame;

		if (this._session) {
			let session = frame.session;
			let pose = frame.getDevicePose(this._frameOfRef);

			this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._session.baseLayer.framebuffer);
			// Queue up the next frame
			session.requestAnimationFrame(this.onXRFrame);

			// Check for surfaces
			if (!this._showReticle) {
				this.checkForSurfaces(frame);
			}

			// Show reticle
			if (this._showReticle) {
				this._scene.add(this._reticle.objectToShow);
				this._reticle.update(this._camera, this._session, this._frameOfRef);

				if (this._reticle.visible) {
					document.body.classList.add("surfaces");

					if (this._hitTesting && !this._eventListenerAdded) {
						frame.session.addEventListener("select", this.onHit);
						this._eventListenerAdded = true;
					}
				}
			}

			// Keep real world camera view and virtual world camera in sync
			if (pose) {
				for (let view of frame.views) {
					const viewport = session.baseLayer.getViewport(view);
					this._renderer.setSize(viewport.width, viewport.height);

					this._camera.projectionMatrix.fromArray(Array.from(view.projectionMatrix));
					const VIEW_MATRIX = new Matrix4().fromArray(Array.from(pose.getViewMatrix(view)));
					this._camera.matrix.getInverse(VIEW_MATRIX);
					this._camera.updateMatrixWorld(true);

					// Render the scene
					this._renderer.render(this._scene, this._camera);
				}
			}
		} else {
			document.body.classList.remove("ar");
			document.body.classList.remove("surfaces");
			this._xrCanvas.classList.remove("active");
		}
	}

	/**
	 * Stops the XRSession
	 */
	endXRSession(): void {
		if (this._session) {
			this._session.end().then(this.onSessionEnd);
		}
	}

	/**
	 * Things to do when XRSession is stopped
	 */
	onSessionEnd() {
		this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
		this._session = null;
		this.onXRFrame(this._time, this._frame);
	}

	/**
	 * Setup WebGLLayer for compatibility with device
	 * @returns {Promise<void>}
	 */
	async setupWebGLLayer(): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this._gl = this._renderer.getContext();
				this._gl.setCompatibleXRDevice(this._session.device);
				resolve();
			} catch (error) {
				reject();
			}
		});
	}

	/**
	 * Show no XRDevice found message
	 * @param {string} message
	 * @returns {ReturnMessage} result
	 */
	onNoXRDevice(message?: string): ReturnMessage {
		let msg = message ? message : "Could not find any XRDevices for creating XR-Contents";
		document.body.classList.add("unsupported");
		return new ReturnMessage(false, msg);
	}

	/**
	 * Function binded to session for input events.
	 * Fires "hits"-Event when input is hitting a surface
	 * @param {XRInputSourceEvent} event
	 *
	 */
	onHit(event: XRInputSourceEvent): Promise<void> {
		let rayOrigin = new Vector3();
		let rayDirection = new Vector3();

		let inputPose = event.frame.getInputPose(event.inputSource, this._frameOfRef);
		let devicePose = event.frame.getDevicePose(this._frameOfRef);

		if (!inputPose) {
			return;
		}

		if (this._showReticle) {
			rayOrigin.set(this._reticle.origin.x, this._reticle.origin.y, this._reticle.origin.z);
			rayDirection.set(this._reticle.direction.x, this._reticle.direction.y, this._reticle.direction.z);
		} else if (!this._showReticle && inputPose.targetRay) {
			rayOrigin.set(inputPose.targetRay.origin.x, inputPose.targetRay.origin.y, inputPose.targetRay.origin.z);
			rayDirection.set(inputPose.targetRay.direction.x, inputPose.targetRay.direction.y, inputPose.targetRay.direction.z);
		} else {
			return;
		}

		this._session
			.requestHitTest(new Float32Array(rayOrigin.toArray()), new Float32Array(rayDirection.toArray()), this._frameOfRef)
			.then((results: Array<XRHitResult>) => {
				this.hitEvent = new CustomEvent("hits", {
					detail: {
						hits: results,
						devicePose: devicePose
					}
				});
				if (results.length > 0) {
					this._xrCanvas.dispatchEvent(this.hitEvent);
				} else {
					this.showToast("No plane detected here");
				}
			})
			.catch(err => {
				return err;
			});
	}

	/**
	 * Check if their are surfaces ready, then activate input handler
	 * Showing hint until surfaces class on body
	 * @param {XRFrame} frame
	 */
	checkForSurfaces(frame: XRFrame): void {
		let rayOrigin = new Vector3();
		let rayDirection = new Vector3();

		const origin = new Float32Array(rayOrigin.toArray());
		const direction = new Float32Array(rayDirection.toArray());

		this._raycaster = this._raycaster ? this._raycaster : new Raycaster();
		this._raycaster.setFromCamera({ x: 0, y: 0 }, this._camera);
		const ray = this._raycaster.ray;

		this._session
			.requestHitTest(new Float32Array(ray.origin.toArray()), new Float32Array(ray.direction.toArray()), this._frameOfRef)

			// frame.session
			// 	.requestHitTest(origin, direction, this._frameOfRef)
			.then(hits => {
				if (hits.length > 0) {
					console.log("got surface");
					document.body.classList.add("surfaces");

					if (this._hitTesting) {
						frame.session.addEventListener("select", this.onHit);
					}
				} else {
					console.log("searching for surfaces");
				}
			})
			.catch(error => {
				// checking for surfaces
				console.log("searching for surfaces");
			});
	}

	/**
	 * add an object to a specified point in virtual world
	 * @param {Array<number>} matrix
	 * @param {Array<number>} lookAtMatrix
	 * @param {THREE.Group} model
	 */
	addARObjectAt(matrix: Array<number>, lookAtMatrix: Array<number>, model: THREE.Group): void {
		let newModel = model.clone();
		newModel.visible = true;
		let hitMatrix = new Matrix4().fromArray(matrix);
		newModel.position.setFromMatrixPosition(hitMatrix);
		newModel.name = "Fox";
		let poseMatrix = new Matrix4().fromArray(lookAtMatrix);
		let position = new Vector3();
		position.setFromMatrixPosition(poseMatrix);
		position.y = newModel.position.y;

		newModel.lookAt(position);

		if (this._models.length > this._maxModels) {
			let oldModel = this._models.shift();
			this._scene.remove(oldModel);
		}

		this._scene.add(newModel);
		this._models.push(newModel);
	}

	/**
	 * Show error message in form of a toast for user
	 * @param message
	 */
	private showToast(message: string): void {
		let toast = document.getElementById("toast");
		toast.innerHTML = message;
		if (toast.classList.contains("show")) {
			toast.classList.remove("show");
			toast.classList.add("show");
		}
	}
}

export type VirtualWorldCallback = () => Scene;
