namespace Import {
  console.log(data);

  interface Closure {
    (_time: number, _index: number, _size: number, _randomNumbers: number[]): number;
  }

  for (let dim in data) {
    console.groupCollapsed(dim);
    let closure: Closure = parseOperation(data[dim]);
    console.groupEnd();
    console.log("Created", closure);
    console.log(closure(1.5, 0, 1, [0.1, 1, 0.5]));
  }

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
      console.group("ClosureAddition", _parameters);
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
      console.group("ClosureMultiplication", _parameters);
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
      console.group("ClosureDivision", _parameters);
      let result: number = _parameters[0](_time, _index, _size, _randomNumbers) / _parameters[1](_time, _index, _size, _randomNumbers);
      console.groupEnd();
      return result;
    };
  }

  function createClosureModulo(_parameters: Function[]): Closure {
    return function (/* input parameters */ _time: number, _index: number, _size: number, _randomNumbers: number[]): number {
      console.group("ClosureModulo", _parameters);
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
      console.group("ClosureLinear", _parameters);
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
      console.group("ClosurePolynomial3", _parameters);
      let x: number = _parameters[0](_time, _index, _size, _randomNumbers);
      let y: number = a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d;
      console.groupEnd();
      return y;
    };
  }

  function createClosureRandom(_parameters: Function[]): Closure {
    return function (/* input parameters */ _time: number, _index: number, _size: number, _randomNumbers: number[]): number {
      console.group("ClosureRandom", _parameters);
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