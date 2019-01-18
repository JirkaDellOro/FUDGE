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

// remaps opacity from 0 to 1
const opacityRemap = mat => {
	if (mat.opacity === 0) {
		mat.opacity = 1;
	}
};

window.DemoUtils = {
	/**
	 * Loads an OBJ model with an MTL material applied.
	 * Returns a THREE.Group object containing the mesh.
	 *
	 * @param {string} objURL
	 * @param {string} mtlURL
	 * @return {Promise<THREE.Group>}
	 */
	loadModel(objURL, mtlURL) {
		// OBJLoader and MTLLoader are not a part of three.js core, and
		// must be included as separate scripts.
		const objLoader = new THREE.OBJLoader();
		const mtlLoader = new THREE.MTLLoader();

		// Set texture path so that the loader knows where to find
		// linked resources
		mtlLoader.setTexturePath(mtlURL.substr(0, mtlURL.lastIndexOf("/") + 1));

		// remaps ka, kd, & ks values of 0,0,0 -> 1,1,1, models from
		// Poly benefit due to how they were encoded.
		mtlLoader.setMaterialOptions({ ignoreZeroRGBs: true });

		// OBJLoader and MTLLoader provide callback interfaces; let's
		// return a Promise and resolve or reject based off of the asset
		// downloading.
		return new Promise((resolve, reject) => {
			mtlLoader.load(
				mtlURL,
				materialCreator => {
					// We have our material package parsed from the .mtl file.
					// Be sure to preload it.
					materialCreator.preload();

					// Remap opacity values in the material to 1 if they're set as
					// 0; this is another peculiarity of Poly models and some
					// MTL materials.
					for (let material of Object.values(materialCreator.materials)) {
						opacityRemap(material);
					}

					// Give our OBJ loader our materials to apply it properly to the model
					objLoader.setMaterials(materialCreator);

					// Finally load our OBJ, and resolve the promise once found.
					objLoader.load(objURL, resolve, function() {}, reject);
				},
				function() {},
				reject
			);
		});
	}
};
