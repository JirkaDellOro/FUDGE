namespace Import {
  // console.log(data);

  interface Closure {
    (_time: number, _index: number, _size: number, _randomNumbers: number[]): number;
  }

  interface Storage {
    [key: string]: Closure;
  }

  interface StorageEvaluated {
    [key: string]: number;
  }

  let storage: Storage = {};
  let storageEvaluated: StorageEvaluated = {};
  test();

  function test(): void {
    console.log(data);
    parseFile(data);
  }

  // for (let dim in data) {
  //   console.groupCollapsed(dim);
  //   let closure: Closure = parseOperation(data[dim]);
  //   console.groupEnd();
  //   console.log("Created", closure);
  //   console.log(closure(1.5, 0, 1, [0.1, 1, 0.5]));
  // }

  function parseFile(_data: SystemData): void {
    let time: number = 0.5;
    let index: number = 0;
    let size: number = 1;
    let randomNumbers: number[] = [1];

    for (const key in _data.particle.store) {
      storage[key] = parseOperation(_data.particle.store[key]);
    }
    let closureX: Closure = parseOperation(_data.particle.translation["x"]);
    let closureY: Closure = parseOperation(_data.particle.translation["y"]);
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

  function parseOperation(_data: ParticleClosure): Closure {
    if (!_data.operation) {
      console.log("Error, no operation defined");
      return null;
    }

    let parameters: Function[] = [];

    for (let arg of _data.arguments) {
      switch (typeof (arg)) {
        case "object":
          // console.log("Operation", arg);
          let result: Function = parseOperation(<ParticleClosure>arg);
          parameters.push(result);
          break;
        case "string":
          // console.log("String", arg);
          let varFunction: Function;
          switch (arg) {
            case "time":
              varFunction = function (_time: number, _index: number, _size: number, _randomNumbers: number[]): number {
                console.log("Variable", `"${arg}"`, _time);
                return _time;
              };
              break;
            case "index":
              varFunction = function (_time: number, _index: number, _size: number, _randomNumbers: number[]): number {
                console.log("Variable", `"${arg}"`, _index);
                return _index;
              };
              break;
            case "size":
              varFunction = function (_time: number, _index: number, _size: number, _randomNumbers: number[]): number {
                console.log("Variable", `"${arg}"`, _size);
                return _size;
              };
              break;
            default:
              if (storage[arg]) {
                varFunction = function (_time: number, _index: number, _size: number, _randomNumbers: number[]): number {
                  console.log("Storage", `"${arg}"`, storageEvaluated[<string>arg]);
                  return storageEvaluated[<string>arg];
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
          parameters.push(function (): number {
            console.log("Constant", arg);
            return <number>arg;
          });
          break;
      }
    }

    let closure: Closure = createClosureFromOperation(_data.operation, parameters);
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
        console.error(`"${_operation}" is not an operation`);
        return null;
    }
    return closure;
  }

  function createClosureAddition(_parameters: Function[]): Closure {
    return function (/* input parameters */ _time: number, _index: number, _size: number, _randomNumbers: number[]): number {
      console.group("ClosureAddition");
      let result: number = 0;
      for (const param of _parameters) {
        result += param(_time, _index, _size, _randomNumbers);
      }
      console.groupEnd();
      return result;
    };
  }

  function createClosureMultiplication(_parameters: Function[]): Closure {
    return function (/* input parameters */ _time: number, _index: number, _size: number, _randomNumbers: number[]): number {
      console.group("ClosureMultiplication");
      let result: number = 1;
      for (const param of _parameters) {
        result *= param(_time, _index, _size, _randomNumbers);
      }
      console.groupEnd();
      return result;
    };
  }

  function createClosureDivision(_parameters: Function[]): Closure {
    return function (/* input parameters */ _time: number, _index: number, _size: number, _randomNumbers: number[]): number {
      console.group("ClosureDivision");
      let result: number = _parameters[0](_time, _index, _size, _randomNumbers) / _parameters[1](_time, _index, _size, _randomNumbers);
      console.groupEnd();
      return result;
    };
  }

  function createClosureModulo(_parameters: Function[]): Closure {
    return function (/* input parameters */ _time: number, _index: number, _size: number, _randomNumbers: number[]): number {
      console.group("ClosureModulo");
      let result: number = _parameters[0](_time, _index, _size, _randomNumbers) % _parameters[1](_time, _index, _size, _randomNumbers);
      console.groupEnd();
      return result;
    };
  }

  function createClosureLinear(_parameters: Function[]): Closure {
    let xStart: number = _parameters[1]();
    let xEnd: number = _parameters[2]();
    let yStart: number = _parameters[3]();
    let yEnd: number = _parameters[4]();
    return function (/* input parameters */ _time: number, _index: number, _size: number, _randomNumbers: number[]): number {
      console.group("ClosureLinear");
      let x: number = _parameters[0](_time, _index, _size, _randomNumbers);
      let y: number = yStart + (x - xStart) * (yEnd - yStart) / (xEnd - xStart);
      console.groupEnd();
      return y;
    };
  }

  function createClosurePolynomial3(_parameters: Function[]): Closure {
    let a: number = _parameters[1]();
    let b: number = _parameters[2]();
    let c: number = _parameters[3]();
    let d: number = _parameters[4]();
    return function (/* input parameters */ _time: number, _index: number, _size: number, _randomNumbers: number[]): number {
      console.group("ClosurePolynomial3");
      let x: number = _parameters[0](_time, _index, _size, _randomNumbers);
      let y: number = a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d;
      console.groupEnd();
      return y;
    };
  }

  function createClosureRandom(_parameters: Function[]): Closure {
    return function (/* input parameters */ _time: number, _index: number, _size: number, _randomNumbers: number[]): number {
      console.group("ClosureRandom");
      let result: number = _randomNumbers[_parameters[0](_time, _index, _size, _randomNumbers)];
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
}