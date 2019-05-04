class Shape {
    constructor(_name, _createPath) {
        this.name = _name;
        this.createPath = _createPath;
        Shape.shapesRegister.push(this);
    }
}
Shape.shapesRegister = [];
let Rect = new Shape("Rectangle", createRectShape);
let Circle = new Shape("Circle", createCircleShape);
function createRectShape(_x, _y) {
    return new Path2D();
}
function createCircleShape(_x, _y) {
    return new Path2D();
}
for (let s of Shape.shapesRegister) {
    console.log(s.name);
}
//# sourceMappingURL=staticclass.js.map