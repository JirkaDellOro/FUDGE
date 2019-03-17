namespace Fudge {

    /**
     * Class handling all created fudgenodes, viewports and materials.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export abstract class AssetManager {

        private static nodes: { [key: string]: Node } = {}; // Associative array for created fudgenodes.
        private static viewports: { [key: string]: Viewport } = {}; // Associative array for created viewports.
        private static materials: { [key: string]: Material } = {};


        /**
         * Identifies the passed asset's class and loads it into the fitting array
         * @param _asset 
         */
        public static addAsset(_asset: Object): void {
            if (_asset instanceof Node) {
                if (this.nodes[_asset.Name] === undefined) {
                    this.nodes[_asset.Name] = _asset;
                }
                else {
                    throw new Error(`There is allready a fudgenode named '${_asset.Name}'.`);
                }
            }
            else if (_asset instanceof Material) {
                if (this.materials[_asset.Name] === undefined) {
                    this.materials[_asset.Name] = _asset;
                }
                else {
                    throw new Error(`There is allready a material named '${_asset.Name}'.`);
                }
            }
            else if (_asset instanceof Viewport) {
                if (this.viewports[_asset.Name] === undefined) {
                    this.viewports[_asset.Name] = _asset;
                }
                else {
                    throw new Error(`There is allready a viewport named '${_asset.Name}'.`);
                }
            }
        }

        /**
         * Looks up the fudgenode with the passed name in the array. Returns undefined if there is none
         * @param _name The name to look for.
         */
        public static getNode(_name: string): Node {
            return this.nodes[_name];
        }
        /**
         * Returns an object containing all fudgenodes that are currently in the array.
         */
        public static getNodes(): Object {
            return this.nodes;
        }

        /**
         * Removes the fudgenode with the passed name in the array. Throw's error if there is none.
         * @param _name The name to look for.
         */
        public static deleteFudgeNode(_name: string): void {
            if (this.nodes[_name] === undefined) {
                throw new Error(`Cannot find fudgenode named '${_name}'.`);
            }
            else {
                delete this.nodes[_name];
            }
        }


        /**
         * Looks up the viewport with the passed name in the array. Returns undefined if there is none
         * @param _name The name to look for.
         */
        public static getViewport(_name: string): Viewport {
            return this.viewports[_name];
        }
        /**
         * Returns an object containing all viewports that are currently in the array.
         */
        public static getViewports(): Object {
            return this.viewports;
        }
        /**
         * Removes the viewport with the passed name in the array. Throw's error if there is none.
         * @param _name The name to look for.
         */
        public static deleteViewport(_name: string): void {
            if (this.viewports[_name] === undefined) {
                throw new Error(`Cannot find viewport named '${_name}'.`);
            }
            else {
                delete this.viewports[_name];
            }
        }
        /**
         * Looks up the material with the passed name in the array. Returns undefined if there is none
         * @param _name The name to look for.
         */
        public static getMaterial(_name: string): Material {
            return this.materials[_name];
        }
        /**
         * Returns an object containing all materials that are currently in the array.
         */
        public static getMaterials(): Object {
            return this.materials;
        }
        /**
         * Removes the material with the passed name in the array. Throw's error if there is none.
         * @param _name The name to look for.
         */
        public static deleteMaterial(_name: string): void {
            if (this.materials[_name] === undefined) {
                throw new Error(`Cannot find Material named '${_name}'.`);
            }
            else {
                delete this.materials[_name];
            }
        }
    }
}