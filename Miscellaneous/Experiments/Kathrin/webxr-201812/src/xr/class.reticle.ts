import { Object3D, Raycaster, PerspectiveCamera, Matrix4, LineBasicMaterial, Vector3, Geometry, Line } from "THREE";

export class Reticle {
	private _model: Object3D;
	private _visible: boolean = false;
	private _distance: number;
	private _showDistance: boolean = true;

	private _distanceContainer: HTMLElement;

	private _origin: Vector3;
	private _direction: Vector3;

	private _raycaster: Raycaster;

	constructor(distanceContainer: HTMLElement, object?: Object3D) {
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
	get origin(): Vector3 {
		return this._origin;
	}

	/**
	 * The reticles direction
	 * @returns {Vector3}
	 */
	get direction(): Vector3 {
		return this._direction;
	}

	/**
	 * Distance between user (camera) and reticle
	 * @returns {number}
	 */
	get distance(): number {
		return this._distance;
	}

	/**
	 * Enable/disable showing the reticle distance
	 */
	set enableReticleDistance(enable: boolean) {
		this._showDistance = enable;
	}

	/**
	 * The object that has to be shown as reticle.
	 * @returns {Object3D}
	 */
	get objectToShow(): Object3D {
		return this._model;
	}

	/**
	 * Set an other object as reticle.
	 * @param {Object3D} object
	 */
	set objectToShow(object: Object3D) {
		this._model = object;
	}

	/**
	 * @returns {boolean} visibility of the reticle object
	 */
	get visible(): boolean {
		return this._visible;
	}

	/**
	 * Set the position of the reticle. Has to be called each frame.
	 *
	 * @param camera
	 * @param session
	 * @param frameOfRef
	 */
	async update(camera: PerspectiveCamera, session: XRSession, frameOfRef: XRFrameOfReference): Promise<void> {
		this._raycaster = this._raycaster ? this._raycaster : new Raycaster();
		this._raycaster.setFromCamera({ x: 0, y: 0 }, camera);
		const ray = this._raycaster.ray;

		this._origin = ray.origin;
		this._direction = ray.direction;

		session
			.requestHitTest(new Float32Array(this._origin.toArray()), new Float32Array(this._direction.toArray()), frameOfRef)
			.then((hits: Array<XRHitResult>) => {
				if (hits.length > 0) {
					let hitMatrix = new Matrix4().fromArray(Array.from(hits[0].hitMatrix));
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
	}

	/**
	 * Create the default object. Is set to the three axes x, y and z
	 *
	 * @param {number} size Default object size 0.1
	 * @returns {Object3D} The default object
	 */
	createDefaultObject(size: number = 0.1): Object3D {
		let lines = new Object3D();

		let xMaterial = new LineBasicMaterial({
			color: 0xff0000,
			linewidth: 3
		});

		let yMaterial = new LineBasicMaterial({
			color: 0x00ff00,
			linewidth: 3
		});

		let zMaterial = new LineBasicMaterial({
			color: 0x0000ff,
			linewidth: 3
		});

		let xGeometry = new Geometry();
		xGeometry.vertices.push(new Vector3(0, 0, 0), new Vector3(size, 0, 0));

		let yGeometry = new Geometry();
		yGeometry.vertices.push(new Vector3(0, 0, 0), new Vector3(0, size, 0));

		let zGeometry = new Geometry();
		zGeometry.vertices.push(new Vector3(0, 0, 0), new Vector3(0, 0, size));

		let xLine = new Line(xGeometry, xMaterial);
		let yLine = new Line(yGeometry, yMaterial);
		let zLine = new Line(zGeometry, zMaterial);

		lines.add(xLine);
		lines.add(yLine);
		lines.add(zLine);

		return lines;
	}
}
