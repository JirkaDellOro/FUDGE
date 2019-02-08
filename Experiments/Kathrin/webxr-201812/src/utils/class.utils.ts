// import * as THREE from "three";
import { MTLLoader, OBJLoader } from "mtl-obj-loader";

export class DemoUtils {
	constructor() {}
	/**
	 * Loads an OBJ model with an MTL material applied.
	 * Returns a THREE.Group object containing the mesh.
	 *
	 * @param {string} objURL
	 * @param {string} mtlURL
	 * @return {Promise<THREE.Group>}
	 */
	loadModel(objURL: string, mtlURL: string): Promise<THREE.Group> {
		let objLoader: OBJLoader = new OBJLoader();
		let mtlLoader: MTLLoader = new MTLLoader();

		mtlLoader.setResourcePath(mtlURL.substr(0, mtlURL.lastIndexOf("/") + 1));

		mtlLoader.setMaterialOptions({ ignoreZeroRGBs: true });

		return new Promise((resolve, reject) => {
			mtlLoader.load(
				mtlURL,
				materials => {
					materials.preload();

					objLoader.setMaterials(materials);

					objLoader.load(objURL, resolve, () => {}, reject);
				},
				xhr => {
					if (xhr.lengthComputable) {
						let percentComplete = (xhr.loaded / xhr.total) * 100;
						console.log(Math.round(percentComplete) + "% loaded");
					}
				},
				reject
			);
		});
	}
}

export class ReturnMessage {
	private result: boolean;
	private message: string;

	constructor(result: boolean, message?: string) {
		this.result = result;
		this.message = message ? message : "";
	}

	/**
	 * Get the result
	 * @returns {boolean}
	 */
	getResult(): boolean {
		return this.result;
	}

	/**
	 * Get the message
	 * @returns {string}
	 */
	getMessage(): string {
		return this.message;
	}
}
