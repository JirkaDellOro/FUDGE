"use strict";
var fromJSON;
(function (fromJSON) {
    var f = FudgeCore;
    var fAid = FudgeAid;
    fromJSON.data = {
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
    class ParticleSystem extends f.Node {
        constructor(_mesh, _material, _transform, _numberOfParticles, _speed, _a, _b, _c, _d, _scaleXMin, _scaleXMax) {
            super("Particles");
            this.randomNumbers = [];
            this.addComponent(new f.ComponentTransform());
            this.cmpTransform.local = _transform;
            for (let i = 0; i < _numberOfParticles; i++) {
                this.addChild(this.createParticle(_mesh, _material));
            }
            this.particles = this.getChildrenByName("Particle");
            for (let i = 0; i < 1000; i++) {
                this.randomNumbers.push(Math.random());
            }
            this.size = this.particles.length;
            this.funcX = parseOperation(fromJSON.data["x-coordinate"]);
            this.funcY = parseOperation(fromJSON.data["y-coordinate"]);
        }
        update(_time) {
            for (let index = 0, length = this.particles.length; index < length; ++index) {
                let x = this.funcX(_time, index, this.size, this.randomNumbers);
                let y = this.funcY(_time, index, this.size, this.randomNumbers);
                let z = 0;
                let translation = new f.Vector3(x, y, z);
                this.particles[index].mtxLocal.translation = translation;
            }
        }
        // private polynom3(_x: number, _a: number, _b: number, _c: number, _d: number): number {
        //   return _a * Math.pow(_x, 3) + _b * Math.pow(_x, 2) + _c * _x + _d;
        // }
        createParticle(_mesh, _material) {
            let node = new fAid.Node("Particle", f.Matrix4x4.IDENTITY(), _material, _mesh);
            node.getComponent(f.ComponentMesh).pivot.scale(new f.Vector3(0.05, 0.05, 0.05));
            return node;
        }
    }
    fromJSON.ParticleSystem = ParticleSystem;
    // for (let dim in data) {
    //   console.groupCollapsed(dim);
    //   let closure: Closure = parseOperation(data[dim]);
    //   console.groupEnd();
    //   console.log("Created", closure);
    //   console.log(closure(1.5, 0, 1, [0.1, 1, 0.5]));
    // }
    function parseOperation(_data) {
        let op = _data["operation"];
        let args = _data["arguments"];
        if (!op) {
            console.log("Error, no operation defined");
            return null;
        }
        // console.log(op);
        // console.log(args);
        let parameters = [];
        for (let arg of args) {
            switch (typeof (arg)) {
                case "object":
                    console.log("Operation", arg);
                    let result = parseOperation(arg);
                    parameters.push(result);
                    break;
                case "string":
                    console.log("String", arg);
                    let varFunction;
                    switch (arg) {
                        case "time":
                            varFunction = function (_time, _index, _size, _randomNumbers) {
                                console.log("Variable", arg);
                                return _time;
                            };
                            break;
                        case "index":
                            varFunction = function (_time, _index, _size, _randomNumbers) {
                                console.log("Variable", arg);
                                return _index;
                            };
                            break;
                        case "size":
                            varFunction = function (_time, _index, _size, _randomNumbers) {
                                console.log("Variable", arg);
                                return _size;
                            };
                            break;
                    }
                    parameters.push(varFunction);
                    break;
                case "number":
                    console.log("Number", arg);
                    parameters.push(function () {
                        console.log("Constant", arg);
                        return arg;
                    });
                    break;
            }
        }
        let closure = createClosureFromOperation(op, parameters);
        return closure;
    }
    // function createClosure(() => {}): Closure {
    //   let closure: Closure = function (/* input parameter */ _time: number, _index: number): number {
    //   };
    //   return closure;
    // }
    function createClosureFromOperation(_operation, _parameters) {
        let closure;
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
    function createClosureAddition(_parameters) {
        return function (/* input parameters */ _time, _index, _size, _randomNumbers) {
            // console.group("ClosureAddition", _parameters);
            let result = 0;
            for (const param of _parameters) {
                result += param(_time, _index, _size, _randomNumbers);
            }
            // console.groupEnd();
            return result;
        };
    }
    function createClosureMultiplication(_parameters) {
        return function (/* input parameters */ _time, _index, _size, _randomNumbers) {
            // console.group("ClosureMultiplication", _parameters);
            let result = 1;
            for (const param of _parameters) {
                result *= param(_time, _index, _size, _randomNumbers);
            }
            // console.groupEnd();
            return result;
        };
    }
    function createClosureDivision(_parameters) {
        return function (/* input parameters */ _time, _index, _size, _randomNumbers) {
            // console.group("ClosureDivision", _parameters);
            let result = _parameters[0](_time, _index, _size, _randomNumbers) / _parameters[1](_time, _index, _size, _randomNumbers);
            // console.groupEnd();
            return result;
        };
    }
    function createClosureModulo(_parameters) {
        return function (/* input parameters */ _time, _index, _size, _randomNumbers) {
            // console.group("ClosureModulo", _parameters);
            let result = _parameters[0](_time, _index, _size, _randomNumbers) % _parameters[1](_time, _index, _size, _randomNumbers);
            // console.groupEnd();
            return result;
        };
    }
    function createClosureLinear(_parameters) {
        let xStart = _parameters[1]();
        let xEnd = _parameters[2]();
        let yStart = _parameters[3]();
        let yEnd = _parameters[4]();
        return function (/* input parameters */ _time, _index, _size, _randomNumbers) {
            // console.group("ClosureLinear", _parameters);
            let x = _parameters[0](_time, _index, _size, _randomNumbers);
            let y = yStart + (x - xStart) * (yEnd - yStart) / (xEnd - xStart);
            // console.groupEnd();
            return y;
        };
    }
    function createClosurePolynomial3(_parameters) {
        let a = _parameters[1]();
        let b = _parameters[2]();
        let c = _parameters[3]();
        let d = _parameters[4]();
        return function (/* input parameters */ _time, _index, _size, _randomNumbers) {
            // console.group("ClosurePolynomial3", _parameters);
            let x = _parameters[0](_time, _index, _size, _randomNumbers);
            let y = a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d;
            // console.groupEnd();
            return y;
        };
    }
    function createClosureRandom(_parameters) {
        return function (/* input parameters */ _time, _index, _size, _randomNumbers) {
            // console.group("ClosureRandom", _parameters);
            let result = _randomNumbers[_parameters[0](_time, _index, _size, _randomNumbers)];
            // console.groupEnd();
            return result;
        };
    }
})(fromJSON || (fromJSON = {}));
//# sourceMappingURL=ParticleSystem.js.map