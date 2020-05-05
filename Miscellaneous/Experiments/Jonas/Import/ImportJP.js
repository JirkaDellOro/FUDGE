"use strict";
var Import;
(function (Import) {
    // console.log(data);
    let storage = {};
    let storageEvaluated = {};
    test();
    function test() {
        console.log(Import.data);
        parseFile(Import.data);
    }
    // for (let dim in data) {
    //   console.groupCollapsed(dim);
    //   let closure: Closure = parseOperation(data[dim]);
    //   console.groupEnd();
    //   console.log("Created", closure);
    //   console.log(closure(1.5, 0, 1, [0.1, 1, 0.5]));
    // }
    function parseFile(_data) {
        let time = 0.5;
        let index = 0;
        let size = 1;
        let randomNumbers = [1];
        for (const key in _data.particle.store) {
            storage[key] = parseOperation(_data.particle.store[key]);
        }
        let closureX = parseOperation(_data.particle.translation["x"]);
        let closureY = parseOperation(_data.particle.translation["y"]);
        for (const key in storage) {
            console.groupCollapsed(`Evaluate storage "${key}"`);
            storageEvaluated[key] = storage[key](time, index, size, randomNumbers);
            console.log(`Stored "${key}"`, storageEvaluated[key]);
            console.groupEnd();
        }
        console.groupCollapsed("Evaluate x");
        console.log("x =", closureX(time, index, size, randomNumbers));
        console.groupEnd();
        console.groupCollapsed("Evaluate y");
        console.log("y =", closureY(time, index, size, randomNumbers));
        console.groupEnd();
    }
    function parseOperation(_data) {
        if (!_data.operation) {
            console.log("Error, no operation defined");
            return null;
        }
        let parameters = [];
        for (let arg of _data.arguments) {
            switch (typeof (arg)) {
                case "object":
                    // console.log("Operation", arg);
                    let result = parseOperation(arg);
                    parameters.push(result);
                    break;
                case "string":
                    // console.log("String", arg);
                    let varFunction;
                    switch (arg) {
                        case "time":
                            varFunction = function (_time, _index, _size, _randomNumbers) {
                                console.log("Variable", `"${arg}"`, _time);
                                return _time;
                            };
                            break;
                        case "index":
                            varFunction = function (_time, _index, _size, _randomNumbers) {
                                console.log("Variable", `"${arg}"`, _index);
                                return _index;
                            };
                            break;
                        case "size":
                            varFunction = function (_time, _index, _size, _randomNumbers) {
                                console.log("Variable", `"${arg}"`, _size);
                                return _size;
                            };
                            break;
                        default:
                            if (storage[arg]) {
                                varFunction = function (_time, _index, _size, _randomNumbers) {
                                    console.log("Storage", `"${arg}"`, storageEvaluated[arg]);
                                    return storageEvaluated[arg];
                                };
                            }
                            else {
                                console.error(`"${arg}" is not defined`);
                                return null;
                            }
                    }
                    parameters.push(varFunction);
                    break;
                case "number":
                    // console.log("Number", arg);
                    parameters.push(function () {
                        console.log("Constant", arg);
                        return arg;
                    });
                    break;
            }
        }
        let closure = createClosureFromOperation(_data.operation, parameters);
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
                console.error(`"${_operation}" is not an operation`);
                return null;
        }
        return closure;
    }
    function createClosureAddition(_parameters) {
        return function (/* input parameters */ _time, _index, _size, _randomNumbers) {
            console.group("ClosureAddition");
            let result = 0;
            for (const param of _parameters) {
                result += param(_time, _index, _size, _randomNumbers);
            }
            console.groupEnd();
            return result;
        };
    }
    function createClosureMultiplication(_parameters) {
        return function (/* input parameters */ _time, _index, _size, _randomNumbers) {
            console.group("ClosureMultiplication");
            let result = 1;
            for (const param of _parameters) {
                result *= param(_time, _index, _size, _randomNumbers);
            }
            console.groupEnd();
            return result;
        };
    }
    function createClosureDivision(_parameters) {
        return function (/* input parameters */ _time, _index, _size, _randomNumbers) {
            console.group("ClosureDivision");
            let result = _parameters[0](_time, _index, _size, _randomNumbers) / _parameters[1](_time, _index, _size, _randomNumbers);
            console.groupEnd();
            return result;
        };
    }
    function createClosureModulo(_parameters) {
        return function (/* input parameters */ _time, _index, _size, _randomNumbers) {
            console.group("ClosureModulo");
            let result = _parameters[0](_time, _index, _size, _randomNumbers) % _parameters[1](_time, _index, _size, _randomNumbers);
            console.groupEnd();
            return result;
        };
    }
    function createClosureLinear(_parameters) {
        let xStart = _parameters[1]();
        let xEnd = _parameters[2]();
        let yStart = _parameters[3]();
        let yEnd = _parameters[4]();
        return function (/* input parameters */ _time, _index, _size, _randomNumbers) {
            console.group("ClosureLinear");
            let x = _parameters[0](_time, _index, _size, _randomNumbers);
            let y = yStart + (x - xStart) * (yEnd - yStart) / (xEnd - xStart);
            console.groupEnd();
            return y;
        };
    }
    function createClosurePolynomial3(_parameters) {
        let a = _parameters[1]();
        let b = _parameters[2]();
        let c = _parameters[3]();
        let d = _parameters[4]();
        return function (/* input parameters */ _time, _index, _size, _randomNumbers) {
            console.group("ClosurePolynomial3");
            let x = _parameters[0](_time, _index, _size, _randomNumbers);
            let y = a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d;
            console.groupEnd();
            return y;
        };
    }
    function createClosureRandom(_parameters) {
        return function (/* input parameters */ _time, _index, _size, _randomNumbers) {
            console.group("ClosureRandom");
            let result = _randomNumbers[_parameters[0](_time, _index, _size, _randomNumbers)];
            console.groupEnd();
            return result;
        };
    }
    // function checkBinaryoperation(_operation: string, _parameters: Function[]): boolean {
    //   let isBinaryoperation: boolean = _parameters.length == 2;
    //   if (!isBinaryoperation)
    //     console.log(`"${_operation}" needs exactly 2 arguments`);
    //   return isBinaryoperation;
    // }
})(Import || (Import = {}));
//# sourceMappingURL=ImportJP.js.map