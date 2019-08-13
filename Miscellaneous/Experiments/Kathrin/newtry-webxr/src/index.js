"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_xr_1 = require("./class.xr");
const class_utils_1 = require("./class.utils");
const ENTER_AR_BTN = document.querySelector("#enter-ar");
const CANVAS_XR = document.querySelector("#xr-canvas");
let xr = new class_xr_1.XR(CANVAS_XR);
xr.enableHitTest(true);
xr.init()
    .then(() => {
    ENTER_AR_BTN.addEventListener("click", xr.startSession);
})
    .catch(msg => {
    console.log(msg);
});
//set model for xr
const MODEL_OBJ_URL = "../assets/ArcticFox_Posed.obj";
const MODEL_MTL_URL = "../assets/ArcticFox_Posed.mtl";
const MODEL_SCALE = 0.03;
let fox;
const DU = new class_utils_1.default();
DU.loadModel(MODEL_OBJ_URL, MODEL_MTL_URL).then((model) => {
    fox = model;
    fox.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE);
});
//get hits on canvas
CANVAS_XR.addEventListener("hits", (event) => {
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
//# sourceMappingURL=index.js.map