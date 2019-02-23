var WebEngine;
(function (WebEngine) {
    /**
     * Class handling the fudgenodes and viewports that are created for an application
     */
    class AssetManager {
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
        static getFudgeNode(_name) {
            return this.FudgeNodes[_name];
        }
        static deleteFudgeNode(_name) {
            if (this.FudgeNodes[_name] === undefined) {
                throw new Error(`Cannot find fudgenode named '${_name}'.`);
            }
            else {
                delete this.FudgeNodes[_name];
            }
        }
        static getViewport(_name) {
            return this.Viewports[_name];
        }
        static deleteViewport(_name) {
            if (this.Viewports[_name] === undefined) {
                throw new Error(`Cannot find viewport named '${_name}'.`);
            }
            else {
                delete this.Viewports[_name];
            }
        }
        static getMaterial(_name) {
            return this.Materials[_name];
        }
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