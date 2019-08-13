var Shapes;
(function (Shapes) {
    class Transform extends Shapes.Component {
        constructor() {
            super();
            this.x = 0;
            this.y = 0;
            this.sx = 1;
            this.sy = 1;
            this.r = 0;
            this.singleton = true;
        }
        apply(_c) {
            _c.translate(this.x, this.y);
            _c.scale(this.sx, this.sy);
            _c.rotate(this.r);
        }
    }
    Shapes.Transform = Transform;
})(Shapes || (Shapes = {}));
//# sourceMappingURL=Transform.js.map