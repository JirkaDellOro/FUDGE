"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_xr_1 = require("./xr/class.xr");
const class_utils_1 = require("./utils/class.utils");
const three_1 = require("three");
const ENTER_AR_BTN = document.querySelector("#enter-ar");
const CANVAS_XR = document.querySelector("#xr-canvas");
const camera = new three_1.PerspectiveCamera();
const scene = new three_1.Scene();
//create renderer and set attributes
const renderer = new three_1.WebGLRenderer({
    alpha: true,
    preserveDrawingBuffer: true
});
renderer.autoClear = false;
//create virtual world to show in real world (callback for session)
let createVirtualWorld = () => {
    const LIGHT = new three_1.AmbientLight(0xffffff, 1);
    const DIRECTIONAL_LIGHT = new three_1.DirectionalLight(0xffffff, 0.3);
    DIRECTIONAL_LIGHT.position.set(10, 15, 10);
    scene.add(LIGHT);
    scene.add(DIRECTIONAL_LIGHT);
    camera.matrixAutoUpdate = false;
    return scene;
};
// Initiate XR Session
let xr = new class_xr_1.XR(CANVAS_XR, renderer, camera);
xr.enableReticle = true;
xr.enableHitTest = true;
xr.init()
    .then(() => {
    ENTER_AR_BTN.addEventListener("click", () => {
        xr.startSession(createVirtualWorld).then((message) => {
            console.log(message);
        });
    });
})
    .catch(msg => {
    console.log(msg);
});
//load and set model for xr
const MODEL_OBJ_URL = "./assets/ArcticFox_Posed.obj";
const MODEL_MTL_URL = "./assets/ArcticFox_Posed.mtl";
const MODEL_SCALE = 0.03;
let fox;
const DU = new class_utils_1.DemoUtils();
DU.loadModel(MODEL_OBJ_URL, MODEL_MTL_URL).then((model) => {
    fox = model;
    fox.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE);
});
//get hits on canvas
CANVAS_XR.addEventListener("hits", (event) => {
    let hits = event.detail.hits;
    let devicePose = event.detail.devicePose;
    for (let i = 0; i < hits.length; i++) {
        xr.addARObjectAt(Array.from(hits[i].hitMatrix), Array.from(devicePose.poseModelMatrix), fox);
    }
});
//EventListener for cancel button
const CANCEL_BTN = document.querySelector("#cancel-ar");
CANCEL_BTN.addEventListener("click", event => {
    xr.endXRSession();
});
//# sourceMappingURL=index.js.map