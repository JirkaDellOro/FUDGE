/// <reference path="../../Core/Build/FudgeCore.d.ts" />
declare namespace FudgeAid {
    import ƒ = FudgeCore;
    class CameraOrbit extends ƒ.Node {
        private maxRotX;
        private minDistance;
        private maxDistance;
        constructor(_cmpCamera: ƒ.ComponentCamera, _distanceStart?: number, _maxRotX?: number, _minDistance?: number, _maxDistance?: number);
        get cmpCamera(): ƒ.ComponentCamera;
        get rotatorX(): ƒ.Node;
        set distance(_distance: number);
        get distance(): number;
        set rotationY(_angle: number);
        get rotationY(): number;
        set rotationX(_angle: number);
        get rotationX(): number;
        rotateY(_delta: number): void;
        rotateX(_delta: number): void;
    }
}
declare namespace FudgeAid {
    import ƒ = FudgeCore;
    class NodeArrow extends ƒ.Node {
        constructor(_name: string, _color: ƒ.Color);
    }
}
declare namespace FudgeAid {
    import ƒ = FudgeCore;
    class NodeCoordinateSystem extends ƒ.Node {
        constructor();
    }
}
declare namespace FudgeAid {
    import ƒ = FudgeCore;
    class NodeGeometry extends ƒ.Node {
        constructor(_name: string, _material: ƒ.Material, _mesh: ƒ.Mesh);
    }
}
