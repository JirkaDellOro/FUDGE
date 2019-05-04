class Shape {
	static shapesRegister: Shape[] = [];
	name: string;
	iRegister: number;
	createPath: (_x: number, _y: number) => Path2D;
	
	constructor(_name: string, _createPath:(_x: number, _y: number) => Path2D){
		this.name = _name;
		this.createPath = _createPath;
		this.iRegister = Shape.shapesRegister.push(this);
	}

}


function createRectShape(_x: number, _y: number): Path2D{
	return new Path2D();
}
function createCircleShape(_x: number, _y: number): Path2D{
	return new Path2D();
}

let rect: Shape = new Shape("Rectangle", createRectShape);
let circle: Shape = new Shape("Circle", createCircleShape);

///////////////////////////////////

class SubShape extends Shape {
	constructor(_name: string, _createPath:(_x: number, _y: number) => Path2D){
		super(_name, _createPath);
	}
}

let subShape: SubShape = new SubShape("SubShape",createCircleShape);

/////////////////////////////////
//↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

for(let s of Shape.shapesRegister){
	console.log(s.iRegister, s.name);
}
