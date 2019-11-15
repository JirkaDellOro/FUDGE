namespace FudgeCore {
    export class RayHit {
        public node: Node;
        public face: number;
        public zBuffer: number;

        constructor(_node: Node = null, _face: number = 0, _zBuffer: number = 0) {
            this.node = _node;
            this.face = _face;
            this.zBuffer = _zBuffer;
        }
    }
}