/// <reference path="../../Core/Build/FudgeCore.d.ts" />
declare namespace FudgeAid {
    class ArithIntervalSolver<Interval, Epsilon> {
        left: Interval;
        right: Interval;
        leftValue: boolean;
        rightValue: boolean;
        private function;
        private divide;
        private isSmaller;
        constructor(_function: (_t: Interval) => boolean, _divide: (_left: Interval, _right: Interval) => Interval, _isSmaller: (_left: Interval, _right: Interval, _epsilon: Epsilon) => boolean);
        solve(_left: Interval, _right: Interval, _epsilon: Epsilon, _leftValue?: boolean, _rightValue?: boolean): void;
        toString(): string;
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
