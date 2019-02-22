namespace WebEngine {

    /**
     * Class handling the fudgenodes and viewports that are created for an application
     */
    export class AssetManager {

        private static FudgeNodes: { [key: string]: FudgeNode } = {}; // Associative array for created fudgenodes.
        private static Viewports: { [key: string]: Viewport } = {}; // Associative array for created viewports.
        private static Materials: { [key: string]: Material } = {};

        public static getFudgeNode(_name: string): FudgeNode {
            return this.FudgeNodes[_name];

        }

        public static addAsset(_asset: any): void {
            if (_asset instanceof FudgeNode) {
                if (this.FudgeNodes[_asset.Name] === undefined) {
                    this.FudgeNodes[_asset.Name] = _asset;
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

        public static deleteFudgeNode(_name: string): void {
            if (this.FudgeNodes[_name] === undefined) {
                throw new Error(`Cannot find fudgenode named '${_name}'.`);
            }
            else {
                delete this.FudgeNodes[_name];
            }
        }

        public static getViewport(_name: string): Viewport {
            return this.Viewports[_name];
        }

       
        public static deleteViewport(_name: string): void {
            if (this.Viewports[_name] === undefined) {
                throw new Error(`Cannot find viewport named '${_name}'.`);
            }
            else {
                delete this.Viewports[_name];
            }
        }
        public static getMaterial(_name: string): Material {
            return this.Materials[_name];

        }     
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