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
class Reticle {
    constructor(distanceContainer, object) {
        this._visible = false;
        this._showDistance = true;
        let distanceSpan = document.createElement("span");
        distanceSpan.setAttribute("id", "distance-content");
        distanceSpan.setAttribute("class", "distance hide");
        this._distanceContainer = distanceContainer.appendChild(distanceSpan);
        this._model = object ? object : this.createDefaultObject();
    }
    /**
     * The reticles origin
     * @returns {Vector3}
     */
    get origin() {
        return this._origin;
    }
    /**
     * The reticles direction
     * @returns {Vector3}
     */
    get direction() {
        return this._direction;
    }
    /**
     * Distance between user (camera) and reticle
     * @returns {number}
     */
    get distance() {
        return this._distance;
    }
    /**
     * Enable/disable showing the reticle distance
     */
    set enableReticleDistance(enable) {
        this._showDistance = enable;
    }
    /**
     * The object that has to be shown as reticle.
     * @returns {Object3D}
     */
    get objectToShow() {
        return this._model;
    }
    /**
     * Set an other object as reticle.
     * @param {Object3D} object
     */
    set objectToShow(object) {
        this._model = object;
    }
    /**
     * @returns {boolean} visibility of the reticle object
     */
    get visible() {
        return this._visible;
    }
    /**
     * Set the position of the reticle. Has to be called each frame.
     *
     * @param camera
     * @param session
     * @param frameOfRef
     */
    update(camera, session, frameOfRef) {
        return __awaiter(this, void 0, void 0, function* () {
            this._raycaster = this._raycaster ? this._raycaster : new THREE_1.Raycaster();
            this._raycaster.setFromCamera({ x: 0, y: 0 }, camera);
            const ray = this._raycaster.ray;
            this._origin = ray.origin;
            this._direction = ray.direction;
            session
                .requestHitTest(new Float32Array(this._origin.toArray()), new Float32Array(this._direction.toArray()), frameOfRef)
                .then((hits) => {
                if (hits.length > 0) {
                    let hitMatrix = new THREE_1.Matrix4().fromArray(Array.from(hits[0].hitMatrix));
                    this._model.position.setFromMatrixPosition(hitMatrix);
                    this._distance = camera.position.distanceTo(this._model.position);
                    if (this._showDistance) {
                        this._distanceContainer.innerHTML = this._distance.toFixed(2).toString() + " units";
                        this._distanceContainer.classList.remove("hide");
                    }
                    this._visible = true;
                }
            })
                .catch(error => {
                //no hit found yet
            });
        });
    }
    /**
     * Create the default object. Is set to the three axes x, y and z
     *
     * @param {number} size Default object size 0.1
     * @returns {Object3D} The default object
     */
    createDefaultObject(size = 0.1) {
        let lines = new THREE_1.Object3D();
        let xMaterial = new THREE_1.LineBasicMaterial({
            color: 0xff0000,
            linewidth: 3
        });
        let yMaterial = new THREE_1.LineBasicMaterial({
            color: 0x00ff00,
            linewidth: 3
        });
        let zMaterial = new THREE_1.LineBasicMaterial({
            color: 0x0000ff,
            linewidth: 3
        });
        let xGeometry = new THREE_1.Geometry();
        xGeometry.vertices.push(new THREE_1.Vector3(0, 0, 0), new THREE_1.Vector3(size, 0, 0));
        let yGeometry = new THREE_1.Geometry();
        yGeometry.vertices.push(new THREE_1.Vector3(0, 0, 0), new THREE_1.Vector3(0, size, 0));
        let zGeometry = new THREE_1.Geometry();
        zGeometry.vertices.push(new THREE_1.Vector3(0, 0, 0), new THREE_1.Vector3(0, 0, size));
        let xLine = new THREE_1.Line(xGeometry, xMaterial);
        let yLine = new THREE_1.Line(yGeometry, yMaterial);
        let zLine = new THREE_1.Line(zGeometry, zMaterial);
        lines.add(xLine);
        lines.add(yLine);
        lines.add(zLine);
        return lines;
    }
}
exports.Reticle = Reticle;
//# sourceMappingURL=class.reticle.js.map