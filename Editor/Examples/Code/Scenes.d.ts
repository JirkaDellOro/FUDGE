/// <reference types="../../../core/build/fudgecore" />
declare namespace Scenes {
    import ƒ = FudgeCore;
    let node: ƒ.Node;
    let camera: ƒ.Node;
    let viewPort: ƒ.Viewport;
    function createAxisCross(): ƒ.Node;
    function createCoordinateSystem(): ƒ.Node;
    function createThreeLevelNodeHierarchy(): void;
    function createMiniScene(): void;
    function createViewport(_canvas?: HTMLCanvasElement): void;
    function createCamera(_translation?: ƒ.Vector3, _lookAt?: ƒ.Vector3): ƒ.Node;
    function createCompleteMeshNode(_name: string, _material: ƒ.Material, _mesh: ƒ.Mesh): ƒ.Node;
    function createCanvas(_width?: number, _height?: number): HTMLCanvasElement;
    function dollyViewportCamera(_viewport: ƒ.Viewport): void;
    function save(_filename: string, _json: ƒ.Serialization): void;
}
