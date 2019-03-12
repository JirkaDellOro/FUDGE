namespace Shapes {
    export class Transform extends Component {
        x: number = 0;
        y: number = 0;
        sx: number = 1;
        sy: number = 1;
        r: number = 0;

        constructor() {
            super();
            this.singleton = true;
        }

        apply(_c: CanvasRenderingContext2D): void {
            _c.translate(this.x, this.y);
            _c.scale(this.sx, this.sy);
            _c.rotate(this.r);
        }
    }
}