import { WebGLRenderer, Scene, PerspectiveCamera, Group, Matrix4, Vector3, AmbientLight, DirectionalLight } from "THREE";

export class XR {
	public session: XRSession;
	public device: XRDevice;
	public frameOfRef: XRFrameOfReference;

	private time: number;
	private frame: XRFrame;

	private surfaces: boolean = false;
	private hitTesting: boolean = false;

	private xrCanvas: HTMLCanvasElement;
	private renderer: WebGLRenderer;
	private gl: WebGLRenderingContext;
	private scene: Scene;
	private camera: PerspectiveCamera;

	private maxModels: number = 10;
	private models: Array<Group> = new Array<Group>();

	public _hitEvent: CustomEvent;

	constructor(xrCanvas: HTMLCanvasElement) {
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
	async init() {
		if (navigator.xr && XRSession.prototype.requestHitTest) {
			await navigator.xr
				.requestDevice()
				.then((device: XRDevice) => {
					this.device = device;
					return this.device;
				})
				.catch(error => {
					return this.onNoXRDevice(error.message);
				});
		} else {
			return this.onNoXRDevice("Your browser does not support WebXR");
		}
	}

	/**
	 * Start a XRSession
	 */
	startSession() {
		const ctx = this.xrCanvas.getContext("xrpresent");

		this.device
			.requestSession({ outputContext: ctx, environmentIntegration: true })
			.then((session: XRSession) => {
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
	onNoXRDevice(message?: string): string {
		let msg = message ? message : "Could not find any XRDevices for creating XR-Contents";
		document.body.classList.add("unsupported");
		return msg;
	}

	/**
	 * Enable/disable hit testing.
	 * Default is false.
	 * @param {boolean} enabled
	 */
	enableHitTest(enabled: boolean): void {
		this.hitTesting = enabled;
	}

	/**
	 * Called when the XRSession has begun.
	 * Creating the Scene
	 * Start render loop
	 */
	async onSessionStarted() {
		document.body.classList.add("ar");

		this.gl = this.createWebGLRenderingContext();

		// Ensure that the context want to write to is compatible with the XRDevice
		await this.gl.setCompatibleXRDevice(this.session.device);

		// Set the session's baseLayer to an XRWebGLLayer using the renderer context
		this.session.baseLayer = new XRWebGLLayer(this.session, this.gl);

		this.createVirtualWorld();

		this.frameOfRef = await this.session.requestFrameOfReference("eye-level");
		this.session.requestAnimationFrame(this.onXRFrame);
	}

	createWebGLRenderingContext(): WebGLRenderingContext {
		this.renderer = new WebGLRenderer({
			alpha: true,
			preserveDrawingBuffer: true
		});
		this.renderer.autoClear = false;
		return this.renderer.getContext();
	}

	createVirtualWorld(): void {
		this.scene = new Scene();
		const LIGHT = new AmbientLight(0xffffff, 1);

		const DIRECTIONAL_LIGHT = new DirectionalLight(0xffffff, 0.3);
		DIRECTIONAL_LIGHT.position.set(10, 15, 10);

		this.scene.add(LIGHT);
		this.scene.add(DIRECTIONAL_LIGHT);

		this.camera = new PerspectiveCamera();
		this.camera.matrixAutoUpdate = false;
	}

	/**
	 * Called on the XRSession's requestAnimationFrame.
	 * Called with the time and XRPresentationFrame.
	 * @param {number} time
	 * @param {XRPresentationFrame} frame
	 */
	onXRFrame(time, frame): void {
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
					const VIEW_MATRIX = new Matrix4().fromArray(pose.getViewMatrix(view));
					this.camera.matrix.getInverse(VIEW_MATRIX);
					this.camera.updateMatrixWorld(true);

					// Render our scene with our THREE.WebGLRenderer
					this.renderer.render(this.scene, this.camera);
				}
			}
		} else {
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
	async onHit(event: XRInputSourceEvent): Promise<Array<XRHitResult>> {
		let rayOrigin = new Vector3();
		let rayDirection = new Vector3();

		let inputPose = event.frame.getInputPose(event.inputSource, this.frameOfRef);
		let devicePose = event.frame.getDevicePose(this.frameOfRef);

		if (!inputPose) {
			return;
		}

		if (inputPose.targetRay) {
			rayOrigin.set(inputPose.targetRay.origin.x, inputPose.targetRay.origin.y, inputPose.targetRay.origin.z);
			rayDirection.set(inputPose.targetRay.direction.x, inputPose.targetRay.direction.y, inputPose.targetRay.direction.z);

			await event.frame.session
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
					} else {
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
	}

	/**
	 * Check if their are surfaces ready, then activate click handler
	 * Showing hint until surfaces class on body
	 * @param {XRFrame} frame
	 */
	checkForSurfaces(frame: XRFrame): void {
		let rayOrigin = new Vector3();
		let rayDirection = new Vector3();

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
	addARObjectAt(matrix: Array<number>, lookAtMatrix: Array<number>, model: THREE.Group): void {
		let newModel = model.clone();
		newModel.visible = true;
		let hitMatrix = new Matrix4().fromArray(matrix);
		newModel.position.setFromMatrixPosition(hitMatrix);
		let poseMatrix = new Matrix4().fromArray(lookAtMatrix);
		let position = new Vector3();
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
	endXRSession(): void {
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
