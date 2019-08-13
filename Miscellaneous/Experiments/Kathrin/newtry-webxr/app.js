/*
 * Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Container class to manage connecting to the WebXR Device API
 * and handle rendering on every frame.
 */
class App {
	constructor() {
		this.onXRFrame = this.onXRFrame.bind(this);
		this.startSession = this.startSession.bind(this);
		this.onSessionEnd = this.onSessionEnd.bind(this);
		this.addARObjectAt = this.addARObjectAt.bind(this);
		this.checkForSurfaces = this.checkForSurfaces.bind(this);

		this.onClick = this.onClick.bind(this);

		this.init();
	}

	/**
	 * Fetches the XRDevice, if available.
	 */
	async init() {
		// The entry point of the WebXR Device API is on `navigator.xr`.
		// We also want to ensure that `XRSession` has `requestHitTest`,
		// indicating that the #webxr-hit-test flag is enabled.
		if (navigator.xr && XRSession.prototype.requestHitTest) {
			navigator.xr
				.requestDevice()
				.then(device => {
					this.device = device;
				})
				.catch(error => {
					this.onNoXRDevice();
					return;
				});
		} else {
			// If `navigator.xr` or `XRSession.prototype.requestHitTest`
			// does not exist, we must display a message indicating there
			// are no valid devices.
			this.onNoXRDevice();
			return;
		}

		// We found an XRDevice! Bind a click listener on our "Enter AR" button
		// since the spec requires calling `device.requestSession()` within a
		// user gesture.
		document.querySelector("#enter-ar").addEventListener("click", this.startSession);
	}

	/**
	 * Handle a click event on the '#enter-ar' button and attempt to
	 * start an XRSession.
	 */
	async startSession() {
		// Now that we have an XRDevice, and are responding to a user
		// gesture, we must create an XRPresentationContext on a
		// canvas element.
		const outputCanvas = document.createElement("canvas");
		const ctx = outputCanvas.getContext("xrpresent");

		this.device
			.requestSession({ outputContext: ctx, environmentIntegration: true })
			.then(session => {
				this.session = session;

				document.body.appendChild(outputCanvas);
				const cancleBtn = document.getElementById("cancle-ar");
				cancleBtn.addEventListener("click", () => {
					this.endXRSession(this.session);
				});

				this.onSessionStarted(this.session);
			})
			.catch(err => {
				this.onNoXRDevice();
			});
	}

	/**
	 * Toggle on a class on the page to disable the "Enter AR"
	 * button and display the unsupported browser message.
	 */
	onNoXRDevice() {
		document.body.classList.add("unsupported");
	}

	/**
	 * Called when the XRSession has begun. Here we set up our three.js
	 * renderer, scene, and camera and attach our XRWebGLLayer to the
	 * XRSession and kick off the render loop.
	 */
	async onSessionStarted(session) {
		this.session = session;
		this.surfaces = false;

		// Add the `ar` class to our body, which will hide our 2D components
		document.body.classList.add("ar");

		// To help with working with 3D on the web, we'll use three.js. Set up
		// the WebGLRenderer, which handles rendering to our session's base layer.
		this.renderer = new THREE.WebGLRenderer({
			alpha: true,
			preserveDrawingBuffer: true
		});
		this.renderer.autoClear = false;

		this.gl = this.renderer.getContext();

		// Ensure that the context we want to write to is compatible
		// with our XRDevice
		await this.gl.setCompatibleXRDevice(this.session.device);

		// Set our session's baseLayer to an XRWebGLLayer
		// using our new renderer's context
		this.session.baseLayer = new XRWebGLLayer(this.session, this.gl);

		//Add Fox
		this.scene = new THREE.Scene();
		const light = new THREE.AmbientLight(0xffffff, 1);
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
		directionalLight.position.set(10, 15, 10);

		this.scene.add(light);
		this.scene.add(directionalLight);

		const MODEL_OBJ_URL = "./assets/ArcticFox_Posed.obj";
		const MODEL_MTL_URL = "./assets/ArcticFox_Posed.mtl";
		const MODEL_SCALE = 0.05;

		this.maxModels = 5;
		this.models = [];

		DemoUtils.loadModel(MODEL_OBJ_URL, MODEL_MTL_URL).then(model => {
			this.model = model;
			this.model.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE);
		});

		// We'll update the camera matrices directly from API, so
		// disable matrix auto updates so three.js doesn't attempt
		// to handle the matrices independently.
		this.camera = new THREE.PerspectiveCamera();
		this.camera.matrixAutoUpdate = false;

		this.frameOfRef = await this.session.requestFrameOfReference("eye-level");
		this.session.requestAnimationFrame(this.onXRFrame);
	}

	/**
	 * Called on the XRSession's requestAnimationFrame.
	 * Called with the time and XRPresentationFrame.
	 */
	onXRFrame(time, frame) {
		if (this.session) {
			let session = frame.session;
			let pose = frame.getDevicePose(this.frameOfRef);

			// check for surfaces
			if (!this.surfaces) {
				this.checkForSurfaces(frame);
			}

			// Queue up the next frame
			session.requestAnimationFrame(this.onXRFrame);

			// Bind the framebuffer to our baseLayer's framebuffer
			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.session.baseLayer.framebuffer);

			if (pose) {
				// Our XRFrame has an array of views. In the VR case, we'll have
				// two views, one for each eye. In mobile AR, however, we only
				// have one view.
				for (let view of frame.views) {
					const viewport = session.baseLayer.getViewport(view);
					this.renderer.setSize(viewport.width, viewport.height);

					// Set the view matrix and projection matrix from XRDevicePose
					// and XRView onto our THREE.Camera.
					this.camera.projectionMatrix.fromArray(view.projectionMatrix);
					const viewMatrix = new THREE.Matrix4().fromArray(pose.getViewMatrix(view));
					this.camera.matrix.getInverse(viewMatrix);
					this.camera.updateMatrixWorld(true);

					// Render our scene with our THREE.WebGLRenderer
					this.renderer.render(this.scene, this.camera);
				}
			}
		} else {
			document.body.classList.remove("surfaces");
			document.body.classList.remove("ar");
			document.body.removeChild(document.getElementsByTagName("canvas")[0]);
		}
	}

	onClick(event) {
		let rayOrigin = new THREE.Vector3();
		let rayDirection = new THREE.Vector3();

		let inputPose = event.frame.getInputPose(event.inputSource, this.frameOfRef);
		let devicePose = event.frame.getDevicePose(this.frameOfRef);

		if (!inputPose) {
			return;
		}

		if (inputPose.targetRay) {
			rayOrigin.set(inputPose.targetRay.origin.x, inputPose.targetRay.origin.y, inputPose.targetRay.origin.z);
			rayDirection.set(inputPose.targetRay.direction.x, inputPose.targetRay.direction.y, inputPose.targetRay.direction.z);

			event.frame.session
				.requestHitTest(new Float32Array(rayOrigin.toArray()), new Float32Array(rayDirection.toArray()), this.frameOfRef)
				.then(results => {
					if (results.length > 0) {
						this.addARObjectAt(results[0].hitMatrix, devicePose.poseModelMatrix);
					} else {
						let toast = document.getElementById("toast");
						toast.innerHTML = "No plane detected here";
						if (toast.classList.contains("show")) {
							toast.classList.remove("show");
							toast.classList.add("show");
						}
					}
				});
		}
	}

	checkForSurfaces(frame) {
		let rayOrigin = new THREE.Vector3();
		let rayDirection = new THREE.Vector3();

		const origin = new Float32Array(rayOrigin.toArray());
		const direction = new Float32Array(rayDirection.toArray());

		frame.session
			.requestHitTest(origin, direction, this.frameOfRef)
			.then(hits => {
				if (hits.length > 0) {
					console.log("got surface");
					this.surfaces = true;
					document.body.classList.add("surfaces");
					frame.session.addEventListener("select", this.onClick);
				}
			})
			.catch(err => {
				// still searching for surfaces
			});
	}

	addARObjectAt(matrix, lookAtMatrix) {
		let newModel = this.model.clone();
		newModel.visible = true;
		let hitMatrix = new THREE.Matrix4().fromArray(matrix);
		newModel.position.setFromMatrixPosition(hitMatrix);
		let poseMatrix = new THREE.Matrix4().fromArray(lookAtMatrix);
		let position = new THREE.Vector3();
		position.setFromMatrixPosition(poseMatrix);
		position.y = -1;
		newModel.lookAt(position);

		this.scene.add(newModel);
		this.models.push(newModel);

		if (this.models.length > this.maxModels) {
			let oldModel = this.models.shift();
			this.scene.remove(oldModel);
		}
	}

	endXRSession(session) {
		if (session) {
			session.end().then(this.onSessionEnd);
		}
	}

	onSessionEnd() {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
		this.session = null;
		window.requestAnimationFrame(this.onXRFrame);
	}
}

window.app = new App();
