class Shape {
	static shapesRegister: Shape[] = [];
	name: string;
	createPath: (_x: number, _y: number) => Path2D;
	
	constructor(_name: string, _createPath:(_x: number, _y: number) => Path2D){
		this.name = _name;
		this.createPath = _createPath;
		Shape.shapesRegister.push(this);
	}

}

let Rect: Shape = new Shape("Rectangle", createRectShape);
let Circle: Shape = new Shape("Circle", createCircleShape);

function createRectShape(_x: number, _y: number): Path2D{
	return new Path2D();
}
function createCircleShape(_x: number, _y: number): Path2D{
	return new Path2D();
}

for(let s of Shape.shapesRegister){
	console.log(s.name);
}