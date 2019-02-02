"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import * as THREE from "three";
const mtl_obj_loader_1 = require("mtl-obj-loader");
class DemoUtils {
    constructor() { }
    /**
     * Loads an OBJ model with an MTL material applied.
     * Returns a THREE.Group object containing the mesh.
     *
     * @param {string} objURL
     * @param {string} mtlURL
     * @return {Promise<THREE.Group>}
     */
    loadModel(objURL, mtlURL) {
        let objLoader = new mtl_obj_loader_1.OBJLoader();
        let mtlLoader = new mtl_obj_loader_1.MTLLoader();
        mtlLoader.setResourcePath(mtlURL.substr(0, mtlURL.lastIndexOf("/") + 1));
        mtlLoader.setMaterialOptions({ ignoreZeroRGBs: true });
        return new Promise((resolve, reject) => {
            mtlLoader.load(mtlURL, materials => {
                materials.preload();
                objLoader.setMaterials(materials);
                objLoader.load(objURL, resolve, () => { }, reject);
            }, xhr => {
                if (xhr.lengthComputable) {
                    let percentComplete = (xhr.loaded / xhr.total) * 100;
                    console.log(Math.round(percentComplete) + "% loaded");
                }
            }, reject);
        });
    }
}
exports.default = DemoUtils;
//# sourceMappingURL=class.utils.js.map