import { XR } from "./class.xr";
import DemoUtils from "./class.utils";

const ENTER_AR_BTN: HTMLElement = document.querySelector("#enter-ar");
const CANVAS_XR: HTMLCanvasElement = document.querySelector("#xr-canvas");

let xr = new XR(CANVAS_XR);
xr.enableHitTest(true);

xr.init()
	.then(() => {
		ENTER_AR_BTN.addEventListener("click", xr.startSession);
	})
	.catch(msg => {
		console.log(msg);
	});

//set model for xr
const MODEL_OBJ_URL: string = "../assets/ArcticFox_Posed.obj";
const MODEL_MTL_URL: string = "../assets/ArcticFox_Posed.mtl";
const MODEL_SCALE: number = 0.03;

let fox: THREE.Group;

const DU = new DemoUtils();
DU.loadModel(MODEL_OBJ_URL, MODEL_MTL_URL).then((model: THREE.Group) => {
	fox = model;
	fox.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE);
});

//get hits on canvas
CANVAS_XR.addEventListener("hits", (event: CustomEvent) => {
	let hits = event.detail.hits;
	let devicePose = event.detail.devicePose;
	for (let i = 0; i < hits.length; i++) {
		xr.addARObjectAt(hits[i].hitMatrix, devicePose.poseModelMatrix, fox);
	}
});

//Create cancel button
const CANCEL_BTN = document.querySelector("#cancel-ar");
CANCEL_BTN.addEventListener("click", event => {
	xr.endXRSession();
});
