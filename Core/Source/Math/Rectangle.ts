namespace FudgeCore {
    export class Rectangle extends Mutable {
        public position: Vector2 = Recycler.get(Vector2);
        public size: Vector2 = Recycler.get(Vector2);

        constructor(_x: number = 0, _y: number = 0, _width: number = 1, _height: number = 1) {
            super();
            this.setPositionAndSize(_x, _y, _width, _height);
        }

        public static get(_x: number = 0, _y: number = 0, _width: number = 1, _height: number = 1): Rectangle {
            let rect: Rectangle = Recycler.get(Rectangle);
            rect.setPositionAndSize(_x, _y, _width, _height);
            return rect;
        }

        public setPositionAndSize(_x: number = 0, _y: number = 0, _width: number = 1, _height: number = 1): void {
            this.position.set(_x, _y);
            this.size.set(_width, _height);
        }

        get x(): number {
            return this.position.x;
        }
        get y(): number {
            return this.position.y;
        }
        get width(): number {
            return this.size.x;
        }
        get height(): number {
            return this.size.y;
        }

        set x(_x: number) {
            this.position.x = _x;
        }
        set y(_y: number) {
            this.position.y = _y;
        }
        set width(_width: number) {
            this.position.x = _width;
        }
        set height(_height: number) {
            this.position.y = _height;
        }

        protected reduceMutator(_mutator: Mutator): void {/* */}
        }
    }