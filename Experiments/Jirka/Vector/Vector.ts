module Vector {
    export class Vector2D {
        public x: number;
        public y: number;

        constructor(_x: number, _y: number) {
            this.setXY(_x, _y);
        }

        setXY(_x: number, _y: number): void {
            this.x = _x;
            this.y = _y;
        }

        setVector(_v: Vector2D): void {
            this.setXY(_v.x, _v.y);
        }

        getDistanceTo(_v: Vector2D): number {
            var dx: number = this.x - _v.x;
            var dy: number = this.y - _v.y;
            return Math.sqrt(dx * dx + dy * dy);
        }

        getLength(): number {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }

        getDiff(_subtract: Vector2D): Vector2D {
            return new Vector2D(this.x - _subtract.x, this.y - _subtract.y);
        }

        getSum(_add: Vector2D): Vector2D {
            return new Vector2D(this.x + _add.x, this.y + _add.y);
        }

        subtract(_subtract: Vector2D): void {
            this.x -= _subtract.x;
            this.y -= _subtract.y;
        }

        add(_add: Vector2D): void {
            this.x += _add.x;
            this.y += _add.y;
        }

        scale(_s: number): void {
            this.x *= _s;
            this.y *= _s;
        }

        normalize(): void {
            var l: number = this.getLength();
            if (l > 0)
                this.scale(1 / l);
        }
    }
}