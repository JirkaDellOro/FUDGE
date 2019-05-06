class Shape {
    constructor(_name, _createPath) {
        this.name = _name;
        this.createPath = _createPath;
        this.iRegister = Shape.shapesRegister.push(this);
    }
}
Shape.shapesRegister = [];
function createRectShape(_x, _y) {
    return new Path2D();
}
function createCircleShape(_x, _y) {
    return new Path2D();
}
let rect = new Shape("Rectangle", createRectShape);
let circle = new Shape("Circle", createCircleShape);
///////////////////////////////////
class SubShape extends Shape {
    constructor(_name, _createPath) {
        super(_name, _createPath);
    }
}
let subShape = new SubShape("SubShape", createCircleShape);
/////////////////////////////////
//↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
for (let s of Shape.shapesRegister) {
    console.log(s.iRegister, s.name);
}
//# sourceMappingURL=staticclass.js.map