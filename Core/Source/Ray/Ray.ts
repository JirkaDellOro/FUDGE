namespace FudgeCore {
    export class Ray {
        public origin: Vector3;
        public direction: Vector3;
        public length: number;

        constructor(_direction: Vector3 = Vector3.Z(-1), _origin: Vector3 = Vector3.ZERO(), _length: number = 1) {
            this.origin = _origin;
            this.direction = _direction;
            this.length = _length;
        }
    }
}