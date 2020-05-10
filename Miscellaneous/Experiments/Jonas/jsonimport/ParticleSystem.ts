namespace fromJSON {
  import f = FudgeCore;
  import fAid = FudgeAid;

  export interface ParticleData {
    // tslint:disable
    [key: string]: any;
  }

  export let data: ParticleData = {
    "x-coordinate": {
      "operation": "multiplication",
      "arguments": [
        {
          "operation": "polynomial3",
          "arguments": [
            {
              "operation": "modulo",
              "arguments": [
                {
                  "operation": "addition",
                  "arguments": [
                    {
                      "operation": "multiplication",
                      "arguments": [
                        "index",
                        {
                          "operation": "division",
                          "arguments": [
                            1,
                            "size"
                          ]
                        }
                      ]
                    },
                    {
                      "operation": "modulo",
                      "arguments": [
                        "time",
                        1
                      ]
                    }
                  ]
                },
                1
              ]
            },
            -2,
            2,
            0,
            0
          ]
        },
        {
          "operation": "random",
          "arguments": [
            "index"
          ]
        }
      ]
    },
    "y-coordinate": {
      // "operation": "addition",
      // "arguments": [
      //   {
      "operation": "modulo",
      "arguments": [
        {
          "operation": "addition",
          "arguments": [
            {
              "operation": "multiplication",
              "arguments": [
                "index",
                {
                  "operation": "division",
                  "arguments": [
                    1,
                    "size"
                  ]
                }
              ]
            },
            {
              "operation": "modulo",
              "arguments": [
                "time",
                1
              ]
            }
          ]
        },
        1
      ]
    }
    // // {
    // //   "operation": "parabola",
    // //   "arguments": [
    // //     9.81,
    // //     "time"
    // //   ],
    // //   "global": true
    // // }
    // // ]
    // // }
  };


  // enum OPERATION {
  //   MULTIPLICATION = "Multiplication",
  //   ADDITION = "Addition",
  //   DIVISION = "Division",
  //   MODULO = "Modulo",
  //   POLYNOM3 = "polynom3",
  //   RANDOM = "random"
  // }

  // interface Composite {
  //   operation: OPERATION;
  //   arguments: (number | string | Composite)[];
  // }

  // abstract class ClosureComponent {
  //   public abstract getClosure(): Function;
  // }

  // class ClosureComposite extends ClosureComponent {
  //   private components: ClosureComponent[] = [];
  //   public getClosure(): Function {
  //     return createClosureAddition(this.components[0].getClosure(), this.components[1].getClosure())
  //   }
  // }

  // class ClosureLeaf extends ClosureComponent {
  //   private value: number;

  //   constructor(_value: number) {
  //     super();
  //     this.value = _value;
  //   }

    // public getClosure(): Function {
    //   let v: number = this.value;
    //   return function value(): number {
    //     return v;
    //   };
    // }
  // }

  export class ParticleSystem extends f.Node {
    private particles: f.Node[];
    private randomNumbers: number[] = [];
    private size: number;
    private funcX: Closure;
    private funcY: Closure;

    constructor(_mesh: f.Mesh, _material: f.Material, _transform: f.Matrix4x4, _numberOfParticles: number, _speed: number, _a: number, _b: number, _c: number, _d: number, _scaleXMin: number, _scaleXMax: number) {
      super("Particles");
      this.addComponent(new f.ComponentTransform());
      this.cmpTransform.local = _transform;

      for (let i: number = 0; i < _numberOfParticles; i++) {
        this.addChild(this.createParticle(_mesh, _material));
      }
      this.particles = this.getChildrenByName("Particle");

      for (let i: number = 0; i < 1000; i++) {
        this.randomNumbers.push(Math.random());
      }

      this.size = this.particles.length;
      this.funcX = parseOperation(data["x-coordinate"]);
      this.funcY = parseOperation(data["y-coordinate"]);

    }

    public update(_time: number): void {
      for (let index: number = 0, length: number = this.particles.length; index < length; ++index) {
        let x: number = this.funcX(_time, index, this.size, this.randomNumbers);
        let y: number = this.funcY(_time, index, this.size, this.randomNumbers);
        let z: number = 0;
        let translation: f.Vector3 = new f.Vector3(x, y, z);
        this.particles[index].mtxLocal.translation = translation;
      }
    }

    // private polynom3(_x: number, _a: number, _b: number, _c: number, _d: number): number {
    //   return _a * Math.pow(_x, 3) + _b * Math.pow(_x, 2) + _c * _x + _d;
    // }

    private createParticle(_mesh: f.Mesh, _material: f.Material): f.Node {
      let node: f.Node = new fAid.Node("Particle", f.Matrix4x4.IDENTITY(), _material, _mesh);
      node.getComponent(f.ComponentMesh).pivot.scale(new f.Vector3(0.05, 0.05, 0.05));
      return node;
    }

    // private randomNumberFrom(_index: number, _min: number, _max: number): number {
    //   return this.randomNumbers[_index] * (_max - _min) + _min;
    // }

    // private generateClosure(_filename: string): void {
    //   let file: XMLHttpRequest = new XMLHttpRequest();
    //   file.open("GET", _filename, false);
    //   file.send();
    //   let root: Composite = JSON.parse(file.responseText);
    // }

    // private traverseTree(_composite: Composite): void {
    //   let closure: Function;
    //   switch (_composite.operation) {
    //     case OPERATION.ADDITION:
    //       closure = createClosureAddition(_composite.arguments[0], _composite.arguments[1])
    //       break;
    //   }
    // }
  }


  interface Closure {
    (_time: number, _index: number, _size: number, _randomNumbers: number[]): number;
  }

  // for (let dim in data) {
  //   console.groupCollapsed(dim);
  //   let closure: Closure = parseOperation(data[dim]);
  //   console.groupEnd();
  //   console.log("Created", closure);
  //   console.log(closure(1.5, 0, 1, [0.1, 1, 0.5]));
  // }

  function parseOperation(_data: ParticleData): Closure {
    let op: string = _data["operation"];
    let args: (ParticleData | string | number)[] = _data["arguments"];
    if (!op) {
      console.log("Error, no operation defined");
      return null;
    }
    // console.log(op);
    // console.log(args);

    let parameters: Function[] = [];

    for (let arg of args) {
      switch (typeof (arg)) {
        case "object":
          console.log("Operation", arg);
          let result: Function = parseOperation(<ParticleData>arg);
          parameters.push(result);
          break;
        case "string":
          console.log("String", arg);
          let varFunction: Function;
          switch (arg) {
            case "time":
              varFunction = function (_time: number, _index: number, _size: number, _randomNumbers: number[]): number {
                console.log("Variable", arg);
                return _time;
              };
              break;
            case "index":
              varFunction = function (_time: number, _index: number, _size: number, _randomNumbers: number[]): number {
                console.log("Variable", arg);
                return _index;
              };
              break;
            case "size":
              varFunction = function (_time: number, _index: number, _size: number, _randomNumbers: number[]): number {
                console.log("Variable", arg);
                return _size;
              };
              break;
          }
          parameters.push(varFunction);
          break;
        case "number":
          console.log("Number", arg);
          parameters.push(function (): number {
            console.log("Constant", arg);
            return <number>arg;
          });
          break;
      }
    }

    let closure: Closure = createClosureFromOperation(op, parameters);
    return closure;
  }

  // function createClosure(() => {}): Closure {
  //   let closure: Closure = function (/* input parameter */ _time: number, _index: number): number {

  //   };
  //   return closure;
  // }

  function createClosureFromOperation(_operation: string, _parameters: Function[]): Closure {
    let closure: Closure;
    switch (_operation) {
      case "addition":
        closure = createClosureAddition(_parameters);
        break;
      case "multiplication":
        closure = createClosureMultiplication(_parameters);
        break;
      case "division":
        closure = createClosureDivision(_parameters);
        break;
      case "modulo":
        closure = createClosureModulo(_parameters);
        break;
      case "linear":
        closure = createClosureLinear(_parameters);
        break;
      case "polynomial3":
        closure = createClosurePolynomial3(_parameters);
        break;
      case "random":
        closure = createClosureRandom(_parameters);
        break;
      default:
        console.log(`"${_operation}" is not an operation`);
        return null;
    }
    return closure;
  }

  function createClosureAddition(_parameters: Function[]): Closure {
    return function (/* input parameters */ _time: number, _index: number, _size: number, _randomNumbers: number[]): number {
      // console.group("ClosureAddition", _parameters);
      let result: number = 0;
      for (const param of _parameters) {
        result += param(_time, _index, _size, _randomNumbers);
      }
      // console.groupEnd();
      return result;
    };
  }

  function createClosureMultiplication(_parameters: Function[]): Closure {
    return function (/* input parameters */ _time: number, _index: number, _size: number, _randomNumbers: number[]): number {
      // console.group("ClosureMultiplication", _parameters);
      let result: number = 1;
      for (const param of _parameters) {
        result *= param(_time, _index, _size, _randomNumbers);
      }
      // console.groupEnd();
      return result;
    };
  }

  function createClosureDivision(_parameters: Function[]): Closure {
    return function (/* input parameters */ _time: number, _index: number, _size: number, _randomNumbers: number[]): number {
      // console.group("ClosureDivision", _parameters);
      let result: number = _parameters[0](_time, _index, _size, _randomNumbers) / _parameters[1](_time, _index, _size, _randomNumbers);
      // console.groupEnd();
      return result;
    };
  }

  function createClosureModulo(_parameters: Function[]): Closure {
    return function (/* input parameters */ _time: number, _index: number, _size: number, _randomNumbers: number[]): number {
      // console.group("ClosureModulo", _parameters);
      let result: number = _parameters[0](_time, _index, _size, _randomNumbers) % _parameters[1](_time, _index, _size, _randomNumbers);
      // console.groupEnd();
      return result;
    };
  }

  function createClosureLinear(_parameters: Function[]): Closure {
    let xStart: number = _parameters[1]();
    let xEnd: number = _parameters[2]();
    let yStart: number = _parameters[3]();
    let yEnd: number = _parameters[4]();
    return function (/* input parameters */ _time: number, _index: number, _size: number, _randomNumbers: number[]): number {
      // console.group("ClosureLinear", _parameters);
      let x: number = _parameters[0](_time, _index, _size, _randomNumbers);
      let y: number = yStart + (x - xStart) * (yEnd - yStart) / (xEnd - xStart);
      // console.groupEnd();
      return y;
    };
  }

  function createClosurePolynomial3(_parameters: Function[]): Closure {
    let a: number = _parameters[1]();
    let b: number = _parameters[2]();
    let c: number = _parameters[3]();
    let d: number = _parameters[4]();
    return function (/* input parameters */ _time: number, _index: number, _size: number, _randomNumbers: number[]): number {
      // console.group("ClosurePolynomial3", _parameters);
      let x: number = _parameters[0](_time, _index, _size, _randomNumbers);
      let y: number = a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d;
      // console.groupEnd();
      return y;
    };
  }

  function createClosureRandom(_parameters: Function[]): Closure {
    return function (/* input parameters */ _time: number, _index: number, _size: number, _randomNumbers: number[]): number {
      // console.group("ClosureRandom", _parameters);
      let result: number = _randomNumbers[_parameters[0](_time, _index, _size, _randomNumbers)];
      // console.groupEnd();
      return result;
    };
  }
}