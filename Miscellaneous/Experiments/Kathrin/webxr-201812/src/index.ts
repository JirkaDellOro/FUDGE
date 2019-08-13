import { XR, VirtualWorldCallback } from "./xr/class.xr";
import { DemoUtils, ReturnMessage } from "./utils/class.utils";
import { Scene, WebGLRenderer, PerspectiveCamera, AmbientLight, DirectionalLight, Group } from "three";

const ENTER_AR_BTN: HTMLElement = document.querySelector("#enter-ar");
const CANVAS_XR: HTMLCanvasElement = document.querySelector("#xr-canvas");

const camera: PerspectiveCamera = new PerspectiveCamera();
const scene: Scene = new Scene();

//create renderer and set attributes
const renderer: WebGLRenderer = new WebGLRenderer({
	alpha: true,
	preserveDrawingBuffer: true
});
renderer.autoClear = false;

//create virtual world to show in real world (callback for session)
let createVirtualWorld: VirtualWorldCallback = () => {
	const LIGHT = new AmbientLight(0xffffff, 1);

	const DIRECTIONAL_LIGHT = new DirectionalLight(0xffffff, 0.3);
	DIRECTIONAL_LIGHT.position.set(10, 15, 10);

	scene.add(LIGHT);
	scene.add(DIRECTIONAL_LIGHT);

	camera.matrixAutoUpdate = false;

	return scene;
};

// Initiate XR Session
let xr: XR = new XR(CANVAS_XR, renderer, camera);
xr.enableReticle = true;
xr.enableHitTest = true;

xr.init()
	.then(() => {
		ENTER_AR_BTN.addEventListener("click", () => {
			xr.startSession(createVirtualWorld).then((message: ReturnMessage) => {
				console.log(message);
			});
		});
	})
	.catch(msg => {
		console.log(msg);
	});

//load and set model for xr
const MODEL_OBJ_URL: string = "./assets/ArcticFox_Posed.obj";
const MODEL_MTL_URL: string = "./assets/ArcticFox_Posed.mtl";
const MODEL_SCALE: number = 0.03;

let fox: Group;

const DU: DemoUtils = new DemoUtils();
DU.loadModel(MODEL_OBJ_URL, MODEL_MTL_URL).then((model: Group) => {
	fox = model;
	fox.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE);
});

//get hits on canvas
CANVAS_XR.addEventListener("hits", (event: CustomEvent) => {
	let hits: Array<XRHitResult> = event.detail.hits;
	let devicePose: XRDevicePose = event.detail.devicePose;
	for (let i = 0; i < hits.length; i++) {
		xr.addARObjectAt(Array.from(hits[i].hitMatrix), Array.from(devicePose.poseModelMatrix), fox);
	}
});

//EventListener for cancel button
const CANCEL_BTN: HTMLElement = document.querySelector("#cancel-ar");
CANCEL_BTN.addEventListener("click", event => {
	xr.endXRSession();
});
