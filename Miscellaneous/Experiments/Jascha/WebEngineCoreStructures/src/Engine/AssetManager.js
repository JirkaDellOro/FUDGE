var WebEngine;
(function (WebEngine) {
    /**
     * Class handling all created fudgenodes, viewports and materials.
     */
    class AssetManager {
        /**
         * Identifies the passed asset's class and loads it into the fitting array
         * @param _asset
         */
        static addAsset(_asset) {
            if (_asset instanceof WebEngine.FudgeNode) {
                if (this.FudgeNodes[_asset.Name] === undefined) {
                    this.FudgeNodes[_asset.Name] = _asset;
                }
                else {
                    throw new Error(`There is allready a fudgenode named '${_asset.Name}'.`);
                }
            }
            else if (_asset instanceof WebEngine.Material) {
                if (this.Materials[_asset.Name] === undefined) {
                    this.Materials[_asset.Name] = _asset;
                }
                else {
                    throw new Error(`There is allready a material named '${_asset.Name}'.`);
                }
            }
            else if (_asset instanceof WebEngine.Viewport) {
                if (this.Viewports[_asset.Name] === undefined) {
                    this.Viewports[_asset.Name] = _asset;
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
        static getFudgeNode(_name) {
            return this.FudgeNodes[_name];
        }
        /**
         * Returns an object containing all fudgenodes that are currently in the array.
         */
        static getFudgeNodes() {
            return this.FudgeNodes;
        }
        /**
         * Removes the fudgenode with the passed name in the array. Throw's error if there is none.
         * @param _name The name to look for.
         */
        static deleteFudgeNode(_name) {
            if (this.FudgeNodes[_name] === undefined) {
                throw new Error(`Cannot find fudgenode named '${_name}'.`);
            }
            else {
                delete this.FudgeNodes[_name];
            }
        }
        /**
         * Looks up the viewport with the passed name in the array. Returns undefined if there is none
         * @param _name The name to look for.
         */
        static getViewport(_name) {
            return this.Viewports[_name];
        }
        /**
         * Returns an object containing all viewports that are currently in the array.
         */
        static getViewports() {
            return this.Viewports;
        }
        /**
         * Removes the viewport with the passed name in the array. Throw's error if there is none.
         * @param _name The name to look for.
         */
        static deleteViewport(_name) {
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
        static getMaterial(_name) {
            return this.Materials[_name];
        }
        /**
         * Returns an object containing all materials that are currently in the array.
         */
        static getMaterials() {
            return this.Materials;
        }
        /**
         * Removes the material with the passed name in the array. Throw's error if there is none.
         * @param _name The name to look for.
         */
        static deleteMaterial(_name) {
            if (this.Materials[_name] === undefined) {
                throw new Error(`Cannot find Material named '${_name}'.`);
            }
            else {
                delete this.Materials[_name];
            }
        }
    }
    AssetManager.FudgeNodes = {}; // Associative array for created fudgenodes.
    AssetManager.Viewports = {}; // Associative array for created viewports.
    AssetManager.Materials = {};
    WebEngine.AssetManager = AssetManager;
})(WebEngine || (WebEngine = {}));
//# sourceMappingURL=AssetManager.js.map