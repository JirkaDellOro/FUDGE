namespace Fudge {

    /**
     * Class handling all created fudgenodes, viewports and materials.
     */
    export abstract class AssetManager {

        private static Nodes: { [key: string]: Node } = {}; // Associative array for created fudgenodes.
        private static Viewports: { [key: string]: Viewport } = {}; // Associative array for created viewports.
        private static Materials: { [key: string]: Material } = {};

        /**
         * Identifies the passed asset's class and loads it into the fitting array
         * @param _asset 
         */
        public static addAsset(_asset: any): void {
            if (_asset instanceof Node) {
                if (this.Nodes[_asset.Name] === undefined) {
                    this.Nodes[_asset.Name] = _asset;
                }
                else {
                    throw new Error(`There is allready a fudgenode named '${_asset.Name}'.`)
                }
            }
            else if (_asset instanceof Material) {
                if (this.Materials[_asset.Name] === undefined) {
                    this.Materials[_asset.Name] = _asset;
                }
                else {
                    throw new Error(`There is allready a material named '${_asset.Name}'.`)
                }
            }
            else if (_asset instanceof Viewport) {
                if (this.Viewports[_asset.Name] === undefined) {
                    this.Viewports[_asset.Name] = _asset;
                }
                else {
                    throw new Error(`There is allready a viewport named '${_asset.Name}'.`)
                }
            }
        }

        /**
         * Looks up the fudgenode with the passed name in the array. Returns undefined if there is none
         * @param _name The name to look for.
         */
        public static getNode(_name: string): Node {
            return this.Nodes[_name];
        }
        /**
         * Returns an object containing all fudgenodes that are currently in the array.
         */
        public static getNodes(): Object {
            return this.Nodes;
        }

        /**
         * Removes the fudgenode with the passed name in the array. Throw's error if there is none.
         * @param _name The name to look for.
         */
        public static deleteFudgeNode(_name: string): void {
            if (this.Nodes[_name] === undefined) {
                throw new Error(`Cannot find fudgenode named '${_name}'.`);
            }
            else {
                delete this.Nodes[_name];
            }
        }


        /**
         * Looks up the viewport with the passed name in the array. Returns undefined if there is none
         * @param _name The name to look for.
         */
        public static getViewport(_name: string): Viewport {
            return this.Viewports[_name];
        }
        /**
         * Returns an object containing all viewports that are currently in the array.
         */
        public static getViewports(): Object {
            return this.Viewports;
        }
        /**
         * Removes the viewport with the passed name in the array. Throw's error if there is none.
         * @param _name The name to look for.
         */
        public static deleteViewport(_name: string): void {
            if (this.Viewports[_name] === undefined) {
                throw new Error(`Cannot find viewport named '${_name}'.`);
            }
            else {
                delete this.Viewports[_name];
            }
        }
        /**
         * Looks up the material with the passed name in the array. Returns undefined if there is none
         * @param _name The name to look for.
         */
        public static getMaterial(_name: string): Material {
            return this.Materials[_name];
        }
        /**
         * Returns an object containing all materials that are currently in the array.
         */
        public static getMaterials(): Object {
            return this.Materials;
        }
        /**
         * Removes the material with the passed name in the array. Throw's error if there is none.
         * @param _name The name to look for.
         */
        public static deleteMaterial(_name: string): void {
            if (this.Materials[_name] === undefined) {
                throw new Error(`Cannot find Material named '${_name}'.`);
            }
            else {
                delete this.Materials[_name];
            }
        }
    }
}