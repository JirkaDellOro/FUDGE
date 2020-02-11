/// <reference path="../../Core/Build/FudgeCore.d.ts" />
declare namespace FudgeAid {
    import ƒ = FudgeCore;
    class CameraOrbit extends ƒ.Node {
        private maxRotX;
        private minDistance;
        private maxDistance;
        private rotatorX;
        private translator;
        constructor(_cmpCamera: ƒ.ComponentCamera, _distanceStart?: number, _maxRotX?: number, _minDistance?: number, _maxDistance?: number);
        readonly component: ƒ.ComponentCamera;
        readonly node: ƒ.Node;
        distance: number;
        rotationY: number;
        rotationX: number;
        rotateY(_delta: number): void;
        rotateX(_delta: number): void;
    }
}
declare namespace FudgeAid {
    import ƒ = FudgeCore;
    class Node extends ƒ.Node {
        private static count;
        constructor(_name?: string, _transform?: ƒ.Matrix4x4, _material?: ƒ.Material, _mesh?: ƒ.Mesh);
        private static getNextName;
        readonly local: ƒ.Matrix4x4;
        readonly pivot: ƒ.Matrix4x4;
    }
}
declare namespace FudgeAid {
    import ƒ = FudgeCore;
    class NodeArrow extends Node {
        constructor(_name: string, _color: ƒ.Color);
    }
}
declare namespace FudgeAid {
    import ƒ = FudgeCore;
    class NodeCoordinateSystem extends Node {
        constructor(_name?: string, _transform?: ƒ.Matrix4x4);
    }
}
declare namespace FudgeAid {
    /** Three Point Light setup that by default illuminates the Scene from +Z */
    class NodeThreePointLights extends Node {
        constructor(_name: string, _rotationY: number);
    }
}
