/// <reference path="../../Core/Build/FudgeCore.d.ts" />
declare namespace FudgeAid {
    class ArithIntervalSolver<T> {
        left: T;
        right: T;
        leftValue: boolean;
        rightValue: boolean;
        private function;
        private divide;
        private isSmaller;
        constructor(_function: (_t: T) => boolean, _divide: (_left: T, _right: T) => T, _isSmaller: (_left: T, _right: T, _epsilon: T) => boolean);
        solve(_left: T, _right: T, _epsilon: T, _leftValue?: boolean, _rightValue?: boolean): void;
    }
}
declare namespace FudgeAid {
    import ƒ = FudgeCore;
    class CameraOrbit extends ƒ.Node {
        private maxRotX;
        private minDistance;
        private maxDistance;
        private rotatorX;
        private translator;
        constructor(_cmpCamera: ƒ.ComponentCamera, _distanceStart?: number, _maxRotX?: number, _minDistance?: number, _maxDistance?: number);
        get component(): ƒ.ComponentCamera;
        get node(): ƒ.Node;
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
    class Node extends ƒ.Node {
        private static count;
        constructor(_name?: string, _transform?: ƒ.Matrix4x4, _material?: ƒ.Material, _mesh?: ƒ.Mesh);
        private static getNextName;
        get local(): ƒ.Matrix4x4;
        get pivot(): ƒ.Matrix4x4;
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
